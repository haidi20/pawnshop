# Panduan Integrasi Socket.IO (Frontend)

Panduan singkat dan lengkap untuk integrasi Socket.IO dengan backend pawnshop.
Fokus pada alur: join room per `warehouse_id`, menyimpan transaksi, dan menerima update realtime khusus untuk warehouse.

---

## Nama Event (ringkas)
- Client -> Server:
    - `join_warehouse` : { warehouse_id }
    - `leave_warehouse` : { warehouse_id }
    - `transaction:refresh` : { warehouse_id } (opsional)
- Server -> Client:
    - `joined_warehouse` : { warehouse_id, success, transactions? }
    - `left_warehouse` : { warehouse_id, success }
    - `transaction_created` : broadcast ke `warehouse:<id>` saat server membuat transaksi baru (payload = `{ transaction, details }`)
    - `transaction_refreshed` : ack ke requester setelah `transaction:refresh` ({ warehouse_id, success, transactions? })
    - `transactions_refreshed` : broadcast ke `warehouse:<id>` berisi array transaksi

> Catatan: semua event di atas adalah Socket.IO (realtime), bukan route HTTP. HTTP API tetap tersedia (mis. `POST /api/v1/transaction` dan `GET /api/v1/pending-transactions`).

---

## Alur yang Direkomendasikan (step-by-step)

1. Koneksi socket

```js
import { io } from 'socket.io-client'
const socket = io('http://localhost:8080') // sesuaikan base URL

socket.on('connect', () => {
    // langsung gabung ke warehouse yang relevan
    socket.emit('join_warehouse', { warehouse_id: 7 })
})
```

2. Handle ack `joined_warehouse` (inisialisasi)

```js
socket.on('joined_warehouse', (ack) => {
    // ack: { warehouse_id, success, transactions? }
    if (!ack || !ack.success) {
        console.warn('gagal join warehouse', ack)
        return
    }
    if (ack.transactions) {
        // set transaksi pending awal di store
        store.commit('setPendingTransactions', ack.transactions)
    } else {
        // fallback: panggil GET /api/v1/pending-transactions jika perlu
    }
})
```

3. Listen broadcast realtime (transaksi baru dari server)

```js
// Server akan broadcast event ini ke room warehouse yang sesuai
socket.on('transaction_created', (data) => {
    // data: { transaction: {...}, details: [...] }
    store.commit('addTransaction', data.transaction)
    // bisa merge details jika perlu
})
```

4. Simpan transaksi (HTTP POST) — direkomendasikan

```js
// submit via HTTP
async function submitTransaction(payload) {
    try {
        await axios.post('/api/v1/transaction', payload)
        // Direkomendasikan: JANGAN emit transaction:refresh di sini.
        // Server akan broadcast `transaction_created` ke room warehouse,
        // dan client yang sudah join room akan menerima event tersebut.
    } catch (err) {
        // handle error
    }
}
```

5. (Opsional) Refresh manual via socket

Jika ingin memaksa refresh dari client:

```js
socket.emit('transaction:refresh', { warehouse_id: 7 })

// requester akan menerima ack
socket.on('transaction_refreshed', (ack) => {
    if (ack.success && ack.transactions) {
        store.commit('setPendingTransactions', ack.transactions)
    }
})

// Selain ack, server juga broadcast `transactions_refreshed` ke room
socket.on('transactions_refreshed', (transactions) => {
    store.commit('setPendingTransactions', transactions)
})
```

Dengan implementasi backend saat ini: jika emit `transaction:refresh`, server akan
memanggil provider internal (transactionService) dan broadcast hanya ke `warehouse:<id>`.

---

## Pola yang Direkomendasikan Setelah Insert

- Paling direkomendasikan: submit via HTTP (`POST /api/v1/transaction`) dan tunggu broadcast server `transaction_created`.
    - Lebih sederhana, server jadi sumber data utama.
    - Broadcast hanya ke room warehouse yang relevan.

- Opsional: update optimis di FE:
    - Langsung tambahkan transaksi sementara di UI agar responsif.
    - Saat `transaction_created` dari server tiba, replace entry sementara dengan data dari server (server kasih id/sequence/timestamp asli).

- Tidak perlu emit `transaction:refresh` setiap kali create. Pakai hanya jika perlu list transaksi yang benar-benar fresh.

---

## Bentuk Payload (contoh nyata)

- `join_warehouse` -> `{ "warehouse_id": 7 }`
- `joined_warehouse` -> `{ "warehouse_id": 7, "success": true, "transactions": [ ... ] }`
- `transaction_created` -> `{ transaction: {...}, details: [...] }` (broadcast ke room warehouse)
- `transaction:refresh` -> `{ "warehouse_id": 7 }` (client -> server)
- `transaction_refreshed` -> `{ "warehouse_id":7, "success":true, "transactions": [...] }` (ack)
- `transactions_refreshed` -> `[...]` (broadcast list)

---

## Catatan Keamanan

- Server WAJIB validasi apakah user yang terkoneksi memang berhak atas `warehouse_id` yang diminta saat join atau refresh. Jangan percaya warehouse_id dari client tanpa cek server-side.
- Pakai JWT atau session cookies; validasi token di endpoint HTTP dan (jika dipakai) saat handshake Socket.IO.

---

## Contoh: Komponen Vue Minimal (pseudo)

Lihat contoh `examples/SocketTransactions.vue` (pseudo) di README ini:

```vue
<template>
    <div>
        <button @click="submit">Submit Transaksi</button>
        <ul>
            <li v-for="t in transactions" :key="t.id">{{ t.id }} - {{ t.total }}</li>
        </ul>
    </div>
</template>

<script>
import axios from 'axios'
import { socket } from '../socket' // wrapper socket kamu

export default {
    data() { return { transactions: [] } },
    created() {
        socket.emit('join_warehouse', { warehouse_id: 7 })
        socket.on('joined_warehouse', (ack) => { if (ack.transactions) this.transactions = ack.transactions })
        socket.on('transaction_created', (data) => { this.transactions.unshift(data.transaction) })
    },
    methods: {
        async submit() {
            await axios.post('/api/v1/transaction', { /* payload */ })
            // tunggu broadcast server untuk update list, atau lakukan update optimis
        }
    }
}
</script>
```

---

Jika mau, saya bisa menambahkan file contoh `SocketTransactions.vue` dan `socket.js` di folder `frontend/socketio-example` yang bisa langsung dipakai/di-copy ke project front-end. Mau saya tambahkan file contoh tersebut juga? (jawab: `ya` atau `tidak`)

# Contoh Socket.IO Vue 3 (CDN)

Ini contoh minimal untuk menghubungkan client Vue 3 ke backend Gin + Socket.IO yang di-mount di `/socket.io`.

Cara menjalankan

1. Jalankan backend (contoh):

```powershell
# dari root repo
go run main.go
```

2. Serve folder contoh supaya halaman punya origin http (direkomendasikan):

```powershell
# dari root repo (atau di dalam frontend/socketio-example)
npx http-server frontend/socketio-example -p 3000
# lalu buka http://localhost:3000
```

3. Buka halaman dan klik Connect. Default server URL adalah `http://localhost:8080` — ubah jika backend kamu jalan di host/port lain.

Catatan
- Middleware CORS backend sudah mengizinkan `http://localhost:3000` dan set `Access-Control-Allow-Credentials: true`.
- Contoh pakai `path: '/socket.io'` (backend mount handler socket.io di sana).
- Kalau mau workflow dev lokal, bisa copy ke project Vue kamu dan pakai opsi `io()` yang sama seperti di file contoh.
