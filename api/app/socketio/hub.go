package socketio

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"strings"
	"sync"

	gosocketio "github.com/googollee/go-socket.io"
)

// Hub adalah pembungkus ringan di sekitar socket.io Server yang mengekspos
// API minimal yang diharapkan oleh bagian lain dari kode (NewHub,
// BroadcastMessage, GetClientCount). Hub juga mendukung channel test
// (`testChan`) sehingga pengujian dapat mengamati pesan yang dibroadcast
// tanpa menjalankan client socket.io yang nyata.
type Hub struct {
	server   *gosocketio.Server
	mu       sync.RWMutex
	clients  int
	testChan chan []byte
	// Provider opsional yang mengembalikan JSON yang sudah dimarshall (bytes)
	// yang merepresentasikan transaksi tertunda untuk sebuah gudang. Inisialisasi
	// router dapat menyetel ini agar hub dapat mengambil transaksi ketika
	// klien bergabung ke sebuah room.
	pendingTransactionsProvider func(uint) ([]byte, error)
}

// NewHub membuat dan memulai server socket.io serta mengembalikan pembungkus Hub.
func NewHub() *Hub {
	server := gosocketio.NewServer(nil)
	// Catatan: pertahankan pengaturan server default. CORS ditangani oleh middleware Gin.
	h := &Hub{server: server}

	server.OnConnect("/", func(s gosocketio.Conn) error {
		s.SetContext("")
		s.Join("broadcast")
		h.mu.Lock()
		h.clients++
		h.mu.Unlock()
		return nil
	})

	server.OnDisconnect("/", func(s gosocketio.Conn, reason string) {
		h.mu.Lock()
		if h.clients > 0 {
			h.clients--
		}
		h.mu.Unlock()
	})

	server.OnEvent("/", "ping", func(s gosocketio.Conn, msg string) {
		s.Emit("pong", "pong: "+msg)
	})

	// Pindahkan pendaftaran handler khusus transaksi ke file terpisah
	h.registerTransactionHandlers()

	// Mulai loop internal server socket.io
	go func() {
		if err := server.Serve(); err != nil {
			log.Printf("socketio server serve error: %v", err)
		}
	}()

	return h
}

// BroadcastMessage akan meneruskan bytes ke channel test (jika disetel)
// atau mencoba unmarshal pesan dan mengirimkannya sebagai event socket.io.
// Payload diharapkan berupa JSON dengan field "type" dan "data". Jika "type"
// ada, maka akan digunakan sebagai nama event; jika tidak, event "message"
// akan dikirimkan.
func (h *Hub) BroadcastMessage(b []byte) {
	if h.testChan != nil {
		select {
		case h.testChan <- b:
		default:
		}
		return
	}

	if h.server == nil {
		return
	}

	var m map[string]any
	if err := json.Unmarshal(b, &m); err != nil {
		h.server.BroadcastToRoom("/", "broadcast", "message", string(b))
		return
	}

	// Jika payload berisi `warehouse_id`, arahkan ke room gudang tersebut
	if v, ok := m["warehouse_id"]; ok {
		var wid uint
		switch t := v.(type) {
		case float64:
			wid = uint(t)
		case int:
			wid = uint(t)
		case int64:
			wid = uint(t)
		case uint:
			wid = t
		}
		room := fmt.Sprintf("warehouse:%d", wid)
		typ, _ := m["type"].(string)
		data := m["data"]
		if typ == "" {
			h.server.BroadcastToRoom("/", room, "message", data)
		} else {
			h.server.BroadcastToRoom("/", room, typ, data)
		}
		return
	}

	typ, _ := m["type"].(string)
	data := m["data"]
	if typ == "" {
		h.server.BroadcastToRoom("/", "broadcast", "message", data)
	} else {
		h.server.BroadcastToRoom("/", "broadcast", typ, data)
	}
}

// GetClientCount mengembalikan jumlah klien yang terhubung (best-effort).
func (h *Hub) GetClientCount() int {
	h.mu.RLock()
	defer h.mu.RUnlock()
	return h.clients
}

// SetClientCount adalah helper untuk pengujian yang menetapkan jumlah klien
// yang dilaporkan.
func (h *Hub) SetClientCount(n int) {
	h.mu.Lock()
	h.clients = n
	h.mu.Unlock()
}

// Handler mengembalikan http.Handler yang dapat dipasang ke sebuah router
// (mis. Gin).
// Jika server belum diinisialisasi (nil), handler akan mengembalikan respons
// 404 Not Found. Jika server sudah diinisialisasi, handler akan meneruskan
// ke server socket.io.
func (h *Hub) Handler() http.Handler {
	if h.server == nil {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.NotFound(w, r)
		})
	}
	// Bungkus handler server socket.io untuk menyesuaikan/memeriksa header
	// Origin sebelum websocket upgrader berjalan. Beberapa implementasi
	// websocket Upgrader menolak koneksi berdasarkan header Origin; untuk
	// pengembangan lokal izinkan origin localhost/127.0.0.1/::1. Untuk origin
	// lain, hapus header sebagai fallback (gunakan allowlist yang tepat di
	// lingkungan produksi!).
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if origin != "" {
			// Allow common local dev origins
			if strings.HasPrefix(origin, "http://localhost") || strings.HasPrefix(origin, "https://localhost") ||
				strings.HasPrefix(origin, "http://127.0.0.1") || strings.HasPrefix(origin, "https://127.0.0.1") ||
				strings.HasPrefix(origin, "http://[::1]") || strings.HasPrefix(origin, "https://[::1]") {
				// leave Origin as-is
			} else {
				// fallback: drop Origin so the upgrader can't reject the request
				r.Header.Del("Origin")
			}
		}
		h.server.ServeHTTP(w, r)
	})
}

// NewTestHub membuat instance Hub yang cocok untuk pengujian: tidak
// menjalankan server socket.io dan akan menangkap payload BroadcastMessage
// ke dalam channel yang dikembalikan sehingga pengujian dapat melakukan
// assert.
func NewTestHub() (*Hub, <-chan []byte) {
	out := make(chan []byte, 32)
	h := &Hub{testChan: out}
	return h, out
}

// SetPendingTransactionsProvider menetapkan callback yang akan dipanggil saat
// klien mengirimkan event `transaction:refresh`. Callback menerima ID
// gudang dan harus mengembalikan payload JSON yang telah dimarshall (bytes)
// untuk dibroadcast melalui BroadcastMessage. Router (atau kode inisialisasi)
// harus menyetel ini untuk menghubungkan TransactionService ke Hub.
func (h *Hub) SetPendingTransactionsProvider(fn func(uint) ([]byte, error)) {
	h.pendingTransactionsProvider = fn
}
