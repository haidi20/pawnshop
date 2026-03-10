# Penjelasan Schema `pawnshop.sql`

Dokumen ini menjelaskan fungsi setiap tabel dan field pada schema [`pawnshop.sql`](D:/projects/pawnshop/api/database/query/pawnshop.sql).

## Tujuan Pengembangan

Schema ini dibuat untuk:

- mengganti nama tabel dan field menjadi bahasa Inggris agar konsisten,
- menyusun data menjadi struktur yang lebih normal,
- mengubah field nominal dari `varchar` menjadi `DECIMAL`,
- menambahkan foreign key agar relasi lebih aman,
- memisahkan data yang sifatnya one-to-many ke tabel turunan,
- memudahkan maintenance, query, reporting, dan audit.

## Padanan Istilah Bisnis

Bagian ini membantu tim membaca nama field English dengan arti bisnis yang biasa dipakai di operasional pawnshop.

- `appraised_value`: nilai taksir barang atau kontrak.
- `disbursed_value`: nilai pencairan, yaitu dana yang diberikan ke customer.
- `storage_fee_amount`: bea simpan atau biaya simpan barang.
- `administration_fee_amount`: biaya administrasi.
- `term_days`: jangka waktu akad dalam hari.
- `maturity_date`: tanggal jatuh tempo akad.
- `extension_fee_amount`: biaya perpanjangan akad.
- `payment_type`: jenis pembayaran pada kontrak.
- `auction_sale_amount`: hasil penjualan lelang.
- `auction_fee_amount`: biaya lelang atau admin lelang.
- `refund_amount`: pengembalian dana ke customer jika ada selisih lebih.
- `current_balance`: saldo berjalan pada akun kas.
- `principal_amount`: nominal pokok hutang.
- `outstanding_amount`: sisa hutang yang belum lunas.
- `margin_rate`: persentase margin.
- `deduction_rate`: persentase potongan.
- `ownership_percentage`: persentase kepemilikan investor pada cabang.

## Contoh Desain Penting

Beberapa kebutuhan data memang lebih tepat disimpan dengan pola one-to-many. Contohnya, aksesori barang tidak disimpan sebagai beberapa kolom tetap, tetapi dipindahkan ke tabel terpisah agar jumlah aksesori bisa fleksibel.

Di schema ini, kebutuhan tersebut ditangani dengan tabel `pawn_item_accessories`, sehingga satu barang bisa punya banyak aksesori tanpa perlu mengubah struktur tabel utama.

Pola yang sama juga diterapkan pada:

- dokumen nasabah,
- kontak nasabah,
- masalah/kekurangan barang,
- histori perpindahan lokasi barang,
- pembayaran hutang,
- pembayaran kontrak,
- histori perpanjangan akad.

## Penjelasan Tabel dan Field

### 1. `branches`

Fungsi:
Menyimpan master data cabang.

Kegunaan bisnis:
Tabel ini dipakai sebagai titik pusat operasional. Hampir semua transaksi di sistem mengacu ke cabang, seperti kontrak gadai, kas, hutang, investor, lokasi penyimpanan, dan notifikasi.

Contoh penggunaan:
Saat perusahaan membuka Cabang Makassar, data cabang dibuat di tabel ini. Setelah itu user bisa ditempatkan ke cabang tersebut, kontrak dibuat atas nama cabang itu, dan saldo kas cabang juga dicatat berdasarkan data ini.

Field:

- `id`: primary key internal cabang.
- `branch_code`: kode unik cabang yang dipakai aplikasi.
- `branch_number`: nomor cabang jika perusahaan memakai penomoran resmi.
- `branch_name`: nama cabang.
- `phone_number`: nomor telepon cabang.
- `address`: alamat lengkap cabang.
- `is_active`: penanda apakah cabang masih aktif digunakan.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 2. `investors`

Fungsi:
Menyimpan master data investor.

Kegunaan bisnis:
Tabel ini dipakai untuk mencatat pihak yang menanamkan modal ke bisnis pawnshop. Data investor diperlukan agar modal masuk, modal keluar, dan relasi investor ke cabang bisa dilacak dengan jelas.

