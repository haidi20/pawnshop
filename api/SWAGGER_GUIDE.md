# Swagger API Documentation - Setup Complete

## Summary

Swagger API documentation telah berhasil diinstall dan dikonfigurasi untuk pawnshop. Dokumentasi interaktif tersedia di endpoint `/swagger/index.html`.

## Yang Sudah Diinstall

### Libraries

- **swaggo/swag** - CLI tool untuk generate Swagger docs
- **swaggo/gin-swagger** - Gin middleware untuk Swagger UI
- **swaggo/files** - Static file handler untuk Swagger

```bash
go install github.com/swaggo/swag/cmd/swag@latest
go get -u github.com/swaggo/gin-swagger
go get -u github.com/swaggo/files
```

## File Structure

```
pawnshop/
├── docs/
│   ├── docs.go          # Generated Go documentation
│   ├── swagger.json     # Swagger JSON spec
│   └── swagger.yaml     # Swagger YAML spec
├── main.go              # Added Swagger general info
├── routes/
│   └── router.go        # Added Swagger UI route
└── app/http/controller/
    ├── transaction_controller.go  # Added API annotations
    └── websocket_controller.go    # Added API annotations
```

## API Documentation

### General Info (main.go)

```go
// @title           pawnshop
// @version         2.0
// @description     API untuk sistem Point of Sale (POS) pawnshop
// @termsOfService  http://swagger.io/terms/

// @contact.name   API Support
// @contact.email  support@pawnshop.com

// @license.name  Apache 2.0
// @license.url   http://www.apache.org/licenses/LICENSE-2.0.html

// @host      localhost:8001
// @BasePath  /api/v1

// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
```

### Documented Endpoints

#### 1. Get Pending Transactions

```
GET /api/v1/transactions
```

**Parameters:**

- `warehouse_id` (query, required) - Warehouse ID

**Responses:**

- `200` - Success with transaction data
- `400` - Bad request (missing or invalid warehouse_id)
- `500` - Internal server error

**Swagger Annotations:**

```go
// @Summary      Get pending transactions
// @Description  Mendapatkan daftar transaksi dengan status pending berdasarkan warehouse ID
// @Tags         transactions
// @Accept       json
// @Produce      json
// @Param        warehouse_id  query     int  true  "Warehouse ID"
// @Success      200  {object}  map[string]interface{}
// @Failure      400  {object}  map[string]string
// @Failure      500  {object}  map[string]string
// @Router       /transactions [get]
```

#### 2. WebSocket Connection

```
GET /api/v1/ws
```

**Responses:**

- `101` - Switching Protocols (WebSocket upgrade)

**Swagger Annotations:**

```go
// @Summary      WebSocket connection
// @Description  Establish WebSocket connection for real-time communication
// @Tags         websocket
// @Success      101  {string}  string
// @Router       /ws [get]
```

#### 3. WebSocket Statistics

```
GET /api/v1/ws/stats
```

**Responses:**

- `200` - Success with connection stats

**Swagger Annotations:**

```go
// @Summary      Get WebSocket statistics
// @Description  Mendapatkan statistik koneksi WebSocket (jumlah client yang terhubung)
// @Tags         websocket
// @Success      200  {object}  map[string]interface{}
// @Router       /ws/stats [get]
```

## How to Use

### 1. Generate Swagger Docs

Setiap kali ada perubahan pada API annotations, jalankan:

```bash
# Windows PowerShell
$env:PATH += ";$env:USERPROFILE\go\bin"
swag init

# Atau langsung
swag init
```

Output:

```
Generate swagger docs....
Generate general API Info, search dir:./
create docs.go at docs/docs.go
create swagger.json at docs/swagger.json
create swagger.yaml at docs/swagger.yaml
```

### 2. Start Server

```bash
air
# atau
go run main.go
```

### 3. Access Swagger UI

Buka browser dan akses:

```
http://localhost:8080/swagger/index.html
```

### 4. Test API Endpoints

Di Swagger UI, Anda bisa:

- ✅ Melihat semua endpoint yang tersedia
- ✅ Melihat parameter yang diperlukan
- ✅ Melihat response schema
- ✅ **Try it out** - Test endpoint langsung dari browser
- ✅ Melihat contoh request/response

## Swagger UI Features

### Try It Out

1. Click endpoint yang ingin ditest
2. Click tombol **"Try it out"**
3. Isi parameter yang diperlukan
4. Click **"Execute"**
5. Lihat response di bawah

### Example: Test Get Pending Transactions

