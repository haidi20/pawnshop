# Menjalankan projek dengan Docker Compose

Langkah singkat untuk menjalankan aplikasi Gin dan PostgreSQL menggunakan Docker Compose.

1) Salin file example dan sesuaikan nilai:

```powershell
cd docker
copy .env.example .env
# Edit docker\.env lalu isi DB_PASS dan nilai lain sesuai kebutuhan
```

2) Jalankan docker-compose (Docker Desktop / Docker Engine diperlukan):

```powershell
# Build dan jalankan container di background
docker compose up --build -d

# Jika menggunakan versi lama docker-compose standalone
# docker-compose up --build -d
```

3) Cek log / status:

```powershell
# Lihat status container
docker compose ps

# Lihat log service app
docker compose logs -f app
```

4) Stop dan hapus container + network (tetap menyimpan volume DB):

```powershell
docker compose down
```

Catatan keamanan:
- Jangan commit file `docker/.env` yang berisi password nyata.
- Untuk production, pertimbangkan menggunakan secret manager (contoh: Azure Key Vault, AWS Secrets Manager, HashiCorp Vault).