Contoh penggunaan:
Saat ada investor bernama Budi menanam dana ke Cabang A, identitas Budi disimpan di tabel ini. Setelah itu relasi investasinya dicatat di `branch_investors`, dan transaksi modalnya dicatat di `investor_capital_transactions`.

Field:

- `id`: primary key internal investor.
- `investor_code`: kode unik investor.
- `full_name`: nama lengkap investor.
- `phone_number`: nomor telepon investor.
- `address`: alamat investor.
- `is_active`: penanda apakah investor masih aktif.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 3. `branch_investors`

Fungsi:
Menghubungkan cabang dengan investor. Tabel ini dipakai jika satu cabang bisa terkait ke satu atau lebih investor.

Kegunaan bisnis:
Tabel ini dibutuhkan ketika struktur modal cabang tidak berdiri sendiri, tetapi didanai oleh satu atau beberapa investor. Dengan tabel ini, sistem bisa membedakan siapa investor aktif di cabang tertentu dan sejak kapan relasinya berlaku.

Contoh penggunaan:
Jika Cabang B dibiayai oleh dua investor dengan porsi berbeda, masing-masing relasi dicatat di tabel ini lengkap dengan `ownership_percentage` dan `start_date`.

Field:

- `id`: primary key relasi.
- `branch_id`: referensi ke tabel `branches`.
- `investor_id`: referensi ke tabel `investors`.
- `ownership_percentage`: persentase kepemilikan investor pada cabang jika diperlukan.
- `start_date`: tanggal mulai relasi investor pada cabang.
- `end_date`: tanggal akhir relasi jika sudah tidak berlaku.
- `is_primary`: penanda investor utama untuk cabang tersebut.
- `notes`: catatan tambahan.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 4. `roles`

Fungsi:
Menyimpan daftar role sistem, misalnya admin, cashier, manager, investor viewer, dan sebagainya.

Kegunaan bisnis:
Tabel ini dipakai untuk membedakan hak akses user di dalam sistem. Dengan role yang terstruktur, aplikasi lebih mudah mengatur siapa yang boleh membuat akad, melihat laporan, atau membaca data investor.

Contoh penggunaan:
User kasir bisa diberi role `cashier`, sementara supervisor diberi role `manager`, lalu masing-masing menu di aplikasi dibatasi berdasarkan role tersebut.

Field:

- `id`: primary key role.
- `role_code`: kode unik role.
- `role_name`: nama role yang mudah dibaca.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 5. `users`

Fungsi:
Menyimpan akun pengguna aplikasi.

Kegunaan bisnis:
Tabel ini menjadi identitas seluruh orang yang memakai sistem, baik admin pusat, petugas cabang, kasir, maupun supervisor. Semua aktivitas yang perlu jejak pembuat data akan mengacu ke user dari tabel ini.

Contoh penggunaan:
Saat menambah petugas baru di cabang, akun login dibuat di tabel ini. User tersebut kemudian diberi role dan ditempatkan ke cabang tertentu.

Field:

- `id`: primary key user.
- `username`: username unik untuk login.
- `password_hash`: hash password, bukan password plaintext.
- `full_name`: nama lengkap user.
- `email`: email user jika ada.
- `phone_number`: nomor telepon user.
- `remember_token`: token untuk fitur sesi persisten jika dipakai.
- `is_active`: penanda apakah akun aktif.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 6. `user_roles`

Fungsi:
Tabel pivot untuk relasi many-to-many antara user dan role.

Kegunaan bisnis:
Tabel ini dipakai jika satu user bisa punya lebih dari satu peran. Ini penting untuk organisasi yang tidak selalu punya pembagian tugas kaku.

Contoh penggunaan:
Seorang supervisor yang juga boleh input transaksi dapat memiliki role `manager` dan `cashier` sekaligus melalui tabel ini.

Field:

- `user_id`: referensi ke tabel `users`.
- `role_id`: referensi ke tabel `roles`.
- `created_at`: waktu role diberikan ke user.

### 7. `user_branch_assignments`

Fungsi:
Menyimpan penempatan user ke cabang.

Kegunaan bisnis:
Tabel ini dipakai untuk mengetahui user bekerja di cabang mana, sejak kapan, dan apakah penugasannya masih aktif. Ini penting untuk kontrol akses berbasis cabang dan histori mutasi karyawan.

