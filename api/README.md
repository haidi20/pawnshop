# pawnshop

Panduan singkat untuk kontribusi dokumentasi dan Postman di proyek ini.

1. Regenerasi Swagger (lokal):

   - Jalankan PowerShell di root repository dan jalankan:

   ```powershell
   .\scripts\update_docs.ps1
   ```

   - File yang dihasilkan: `docs/swagger.json`, `docs/swagger.yaml`.

2. Menyelaraskan contoh Postman dari Swagger (lokal):

   - Setelah meregenerasi Swagger, jalankan skrip Python untuk mencoba meng-update contoh respons di Postman collection:

   ```powershell
   python .\scripts\sync_postman_from_swagger.py
   ```

   - Skrip akan berusaha menyalin example/response schema dari `docs/swagger.json` ke `postman/pawnshop.postman_collection.json`.

3. Commit perubahan:

   - Jika ada perubahan pada `docs/` atau `postman/`, commit perubahan tersebut.

4. CI automation:

   - Terdapat GitHub Actions `/.github/workflows/update-docs.yml` yang akan otomatis meregenerasi Swagger saat push ke `master`, menjalankan skrip sinkronisasi Postman, dan meng-commit perubahan jika ada.

Catatan: Skrip sinkronisasi mencoba menyalin contoh respons bila tersedia di Swagger; hasilnya mungkin perlu peninjauan manual karena mapping antara endpoint di Swagger dan item Postman tidak selalu sempurna.
