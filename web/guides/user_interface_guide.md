# User Interface Guide

Dokumen ini berisi panduan tema UI, sistem desain, dan standar komponen yang digunakan dalam aplikasi Accounting ini. Desain aplikasi ini terinspirasi oleh gaya **Livin' by Mandiri** yang bersih, modern, dan memberikan kesan premium.

## 1. Filosofi Desain
Aplikasi ini mengusung estetika premium dengan ciri khas:
- **Kebersihan**: Penggunaan ruang putih (white space) yang cukup untuk meningkatkan fokus.
- **Modernitas**: Sudut yang melengkung (rounded corners) pada kartu dan elemen input.
- **Interaksi Halus**: Transisi dan animasi mikro yang memberikan umpan balik visual yang menyenangkan.
- **Hierarki Visual**: Penggunaan warna dan bobot font yang jelas untuk membedakan informasi penting.

## 2. Palet Warna (Design Tokens)

Aplikasi menggunakan variabel CSS yang didefinisikan dalam `src/core/presentation/styles/main.scss`.

| Token | Nilai Hex | Penggunaan |
| :--- | :--- | :--- |
| `primary-blue` | `#005EAA` | Warna utama, tombol primer, header, sidebar aktif. |
| `accent-yellow`| `#FFD700` | Warna aksen untuk elemen yang perlu perhatian. |
| `bg-light`     | `#F2F7FA` | Latar belakang utama aplikasi. |
| `text-dark`    | `#1E293B` | Warna teks utama untuk kejelasan maksimal. |
| `text-muted`   | `#64748B` | Warna teks untuk informasi sekunder atau label. |

## 3. Tipografi
Aplikasi menggunakan font **Plus Jakarta Sans** dari Google Fonts.
- **Font Family**: `'Plus Jakarta Sans', sans-serif`
- **Variasi**:
  - `700 (Bold)`: Digunakan untuk judul (header title), nama kolom tabel, dan label tombol.
  - `600 (Semi-Bold)`: Digunakan untuk menu navigasi dan nama user.
  - `500 (Medium)`: Digunakan untuk input form.
  - `400 (Regular)`: Digunakan untuk teks isi.

## 4. Ikonografi
Ikon yang digunakan bersumber dari **Bootstrap Icons**.
- **Cara Penggunaan**: Gunakan elemen `<i>` dengan class `bi` diikuti nama ikon, contoh: `<i class="bi bi-trash-fill"></i>`.

## 5. Sistem Layout
Layout utama didefinisikan dalam `main.vue` dengan class `.admin-layout`.

- **Header (`.admin-header`)**:
  - Tinggi: `70px`.
  - Warna: Putih dengan bayangan halus (box-shadow).
  - Berisi judul aplikasi dan profil user.
- **Sidebar (`.admin-sidebar`)**:
  - Lebar: `280px` (Expanded) atau `88px` (Collapsed).
  - Radius Item: `16px`.
  - Warna Aktif: `primary-blue` dengan teks putih dan efek glow bayangan.
- **Content Area (`.admin-content`)**:
  - Padding: `32px`.
  - Latar Belakang: `bg-light`.

## 6. Komponen UI Standar

### Cards (`.card`)
- **Radius**: `20px` (`$card-radius`).
- **Shadow**: Bayangan halus yang akan membesar saat di-hover (`translateY(-4px)`).

### Tables (`.table`)
- **Header**: Latar belakang abu-abu terang (`#F8FAFC`), teks biru tua (`primary-blue`), huruf kapital, dan tebal.
- **Baris**: Padding longgar (`16px`) untuk kenyamanan membaca.

### Buttons (`.btn`)
- **Radius**: `12px` (`$input-radius`).
- **Font**: Bold (`700`).
- **Warna**: Untuk komponen yang mengikuti theme aplikasi, gunakan warna solid dari design token. Jangan gunakan gradient pada tombol atau elemen aksi bertema.
- **Efek**: Skala membesar sedikit (`scale(1.02)`) saat di-hover.

### Form Inputs (`.form-control`, `.form-select`)
- **Radius**: `12px`.
- **Border**: `1.5px solid #E2E8F0`.
- **Focus State**: Border berubah menjadi `primary-blue` dengan efek ring cahaya di sekelilingnya.

## 7. Utilitas & Interaksi
- **Transitions**: Semua interaksi menggunakan transisi halus `0.3s cubic-bezier`.
- **SweetAlert2**: Digunakan untuk dialog konfirmasi dan notifikasi status (Success/Error) dengan desain yang seragam.
- **Cursor**: Gunakan class `.cursor-pointer` untuk elemen interaktif yang bukan link/tombol default.