Contoh penggunaan:
Saat seorang kasir dipindahkan dari Cabang A ke Cabang B, sistem tidak perlu mengubah data user utama. Cukup tutup assignment lama dan buat assignment baru di tabel ini.

Field:

- `id`: primary key assignment.
- `user_id`: referensi ke user.
- `branch_id`: referensi ke cabang.
- `is_primary`: penanda cabang utama untuk user tersebut.
- `assigned_at`: waktu mulai penempatan.
- `unassigned_at`: waktu penempatan berakhir.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 8. `login_sessions`

Fungsi:
Menyimpan histori login dan logout user.

Kegunaan bisnis:
Tabel ini dipakai untuk audit keamanan, monitoring sesi aktif, dan pelacakan aktivitas login yang mencurigakan. Data ini juga berguna jika aplikasi perlu memaksa logout atau memeriksa sesi yang masih berjalan.

Contoh penggunaan:
Jika ada komplain akun dipakai dari perangkat lain, tim bisa memeriksa token sesi, IP address, dan waktu login dari tabel ini.

Field:

- `id`: primary key sesi login.
- `user_id`: referensi ke user yang login.
- `session_token`: token unik sesi.
- `ip_address`: alamat IP user saat login.
- `user_agent`: identitas browser atau device.
- `login_at`: waktu login.
- `logout_at`: waktu logout, boleh kosong jika sesi masih aktif.
- `session_status`: status sesi, misalnya aktif, ditutup, atau expired.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 9. `customers`

Fungsi:
Menyimpan master data nasabah.

Kegunaan bisnis:
Tabel ini adalah identitas utama customer yang menggadaikan barang. Semua kontrak gadai akan mengacu ke data customer di sini.

Contoh penggunaan:
Saat nasabah baru datang untuk gadai pertama kali, datanya dibuat di tabel ini sebelum kontrak dan data barang dicatat.

Field:

- `id`: primary key customer.
- `customer_code`: kode unik customer.
- `full_name`: nama lengkap customer.
- `gender`: jenis kelamin.
- `birth_date`: tanggal lahir.
- `city`: kota customer.
- `address`: alamat lengkap customer.
- `customer_status`: status customer, misalnya aktif atau diblokir.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 10. `customer_documents`

Fungsi:
Menyimpan identitas customer secara one-to-many. Satu customer bisa punya KTP, SIM, paspor, atau dokumen lain.

Kegunaan bisnis:
Tabel ini dipakai karena satu customer bisa memiliki lebih dari satu dokumen identitas. Dengan model ini, sistem tidak terkunci hanya pada satu jenis identitas.

Contoh penggunaan:
Seorang customer bisa punya KTP sebagai dokumen utama dan SIM sebagai dokumen tambahan, keduanya disimpan di tabel ini.

Field:

- `id`: primary key dokumen.
- `customer_id`: referensi ke customer.
- `document_type`: jenis dokumen, misalnya KTP atau SIM.
- `document_number`: nomor dokumen.
- `is_primary`: penanda dokumen utama.
- `issued_date`: tanggal terbit dokumen jika diperlukan.
- `expired_date`: tanggal kadaluarsa dokumen jika ada.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 11. `customer_contacts`

Fungsi:
Menyimpan kontak customer secara one-to-many.

Kegunaan bisnis:
Tabel ini dipakai untuk menampung nomor telepon, WhatsApp, email, atau kontak lain tanpa membatasi hanya satu kolom kontak.

Contoh penggunaan:
Customer bisa memiliki nomor ponsel pribadi dan nomor keluarga yang sama-sama disimpan sebagai kontak terpisah.

Field:

- `id`: primary key kontak.
- `customer_id`: referensi ke customer.
- `contact_type`: jenis kontak, misalnya phone, whatsapp, email.
- `contact_value`: isi kontak.
- `is_primary`: penanda kontak utama.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 12. `item_categories`

Fungsi:
Menyimpan kategori barang gadai tingkat atas.

Kegunaan bisnis:
Tabel ini dipakai untuk mengelompokkan barang dalam kelompok besar agar laporan dan pengaturan bisnis lebih mudah disusun.

