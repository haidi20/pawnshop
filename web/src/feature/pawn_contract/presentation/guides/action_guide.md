# aturan tombol aksi pada tabel gadai

## aksi bayar biaya titip
D:\projects\pawnshop\web\src\feature\pawn_contract\presentation\views\pawn_contract_storage_fee.view.vue

- data dengan status belum lunas :
- muncul checkbox yang sudah di bayar tercentang warna abu - abu disabled
- muncul checkbox yang belum di bayar maka checkbox kosong dan bisa di klik untuk di bayar
- jumlah checkbox yang muncul berdasarkan jumlah lama durasi pinjaman
- tidak boleh lunas jika biaya titip belum di bayar semua
- jika di centang ke-3 maka k-2 auto centang,
- jika centang ke-2 ketika sdh tercentang dan mau melakukan uncentang, maka ke-3 auto uncentang. ini berlaku jika checkbox untuk proses pembayaran