1. Expand `GET /api/v1/transactions`
2. Click "Try it out"
3. Isi `warehouse_id`: `1`
4. Click "Execute"
5. Lihat response:

```json
{
  "data": [
    {
      "id": 1,
      "warehouse_id": 1,
      "status": "pending",
      "total_amount": 100000,
      "total_qty": 5
    }
  ]
}
```

## Adding New Endpoints

### Step 1: Add Swagger Annotations

```go
// GetOrders godoc
// @Summary      Get orders
// @Description  Mendapatkan daftar order
// @Tags         orders
// @Accept       json
// @Produce      json
// @Param        status  query  string  false  "Order status"
// @Success      200  {object}  map[string]interface{}
// @Failure      500  {object}  map[string]string
// @Router       /orders [get]
func (ctrl *OrderController) GetOrders(c *gin.Context) {
    // ... implementation
}
```

### Step 2: Regenerate Docs

```bash
swag init
```

### Step 3: Restart Server

```bash
# Air will auto-reload
# Or manually restart
```

### Step 4: Refresh Swagger UI

Refresh browser di `http://localhost:8080/swagger/index.html`

## Swagger Annotation Tags

### Common Tags

- `@Summary` - Short description
- `@Description` - Detailed description
- `@Tags` - Group endpoints (e.g., "transactions", "websocket")
- `@Accept` - Request content type (json, xml, etc.)
- `@Produce` - Response content type
- `@Param` - Parameter definition
- `@Success` - Success response
- `@Failure` - Error response
- `@Router` - Route path and method

### Parameter Types

```go
// Query parameter
// @Param  name  query  type  required  "description"
@Param  warehouse_id  query  int  true  "Warehouse ID"

// Path parameter
// @Param  id  path  int  true  "Transaction ID"

// Body parameter
// @Param  request  body  model.Transaction  true  "Transaction object"

// Header parameter
// @Param  Authorization  header  string  true  "Bearer token"
```

### Response Types

```go
// Object response
@Success  200  {object}  model.Transaction

// Array response
@Success  200  {array}  model.Transaction

// Map response
@Success  200  {object}  map[string]interface{}

// String response
@Success  200  {string}  string
```

## Security (Bearer Auth)

Swagger sudah dikonfigurasi dengan Bearer Authentication:

```go
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization
```

Untuk menggunakan:

1. Click tombol **"Authorize"** di Swagger UI
2. Masukkan: `Bearer <your-token>`
3. Click "Authorize"
4. Semua request akan include Authorization header

## Export API Spec

### JSON Format

```
http://localhost:8080/swagger/doc.json
```

### YAML Format

File: `docs/swagger.yaml`

Bisa digunakan untuk:

- Import ke Postman
- Generate client SDK
- Share dengan frontend team
- API documentation portal

## Troubleshooting

### Issue: Swagger UI tidak muncul

**Solution:**

1. Pastikan server running
2. Check `http://localhost:8080/swagger/index.html`
3. Regenerate docs: `swag init`

### Issue: Endpoint tidak muncul di Swagger

**Solution:**

1. Pastikan ada annotations di controller
2. Run `swag init` untuk regenerate
3. Restart server

### Issue: "docs" package not found

**Solution:**

1. Run `swag init` untuk generate docs
2. Check folder `docs/` sudah ada
3. Import di router: `_ "pawnshop/docs"`

### Issue: Changes tidak muncul

**Solution:**

1. Regenerate: `swag init`
2. Restart server
3. Hard refresh browser (Ctrl+F5)

## Best Practices

### 1. Always Document

Setiap endpoint baru harus ada Swagger annotations

### 2. Use Tags

Group related endpoints dengan tags yang sama

### 3. Detailed Descriptions

Berikan deskripsi yang jelas untuk setiap endpoint

### 4. Example Responses

Tambahkan contoh response di description

### 5. Error Codes

Dokumentasikan semua possible error responses

### 6. Regenerate After Changes

Selalu run `swag init` setelah update annotations

## Next Steps

1. ✅ Add authentication examples
2. ✅ Add request/response models
3. ✅ Add more detailed descriptions
4. ✅ Add example values
5. ✅ Document all error codes
6. ✅ Add API versioning info

## Summary

✅ Swagger installed and configured
✅ API documentation generated
✅ Swagger UI accessible at `/swagger/index.html`
✅ All current endpoints documented
✅ Interactive testing available
✅ Ready for production use

Access Swagger UI:

```
http://localhost:8080/swagger/index.html
```

Happy documenting! 📚✨