Contoh penggunaan:
Barang seperti laptop dan handphone bisa masuk kategori `electronics`, sedangkan motor masuk kategori `vehicles`.

Field:

- `id`: primary key kategori.
- `category_code`: kode unik kategori.
- `category_name`: nama kategori, misalnya electronics atau vehicles.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 13. `item_types`

Fungsi:
Menyimpan jenis barang yang lebih spesifik di bawah kategori.

Kegunaan bisnis:
Tabel ini dipakai saat bisnis membutuhkan klasifikasi barang yang lebih detail daripada kategori umum. Pengaturan margin dan penilaian bisa dibuat lebih spesifik berdasarkan tipe barang.

Contoh penggunaan:
Di bawah kategori `electronics`, sistem bisa memiliki tipe `smartphone`, `laptop`, dan `tablet`.

Field:

- `id`: primary key jenis barang.
- `category_id`: referensi ke kategori induk.
- `type_code`: kode unik jenis barang.
- `type_name`: nama jenis barang, misalnya smartphone, motorcycle, laptop.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 14. `storage_locations`

Fungsi:
Menyimpan master lokasi penyimpanan barang.

Kegunaan bisnis:
Tabel ini dipakai untuk mengatur tempat fisik atau logis penyimpanan barang agar posisi barang bisa ditelusuri. Ini penting untuk operasional gudang dan audit stok barang gadai.

Contoh penggunaan:
Barang bisa dipindahkan dari `front_office_shelf` ke `main_warehouse_rack_a1`, dan lokasi-lokasi itu didefinisikan di tabel ini.

Field:

- `id`: primary key lokasi.
- `branch_id`: referensi ke cabang, boleh kosong jika lokasi bersifat global.
- `location_code`: kode unik lokasi.
- `location_name`: nama lokasi.
- `location_type`: tipe lokasi, misalnya office, warehouse, vault.
- `is_active`: penanda apakah lokasi masih aktif.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 15. `pawn_contracts`

Fungsi:
Menyimpan data utama akad atau kontrak gadai.

Kegunaan bisnis:
Tabel ini adalah inti transaksi pawnshop. Semua informasi pokok tentang akad, nilai taksir, pencairan, status, dan nasabah direkam di sini.

Contoh penggunaan:
Saat customer menggadaikan barang, sistem membuat satu kontrak baru di tabel ini yang terhubung ke cabang, customer, user pembuat, dan item yang digadaikan.

Field:

- `id`: primary key kontrak.
- `contract_number`: nomor kontrak yang tampil ke user atau dokumen.
- `branch_id`: cabang tempat kontrak dibuat.
- `customer_id`: customer pemilik kontrak.
- `contract_date`: tanggal akad.
- `maturity_date`: tanggal jatuh tempo.
- `term_days`: jangka waktu akad dalam hari.
- `appraised_value`: nilai taksir total kontrak.
- `disbursed_value`: total nilai pencairan ke customer.
- `storage_fee_amount`: total bea simpan atau biaya simpan barang pada kontrak.
- `administration_fee_amount`: total biaya administrasi kontrak.
- `payment_option_days`: opsi tenor pembayaran jika ada pengaturan khusus.
- `amount_in_words`: nominal dalam bentuk terbilang.
- `contract_status`: status kontrak.
- `maintenance_required`: penanda apakah ada kebutuhan maintenance atau perlakuan khusus.
- `maintenance_report`: catatan maintenance.
- `notes`: catatan umum kontrak.
- `created_by_user_id`: user yang membuat kontrak.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 16. `pawn_items`

Fungsi:
Menyimpan barang-barang dalam satu kontrak. Satu kontrak bisa punya banyak barang.

Kegunaan bisnis:
Tabel ini dipakai karena satu kontrak tidak selalu hanya memiliki satu barang. Dengan memisahkan barang ke tabel ini, data kontrak tetap rapi dan fleksibel.

Contoh penggunaan:
Satu kontrak bisa berisi satu motor dan satu BPKB pendukung, atau beberapa unit barang elektronik, masing-masing dicatat sebagai baris terpisah di tabel ini.

Field:

