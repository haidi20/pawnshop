package socketio

import (
	"encoding/json"
	"fmt"

	gosocketio "github.com/googollee/go-socket.io"
)

// registerTransactionHandlers mendaftarkan handler socket.io yang berhubungan
// dengan transaksi: join_warehouse, leave_warehouse, dan transaction:refresh.
// Fungsi ini dipisahkan ke file terpisah untuk menjaga organisasi kode.
func (h *Hub) registerTransactionHandlers() {
	if h == nil || h.server == nil {
		return
	}
	server := h.server

	// Izinkan klien untuk bergabung ke room yang spesifik untuk gudang agar
	// broadcast dapat dibatasi sesuai ruang (scoped).
	server.OnEvent("/", "join_warehouse", func(s gosocketio.Conn, payload map[string]any) {
		if payload == nil {
			// tanggapi dengan kegagalan jika payload tidak ada
			s.Emit("joined_warehouse", map[string]any{"success": false})
			return
		}
		if v, ok := payload["warehouse_id"]; ok {
			switch t := v.(type) {
			case float64:
				room := fmt.Sprintf("warehouse:%d", int(t))
				s.Join(room)
				ack := map[string]any{"warehouse_id": int(t), "success": true}
				if h.pendingTransactionsProvider != nil {
					if b, err := h.pendingTransactionsProvider(uint(int(t))); err == nil && b != nil {
						var txs any
						if err := json.Unmarshal(b, &txs); err == nil {
							ack["transactions"] = txs
						}
					}
				}
				s.Emit("joined_warehouse", ack)
				return
			case int:
				room := fmt.Sprintf("warehouse:%d", t)
				s.Join(room)
				ack := map[string]any{"warehouse_id": t, "success": true}
				if h.pendingTransactionsProvider != nil {
					if b, err := h.pendingTransactionsProvider(uint(t)); err == nil && b != nil {
						var txs any
						if err := json.Unmarshal(b, &txs); err == nil {
							ack["transactions"] = txs
						}
					}
				}
				s.Emit("joined_warehouse", ack)
				return
			case int64:
				room := fmt.Sprintf("warehouse:%d", int(t))
				s.Join(room)
				ack := map[string]any{"warehouse_id": int(t), "success": true}
				if h.pendingTransactionsProvider != nil {
					if b, err := h.pendingTransactionsProvider(uint(int(t))); err == nil && b != nil {
						var txs any
						if err := json.Unmarshal(b, &txs); err == nil {
							ack["transactions"] = txs
						}
					}
				}
				s.Emit("joined_warehouse", ack)
				return
			case uint:
				room := fmt.Sprintf("warehouse:%d", t)
				s.Join(room)
				ack := map[string]any{"warehouse_id": t, "success": true}
				if h.pendingTransactionsProvider != nil {
					if b, err := h.pendingTransactionsProvider(t); err == nil && b != nil {
						var txs any
						if err := json.Unmarshal(b, &txs); err == nil {
							ack["transactions"] = txs
						}
					}
				}
				s.Emit("joined_warehouse", ack)
				return
			}
		}
		// jika `warehouse_id` tidak ada atau tidak dikenali, tanggapi dengan kegagalan
		s.Emit("joined_warehouse", map[string]any{"success": false})
	})

	// Izinkan klien untuk meninggalkan room yang spesifik untuk gudang.
	server.OnEvent("/", "leave_warehouse", func(s gosocketio.Conn, payload map[string]any) {
		if payload == nil {
			s.Emit("left_warehouse", map[string]any{"success": false})
			return
		}
		if v, ok := payload["warehouse_id"]; ok {
			switch t := v.(type) {
			case float64:
				room := fmt.Sprintf("warehouse:%d", int(t))
				s.Leave(room)
				s.Emit("left_warehouse", map[string]any{"warehouse_id": int(t), "success": true})
				return
			case int:
				room := fmt.Sprintf("warehouse:%d", t)
				s.Leave(room)
				s.Emit("left_warehouse", map[string]any{"warehouse_id": t, "success": true})
				return
			case int64:
				room := fmt.Sprintf("warehouse:%d", int(t))
				s.Leave(room)
				s.Emit("left_warehouse", map[string]any{"warehouse_id": int(t), "success": true})
				return
			case uint:
				room := fmt.Sprintf("warehouse:%d", t)
				s.Leave(room)
				s.Emit("left_warehouse", map[string]any{"warehouse_id": t, "success": true})
				return
			}
		}
		s.Emit("left_warehouse", map[string]any{"success": false})
	})

	// Tangani permintaan refresh transaksi yang dipicu oleh klien. Broadcast
	// akan dibatasi ke room gudang yang diminta ketika `warehouse_id`
	// disertakan. Jika `pendingTransactionsProvider` dikonfigurasi, itu akan
	// digunakan untuk mengambil transaksi terbaru untuk dikembalikan dan
	// dibroadcast; jika tidak, server akan meng-echo payload klien ke room
	// yang sesuai.
	server.OnEvent("/", "transaction:refresh", func(s gosocketio.Conn, payload map[string]any) {
		var wid uint = 0
		if payload != nil {
			if v, ok := payload["warehouse_id"]; ok {
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
			}
		}

		// Jika provider tersedia, gunakan untuk mengambil transaksi terbaru
		if h.pendingTransactionsProvider != nil {
			if b, err := h.pendingTransactionsProvider(wid); err == nil && b != nil {
				var txs any
				if err := json.Unmarshal(b, &txs); err == nil {
					if wid > 0 {
						room := fmt.Sprintf("warehouse:%d", wid)
						h.server.BroadcastToRoom("/", room, "transactions_refreshed", txs)
						s.Emit("transaction_refreshed", map[string]any{"warehouse_id": wid, "success": true, "transactions": txs})
						return
					}
					// fallback: broadcast ke room `broadcast` global
					h.server.BroadcastToRoom("/", "broadcast", "transactions_refreshed", txs)
					s.Emit("transaction_refreshed", map[string]any{"warehouse_id": wid, "success": true, "transactions": txs})
					return
				}
			}
			// error atau hasil kosong dari provider: kirim acknowledgement gagal
			s.Emit("transaction_refreshed", map[string]any{"warehouse_id": wid, "success": false})
			return
		}

		// Tidak ada provider dikonfigurasi: echo payload klien dengan cakupan gudang
		if wid > 0 {
			room := fmt.Sprintf("warehouse:%d", wid)
			h.server.BroadcastToRoom("/", room, "transaction_refreshed", payload)
			s.Emit("transaction_refreshed", map[string]any{"warehouse_id": wid, "success": true, "transactions": payload})
			return
		}

		// Tidak ada gudang yang ditentukan: broadcast ke room `broadcast` global
		h.server.BroadcastToRoom("/", "broadcast", "transaction_refreshed", payload)
		s.Emit("transaction_refreshed", map[string]any{"warehouse_id": wid, "success": true, "transactions": payload})
	})
}
