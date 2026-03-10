# Plan Build App - Pawnshop Web

## Tujuan

Membangun aplikasi `pawnshop web` berdasarkan skema database pada:

- `src/core/sql/pawnshop.sql`

Dengan pendekatan:

- berbasis feature
- mengikuti pola folder dan tanggung jawab yang sudah ada di repo ini
- memisahkan `data`, `domain`, `presentation`, dan `util`
- menunda seluruh pekerjaan testing sampai flow utama selesai

---

## Acuan Guide Yang Wajib Diikuti

Plan ini mengacu pada guide berikut:

- `guides/datasource_guide.md`
- `guides/repo_guide.md`
- `guides/usecase_guide.md`
- `guides/provider_guide.md`
- `guides/viewmodel_simple_guide.md`
- `guides/viewmodel_middle_guide.md`
- `guides/service_guide.md`
- `guides/screen_guide.md`
- `guides/log_error_guilde.md`

Catatan:

- guide testing sengaja tidak dimasukkan ke scope implementasi awal
- contoh pada beberapa guide memakai Flutter/Dart, tetapi prinsip arsitekturnya tetap dipakai untuk implementasi Vue/TypeScript di repo ini

---

## Prinsip Implementasi

### 1. Struktur per feature

Setiap feature baru harus mengikuti pola:

- `data/datasources`
- `data/repositories`
- `domain/interfaces`
- `domain/repositories`
- `domain/responses`
- `domain/usecases`
- `presentation/di`
- `presentation/view_models`
- `presentation/views`
- `util`

### 2. Datasource

Untuk setiap feature yang butuh data:

- buat `local datasource`
- buat `remote datasource`
- bila perlu data lokal terstruktur, siapkan `db/*` untuk contract table / mapper / helper database

### 3. Repository

Setiap feature wajib punya:

- repository abstract di `domain/repositories`
- repository implementation di `data/repositories`

Repository menjadi penghubung antara remote, local, dan strategi fallback.

### 4. Usecase

Gunakan pola:

- satu file = satu aksi bisnis
- penamaan file: `snake_case.usecase.ts`
- penamaan class/fungsi: `Get*`, `Create*`, `Update*`, `Delete*`

### 5. ViewModel

Gunakan aturan:

- `get*` untuk mengambil atau inisialisasi data
- `set*` untuk mengubah state lokal
- `on*` untuk action dari UI atau operasi async

Untuk feature sederhana:

- cukup `*.state.ts` dan `*.vm.ts`

Untuk feature kompleks:

- pecah menjadi `state`, `getters`, `setters`, `actions`, `persistence`, `calculations`

### 6. Service

Service hanya dipakai sebagai coordinator antar ViewModel atau antar flow UI.

Service tidak boleh menjadi tempat logika bisnis inti.

### 7. Screen / View

UI harus dipecah menjadi komponen kecil:

- page container
- list / table
- card / row item
- empty state
- loading state
- error state
- form section

### 8. Logging dan error handling

Sejak awal, tiap feature harus punya pola:

- logging error yang jelas
- fallback message untuk UI
- pemisahan error teknis dan error yang ditampilkan ke user

### 9. Testing

Testing ditunda.

Implementasi awal fokus pada:

- struktur feature
- alur CRUD utama
- build tetap aman

---

## Pemecahan Domain Berdasarkan SQL

File SQL saat ini berisi domain yang cukup besar. Implementasi tidak boleh dibuat sebagai satu feature tunggal.

Feature dipecah menjadi:

### 1. master-branch

Tabel terkait:

- `branches`
- `storage_locations`

Tujuan:

- kelola cabang
- kelola lokasi penyimpanan barang per cabang

### 2. master-investor

Tabel terkait:

- `investors`
- `branch_investors`
- `investor_capital_transactions`

Tujuan:

- kelola investor
- kelola hubungan investor dengan cabang
- kelola mutasi modal investor

### 3. auth-access

Tabel terkait:

- `roles`
- `users`
- `user_roles`
- `user_branch_assignments`
- `login_sessions`

Tujuan:

- kelola user
- kelola role
- kelola assignment user ke cabang
- riwayat login

### 4. customer

Tabel terkait:

- `customers`
- `customer_documents`
- `customer_contacts`

Tujuan:

- kelola data nasabah
- kelola dokumen identitas
- kelola kontak nasabah

### 5. item-master

Tabel terkait:

- `item_categories`
- `item_types`
- `branch_item_settings`

Tujuan:

- kelola kategori barang
- kelola tipe barang
- kelola setting margin dan deduction per cabang

### 6. pawn-contract

Tabel terkait:

- `pawn_contracts`
- `pawn_items`
- `pawn_item_accessories`
- `pawn_item_issues`
- `pawn_item_location_movements`

Tujuan:

- kelola transaksi inti gadai
- kelola barang gadai
- kelola perlengkapan barang
- kelola issue / kerusakan barang
- kelola perpindahan lokasi barang

### 7. pawn-transaction

Tabel terkait:

- `contract_payments`
- `contract_extensions`
- `auction_transactions`

Tujuan:

- pembayaran kontrak
- perpanjangan kontrak
- transaksi lelang

### 8. branch-finance

Tabel terkait:

- `branch_cash_accounts`
- `branch_cash_transactions`
- `branch_debts`
- `branch_debt_payments`
- `inter_branch_transfers`

Tujuan:

- akun kas cabang
- transaksi kas cabang
- hutang cabang
- pembayaran hutang cabang
- transfer antar cabang

### 9. support

Tabel terkait:

- `notifications`
- `audit_logs`

Tujuan:

- notifikasi sistem
- audit trail aktivitas

---

## Prioritas Build

Tidak semua feature dibangun bersamaan.

Urutan prioritas implementasi:

### Fase 0 - Fondasi aplikasi

Target:

- siapkan shell dashboard sebagai entry point utama
- siapkan route strategy untuk multi-feature
- siapkan base pattern untuk response, error, dan logging
- siapkan base pattern local DB dan remote datasource
- siapkan komponen presentasi umum yang reusable

Output minimum:

- dashboard sebagai halaman index
- struktur route global siap untuk feature tambahan
- helper logging dan error handling siap dipakai

### Fase 1 - master-branch

Target:

- list cabang
- detail cabang
- form create / update cabang
- list lokasi penyimpanan per cabang

Output minimum:

- route cabang
- CRUD cabang
- CRUD storage location

### Fase 2 - customer

Target:

- list nasabah
- detail nasabah
- form create / update nasabah
- subform dokumen
- subform kontak

Output minimum:

- route customer
- CRUD customer
- CRUD customer documents
- CRUD customer contacts

### Fase 3 - item-master

Target:

- list kategori barang
- list tipe barang
- form setting item per cabang

Output minimum:

- route item master
- CRUD kategori
- CRUD tipe
- CRUD branch item settings

### Fase 4 - pawn-contract

Ini adalah core business feature.

Target:

- list kontrak gadai
- detail kontrak
- form create kontrak
- input barang gadai
- input accessory
- input issue
- tracking lokasi barang

Output minimum:

- route pawn contract
- create contract
- add item ke contract
- tampilkan detail contract beserta item

### Fase 5 - pawn-transaction

Target:

- pembayaran kontrak
- perpanjangan
- lelang

Output minimum:

- route payment
- route extension
- route auction
- create transaction flow yang terhubung ke contract

### Fase 6 - branch-finance

Target:

- akun kas cabang
- transaksi kas
- hutang cabang
- pembayaran hutang
- transfer antar cabang

Output minimum:

- route branch finance
- CRUD akun kas
- input transaksi kas
- debt dan debt payment flow

### Fase 7 - master-investor

Target:

- investor
- kepemilikan investor di cabang
- transaksi modal investor

Output minimum:

- route investor
- CRUD investor
- CRUD relasi investor-cabang
- investor capital transactions

### Fase 8 - auth-access

Target:

- user management
- role management
- branch assignment
- session log

Output minimum:

- route users
- route roles
- role assignment
- login session list

### Fase 9 - support

Target:

- notifikasi
- audit log

Output minimum:

- route notifications
- route audit logs
- basic filter dan detail audit

---

## Batch Implementasi Yang Direkomendasikan

Untuk menghindari scope terlalu besar, pengerjaan dibagi menjadi 3 batch utama.

### Batch 1 - MVP operasional awal

Isi batch:

- fase 0
- fase 1
- fase 2
- fase 3

Tujuan:

- sistem punya master data utama untuk mulai input transaksi gadai

### Batch 2 - Core pawnshop flow

Isi batch:

- fase 4
- fase 5

Tujuan:

- sistem bisa menjalankan transaksi inti bisnis gadai

### Batch 3 - Administrasi dan support

Isi batch:

- fase 6
- fase 7
- fase 8
- fase 9

Tujuan:

- sistem lengkap untuk operasional dan kontrol internal

---

## Rencana Teknis Per Feature

Untuk setiap feature baru, urutan pengerjaan teknis wajib seperti ini:

1. analisis tabel dan relasi dari SQL
2. tentukan entity utama dan child entity
3. buat interface domain
4. buat response model yang dibutuhkan
5. buat repository abstract
6. buat local datasource
7. buat remote datasource
8. buat repository implementation
9. buat usecase CRUD utama
10. buat DI / provider file
11. buat state ViewModel
12. buat ViewModel
13. buat route feature
14. buat screen / views
15. integrasikan ke dashboard / router
16. pastikan build aman

---

## Penentuan Kompleksitas ViewModel

### Gunakan ViewModel simple jika:

- hanya list + detail + form sederhana
- state sedikit
- tidak ada perhitungan kompleks

Feature yang cocok:

- `master-branch`
- `customer`
- `item-master`
- `master-investor`

### Gunakan ViewModel middle jika:

- banyak subform
- ada child entities
- ada kalkulasi
- ada flow async multi-step
- ada persistence yang perlu dipisah dari UI

Feature yang cocok:

- `pawn-contract`
- `pawn-transaction`
- `branch-finance`

---

## Rencana Route Awal

Route awal yang direkomendasikan:

- `/dashboard`
- `/branches`
- `/branches/:id`
- `/customers`
- `/customers/:id`
- `/item-categories`
- `/item-types`
- `/pawn-contracts`
- `/pawn-contracts/:id`
- `/contract-payments`
- `/contract-extensions`
- `/auctions`
- `/branch-finance`
- `/investors`
- `/users`
- `/notifications`
- `/audit-logs`

Catatan:

- child data seperti documents, contacts, accessories, issues, dan debt payments tidak harus menjadi route utama
- child data lebih tepat menjadi subview atau section di halaman detail

---

## Data Yang Sebaiknya Menjadi Child Resource

Tidak semua tabel dibuat sebagai halaman utama.

Tabel berikut sebaiknya menjadi child resource:

- `customer_documents`
- `customer_contacts`
- `branch_investors`
- `user_roles`
- `user_branch_assignments`
- `pawn_item_accessories`
- `pawn_item_issues`
- `pawn_item_location_movements`
- `branch_debt_payments`

---

## Risiko Dan Catatan

### 1. Scope SQL terlalu luas

Solusi:

- bangun bertahap sesuai fase
- jangan implement semua tabel sekaligus

### 2. API contract belum terdefinisi

Solusi:

- anggap sementara satu resource utama per tabel utama
- detail endpoint disesuaikan saat integrasi dengan API

### 3. UI bisa cepat menjadi kompleks

Solusi:

- gunakan screen kecil
- gunakan form section reusable
- gunakan ViewModel middle hanya saat memang dibutuhkan

### 4. Local DB dan remote sync bisa berbeda kebutuhan

Solusi:

- pisahkan local dan remote datasource sejak awal
- repository bertanggung jawab pada fallback strategy

---

## Definition of Done per Fase

Sebuah fase dianggap selesai jika:

- struktur feature lengkap sesuai pola repo
- route sudah terhubung
- local datasource dan remote datasource sudah tersedia
- repository dan usecase utama sudah ada
- ViewModel sudah mengikuti naming convention
- view utama sudah tersedia
- error handling minimum sudah ada
- project masih bisa `build`

Testing belum menjadi syarat selesai pada tahap ini.

---

## Fokus Implementasi Berikutnya

Jika plan ini dijalankan, maka implementasi pertama yang direkomendasikan adalah:

1. rapikan dashboard agar menjadi shell aplikasi
2. bangun feature `master-branch`
3. bangun feature `customer`
4. bangun feature `item-master`
5. lanjut ke `pawn-contract`

Ini adalah jalur paling aman untuk membangun MVP pawnshop dari SQL yang tersedia.