- `id`: primary key barang.
- `contract_id`: referensi ke kontrak.
- `item_sequence`: urutan barang di dalam kontrak.
- `item_name`: nama barang.
- `category_id`: referensi ke kategori barang.
- `item_type_id`: referensi ke jenis barang.
- `brand_name`: merek barang.
- `model_name`: model barang.
- `serial_number`: nomor seri jika ada.
- `item_description`: deskripsi umum barang.
- `quantity`: jumlah unit.
- `appraised_value`: nilai taksir per barang.
- `disbursed_value`: nilai pencairan per barang.
- `condition_notes`: catatan kondisi barang.
- `missing_notes`: catatan kekurangan barang secara ringkas.
- `specification_json`: spesifikasi tambahan dalam bentuk JSON jika tipe barang berbeda-beda.
- `current_location_id`: lokasi penyimpanan terakhir.
- `current_location_status`: status lokasi terakhir barang.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 17. `pawn_item_accessories`

Fungsi:
Menyimpan aksesori barang secara one-to-many.

Kegunaan bisnis:
Tabel ini dipakai agar jumlah aksesori barang tidak dibatasi oleh jumlah kolom. Ini membuat input barang jauh lebih fleksibel dan mudah dipelihara.

Contoh penggunaan:
Untuk satu handphone, aksesori seperti charger, box, kabel, dan headset bisa dicatat semua sebagai baris terpisah di tabel ini.

Field:

- `id`: primary key aksesori.
- `pawn_item_id`: referensi ke barang.
- `accessory_name`: nama aksesori, misalnya charger, box, STNK, remote.
- `accessory_condition`: kondisi aksesori.
- `notes`: catatan tambahan aksesori.
- `sort_order`: urutan tampil aksesori.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 18. `pawn_item_issues`

Fungsi:
Menyimpan daftar masalah, kekurangan, atau catatan kerusakan barang secara one-to-many.

Kegunaan bisnis:
Tabel ini dipakai untuk mendokumentasikan kondisi tidak sempurna pada barang secara terstruktur, sehingga penilaian dan audit kondisi barang lebih jelas.

Contoh penggunaan:
Jika motor memiliki lecet di body, lampu belakang mati, dan spion kiri hilang, ketiga masalah itu bisa dicatat sebagai tiga record terpisah.

Field:

- `id`: primary key masalah barang.
- `pawn_item_id`: referensi ke barang.
- `issue_name`: nama masalah, misalnya layar retak atau body lecet.
- `issue_details`: penjelasan detail masalah.
- `severity_level`: tingkat masalah jika ingin diklasifikasikan.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 19. `pawn_item_location_movements`

Fungsi:
Menyimpan histori perpindahan lokasi barang.

Kegunaan bisnis:
Tabel ini dipakai untuk memastikan sistem tidak hanya tahu lokasi terakhir barang, tetapi juga riwayat perpindahannya. Ini penting untuk audit, operasional gudang, dan penelusuran kehilangan barang.

Contoh penggunaan:
Saat barang dipindahkan dari meja front office ke gudang utama, perpindahan itu dicatat di tabel ini lengkap dengan user yang memindahkan dan waktu perpindahannya.

Field:

- `id`: primary key histori perpindahan.
- `pawn_item_id`: referensi ke barang.
- `from_location_id`: lokasi asal.
- `to_location_id`: lokasi tujuan.
- `from_status`: status lokasi asal jika perlu disimpan.
- `to_status`: status lokasi tujuan setelah dipindahkan.
- `moved_at`: waktu perpindahan.
- `moved_by_user_id`: user yang memindahkan.
- `notes`: catatan perpindahan.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 20. `contract_payments`

Fungsi:
Menyimpan semua pembayaran yang berkaitan dengan kontrak gadai.

Kegunaan bisnis:
Tabel ini dipakai untuk seluruh transaksi pembayaran pada kontrak, baik pembayaran bea simpan, pelunasan, pembayaran sebagian, maupun transaksi lain yang terkait kontrak.

Contoh penggunaan:
Saat customer membayar biaya perpanjangan atau melunasi akad, transaksi itu dicatat sebagai record baru di tabel ini.

Field:

- `id`: primary key pembayaran.
- `contract_id`: referensi ke kontrak.
- `payment_type`: jenis pembayaran, misalnya `storage_fee` untuk bea simpan, `redemption` untuk pelunasan, atau `partial_payment` untuk pembayaran sebagian.
- `payment_reference`: nomor referensi pembayaran jika ada.
- `amount`: nominal pembayaran.
- `payment_date`: tanggal dan waktu pembayaran.
- `notes`: catatan tambahan.
- `created_by_user_id`: user yang mencatat pembayaran.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 21. `contract_extensions`

Fungsi:
Menyimpan histori perpanjangan kontrak.

Kegunaan bisnis:
Tabel ini dipakai agar perpanjangan akad tidak menimpa data kontrak utama secara membabi buta. Histori tiap perpanjangan tetap tersimpan dan bisa dilacak.

Contoh penggunaan:
Jika satu kontrak diperpanjang tiga kali, maka tabel ini akan memiliki tiga record histori yang menjelaskan tanggal dan biaya setiap perpanjangan.

Field:

- `id`: primary key perpanjangan.
- `contract_id`: referensi ke kontrak.
- `extension_date`: tanggal perpanjangan.
- `previous_maturity_date`: jatuh tempo sebelumnya.
- `new_maturity_date`: jatuh tempo baru.
- `extension_term_days`: tambahan jangka waktu akad dalam hari.
- `extension_fee_amount`: biaya perpanjangan akad.
- `notes`: catatan tambahan.
- `created_by_user_id`: user yang melakukan pencatatan.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 22. `auction_transactions`

Fungsi:
Menyimpan data lelang untuk kontrak yang sudah masuk proses lelang.

Kegunaan bisnis:
Tabel ini dipakai ketika barang gadai tidak ditebus dan masuk tahap lelang. Nilai hasil lelang, biaya, dan refund ke customer dapat dikelola lebih jelas.

Contoh penggunaan:
Setelah masa jatuh tempo lewat dan barang resmi dilelang, sistem menyimpan nilai penjualan dan refund yang harus dikembalikan ke customer di tabel ini.

Field:

- `id`: primary key transaksi lelang.
- `contract_id`: referensi ke kontrak.
- `auction_date`: tanggal lelang.
- `overdue_amount`: nominal tunggakan customer pada saat masuk proses lelang.
- `auction_sale_amount`: hasil penjualan lelang.
- `auction_fee_amount`: biaya lelang atau admin lelang.
- `refund_amount`: nominal pengembalian ke customer jika ada selisih lebih.
- `notes`: catatan tambahan.
- `created_by_user_id`: user yang mencatat transaksi lelang.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 23. `branch_cash_accounts`

Fungsi:
Menyimpan akun kas per cabang. Tabel ini dipakai untuk memisahkan jenis saldo, misalnya kas utama, kas operasional, kas admin.

Kegunaan bisnis:
Tabel ini dipakai untuk membedakan beberapa pos kas di dalam satu cabang. Ini membantu laporan saldo menjadi lebih jelas dan tidak bercampur.

Contoh penggunaan:
Cabang bisa memiliki akun `MAIN_CASH`, `OPERATING_CASH`, dan `PETTY_CASH`, masing-masing dengan saldo sendiri.

Field:

- `id`: primary key akun kas.
- `branch_id`: cabang pemilik akun kas.
- `account_code`: kode akun kas.
- `account_name`: nama akun kas.
- `account_type`: tipe akun kas.
- `current_balance`: saldo terakhir atau saldo berjalan akun kas.
- `is_active`: penanda apakah akun kas masih aktif.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 24. `branch_cash_transactions`

Fungsi:
Menyimpan transaksi kas cabang secara umum.

Kegunaan bisnis:
Tabel ini dipakai sebagai buku transaksi uang masuk dan keluar cabang secara terpusat. Dengan model ini, pengeluaran administrasi, pembelian ATK, pencairan akad, dan refund bisa ditangani dengan pola yang seragam.

Contoh penggunaan:
Saat cabang membeli ATK, transaksi dicatat sebagai `debit` ke akun kas operasional. Saat cabang mencairkan dana gadai ke customer, transaksi lain dicatat dengan referensi ke kontrak terkait.

Field:

- `id`: primary key transaksi kas.
- `branch_id`: cabang tempat transaksi terjadi.
- `cash_account_id`: akun kas yang dipakai.
- `transaction_type_code`: kode jenis transaksi, misalnya admin_expense, office_supply, refund, pawn_disbursement.
- `reference_table`: nama tabel sumber jika transaksi berasal dari modul lain.
- `reference_id`: id data sumber dari modul lain.
- `entry_direction`: arah transaksi, debit atau credit.
- `amount`: nominal transaksi.
- `transaction_date`: tanggal dan waktu transaksi.
- `description`: uraian transaksi.
- `created_by_user_id`: user yang mencatat.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 25. `branch_debts`

Fungsi:
Menyimpan data hutang cabang, baik hutang ke pihak luar maupun antar cabang.

Kegunaan bisnis:
Tabel ini dipakai untuk mengelola kewajiban keuangan cabang yang belum lunas. Ini penting supaya hutang tidak hanya tercatat sebagai nominal, tetapi juga punya status, jatuh tempo, dan sumber hutang.

Contoh penggunaan:
Jika Cabang A meminjam dana dari Cabang B atau dari pihak luar untuk menutup kekurangan kas, hutang itu dicatat di tabel ini.

Field:

- `id`: primary key hutang.
- `branch_id`: cabang yang memiliki hutang.
- `creditor_branch_id`: cabang pemberi hutang jika hutang antar cabang.
- `debt_source_type`: sumber hutang, misalnya external atau inter_branch.
- `debt_reference_number`: nomor referensi hutang.
- `debt_date`: tanggal hutang dibuat.
- `principal_amount`: nominal pokok hutang.
- `outstanding_amount`: sisa hutang yang belum lunas.
- `due_date`: tanggal jatuh tempo hutang.
- `debt_status`: status hutang.
- `description`: uraian hutang.
- `created_by_user_id`: user yang mencatat hutang.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 26. `branch_debt_payments`

Fungsi:
Menyimpan pembayaran atau pelunasan hutang cabang secara one-to-many.

Kegunaan bisnis:
Tabel ini dipakai karena satu hutang bisa dibayar beberapa kali. Tanpa tabel ini, histori pembayaran akan sulit dilacak.

Contoh penggunaan:
Hutang Rp10.000.000 bisa dilunasi dalam tiga kali pembayaran, dan setiap pembayaran disimpan sebagai record terpisah di tabel ini.

Field:

- `id`: primary key pembayaran hutang.
- `debt_id`: referensi ke hutang.
- `payment_date`: tanggal dan waktu pembayaran.
- `amount`: nominal pembayaran.
- `notes`: catatan tambahan.
- `created_by_user_id`: user yang mencatat pembayaran.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 27. `inter_branch_transfers`

Fungsi:
Menyimpan perpindahan dana antar cabang.

Kegunaan bisnis:
Tabel ini dipakai ketika satu cabang perlu mengirim dana ke cabang lain. Dengan tabel ini, sistem bisa melacak asal dana, tujuan dana, status transfer, dan siapa yang mencatatnya.

Contoh penggunaan:
Cabang pusat mengirim tambahan modal sementara ke cabang baru, lalu transaksi tersebut dicatat sebagai transfer antar cabang.

Field:

- `id`: primary key transfer antar cabang.
- `source_branch_id`: cabang asal dana.
- `target_branch_id`: cabang tujuan dana.
- `transfer_number`: nomor transfer.
- `transfer_date`: tanggal dan waktu transfer.
- `amount`: nominal transfer.
- `transfer_status`: status transfer.
- `description`: catatan transfer.
- `created_by_user_id`: user yang membuat catatan transfer.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 28. `investor_capital_transactions`

Fungsi:
Menyimpan transaksi modal investor di cabang. Ini bisa dipakai untuk setoran modal, penarikan modal, tambahan modal, atau perpindahan modal.

Kegunaan bisnis:
Tabel ini dipakai untuk seluruh pergerakan modal investor. Ini penting agar sistem dapat memisahkan modal investor dari arus kas operasional biasa.

Contoh penggunaan:
Saat investor menambah modal Rp50.000.000 ke Cabang C, transaksi itu dicatat di tabel ini dengan jenis transaksi yang sesuai.

Field:

- `id`: primary key transaksi modal.
- `investor_id`: referensi ke investor.
- `branch_id`: referensi ke cabang.
- `transfer_id`: referensi ke transfer antar cabang jika transaksi berkaitan dengan mutasi dana.
- `transaction_type_code`: jenis transaksi modal.
- `transaction_date`: tanggal dan waktu transaksi.
- `amount`: nominal transaksi modal.
- `description`: uraian transaksi.
- `created_by_user_id`: user yang mencatat transaksi.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 29. `branch_item_settings`

Fungsi:
Menyimpan pengaturan margin dan potongan per cabang dan per jenis barang.

Kegunaan bisnis:
Tabel ini dipakai jika kebijakan margin dan potongan tidak sama untuk semua cabang atau semua jenis barang. Dengan begitu, perubahan bisnis bisa dilakukan lewat data, bukan hardcode.

Contoh penggunaan:
Cabang A bisa punya margin 8% untuk smartphone, sedangkan Cabang B 10%, dan keduanya dapat disimpan terpisah di tabel ini.

Field:

- `id`: primary key setting.
- `branch_id`: cabang pemilik pengaturan.
- `item_type_id`: jenis barang yang diberi pengaturan.
- `margin_rate`: persentase margin untuk jenis barang tersebut.
- `deduction_rate`: persentase potongan untuk jenis barang tersebut.
- `effective_from`: tanggal mulai berlaku.
- `effective_until`: tanggal akhir berlaku jika ada pergantian setting.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 30. `notifications`

Fungsi:
Menyimpan notifikasi sistem yang bisa terkait ke cabang, customer, atau kontrak.

Kegunaan bisnis:
Tabel ini dipakai untuk menyampaikan informasi penting di dalam sistem, seperti akad jatuh tempo, hutang yang belum lunas, atau perpindahan barang yang perlu ditindaklanjuti.

Contoh penggunaan:
Saat kontrak akan jatuh tempo dalam tiga hari, sistem bisa membuat notifikasi untuk user cabang yang bertanggung jawab.

Field:

- `id`: primary key notifikasi.
- `branch_id`: cabang terkait notifikasi.
- `customer_id`: customer terkait notifikasi.
- `contract_id`: kontrak terkait notifikasi.
- `notification_type`: jenis notifikasi.
- `message`: isi pesan notifikasi.
- `is_read`: penanda apakah notifikasi sudah dibaca.
- `read_at`: waktu notifikasi dibaca.
- `read_by_user_id`: user yang membaca notifikasi.
- `created_at`: waktu data dibuat.
- `updated_at`: waktu data terakhir diubah.

### 31. `audit_logs`

Fungsi:
Menyimpan jejak audit sistem untuk perubahan data penting.

Kegunaan bisnis:
Tabel ini dipakai untuk kebutuhan kontrol internal, investigasi, dan pelacakan perubahan data. Jika ada data yang berubah secara tidak wajar, tabel ini menjadi sumber utama untuk menelusuri siapa yang melakukan aksi tersebut.

Contoh penggunaan:
Ketika nilai pencairan kontrak diubah setelah transaksi dibuat, sistem mencatat aksi itu ke audit log beserta user, waktu, dan metadata perubahan.

Field:

- `id`: primary key audit log.
- `user_id`: user yang melakukan aksi.
- `entity_type`: nama entitas yang diubah, misalnya `pawn_contracts` atau `customers`.
- `entity_id`: id entitas yang diubah.
- `action_type`: jenis aksi, misalnya create, update, delete, approve.
- `ip_address`: alamat IP pelaku aksi.
- `action_at`: waktu aksi dilakukan.
- `summary`: ringkasan singkat aksi.
- `metadata_json`: detail tambahan dalam format JSON, misalnya data before/after.
- `created_at`: waktu log dicatat.

## Kenapa Schema Ini Lebih Mudah Di-maintain

- Repeating field dipindahkan ke tabel anak, jadi tidak perlu tambah kolom baru setiap kebutuhan berubah.
- Nilai uang memakai `DECIMAL`, jadi aman untuk perhitungan dan laporan.
- Relasi sudah memakai foreign key, jadi data yatim lebih mudah dicegah.
- Master data dan transaksi dipisah jelas.
- Audit, histori lokasi, histori pembayaran, dan histori perpanjangan sudah punya tempat khusus.
