<!-- .github/copilot-instructions.md -->
# Copilot / AI Agent Instructions for pawnshop

Purpose: give AI coding agents the minimal, actionable knowledge to be productive in this repository.

1) Big picture (how the app is structured)
- Language: Go (module root contains `go.mod`).
- Entrypoint: `main.go` — sets up Gin, loads `.env`, starts optional debug server (pprof) on `127.0.0.1:6060` when `APP_ENV!=production`.
- Routing: `routes/router.go` wires middlewares, static files, Prometheus, Swagger and Socket.IO. Important endpoints:
  - Static product images: `/storage/product_images` -> `./storage/images/product_images`
  - Socket.IO: `/socket.io/*` (hub implemented in `app/socketio`)
  - Swagger UI: `/api/v1/doc/*any`
  - Prometheus metrics: `/metrics`

2) Dependency wiring & conventions
- DB connection: `app/config/database.go` constructs a GORM MySQL DSN from env vars: `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT`, `DB_NAME`.
- DI style: factories return interfaces and are wired in `routes/router.go`. Pattern: `repo := repository.FooRepository(db)` -> `service := service.FooService(repo)` -> `ctrl := controller.FooController(service, ...)`.
- Repository/Service/Controller separation: see `app/repository/*`, `app/service/*`, `app/http/controller/*` for canonical examples (e.g., product flow: `product_repository.go`, `product_service.go`, `product_controller.go`).

3) Error & logging patterns
- Use `util.NewValidationError` / `util.IsValidationError` to signal business/validation errors (these map to HTTP 400 in controllers).
- For attaching error location use `middleware.AttachErrorWithLocation(c, err)` so `ErrorLoggerMiddleware` records file:line in logs.
- Logs: `app/http/middleware/logger.go` writes to path returned by `config.LogFilePath()` and respects `LOG_MODE` (prepend/append) from `app/config/logging.go`.

4) Runtime and testing workflows (commands & env)
- Local dev run (PowerShell examples):
  - Set env from `.env` or explicitly: `setx DB_USER "user"; setx DB_PASSWORD "pass"` (or use `$env:` in PowerShell session)
  - Run: `go run .` (binds to `0.0.0.0:$APP_PORT` or default `8001`)
  - Build: `go build -o pawnshop .` then run `./pawnshop` (Windows: `.\pawnshop.exe`)
- Tests: `go test ./...` (project contains tests under `test/` and standard `_test.go` files)
- Swagger: repo includes generated docs under `docs` and swagger yaml/json. The project uses `swag` style annotations — regenerate only if you know `swag` commands are installed.

5) Observability & debug hooks
- Metrics are registered in `routes/router.go` and exposed at `/metrics` using Prometheus client.
- In non-production, `main.go` starts a debug server (pprof) on `127.0.0.1:6060` for profiling and goroutine info.
- In-app monitor server exists in `monitor/` and is mounted at `/monitor` and `/monitor/json`.

6) Websocket / realtime
- Socket.IO hub implemented in `app/socketio` and mounted at `/socket.io/*` in `routes/router.go`.
- The hub uses a provider callback to fetch pending transactions via the `transactionService` (see how `hub.SetPendingTransactionsProvider` is wired).

7) Project-specific patterns and gotchas (do not change without tests)
- Do not change `r.SetTrustedProxies(nil)` in `main.go` unless you understand Gin trusted proxy implications — it was explicitly set to avoid warnings in local/dev.
- `ErrorLoggerMiddleware` attempts to capture errors even when handlers don't call `c.Error` — prefer attaching errors via `AttachErrorWithLocation` from controllers for best logs.
- Repositories often use raw SQL fragments (e.g., EXISTS subqueries) built from `model.TableName()` to avoid join duplication — follow those examples when writing queries.

8) Files and locations to consult for common changes
- Startup & wiring: `main.go`, `routes/router.go`
- DB config: `app/config/database.go`
- Controllers: `app/http/controller/*.go` (ex: `product_controller.go`)
- Repositories: `app/repository/*.go` (ex: `product_repository.go`)
- Services: `app/service/*.go` (ex: `product_service.go`)
- Middleware & logging: `app/http/middleware/*.go`
- Socket.IO hub: `app/socketio/*.go`

9) Helpful examples to copy-paste
- Create repository + service + controller wiring (pattern found in `routes/router.go`):
```go
repo := repository.ProductRepository(db)
svc := service.ProductService(repo)
ctrl := controller.ProductController(svc, warehouseRepo)
v1.RegisterProductRoutes(apiv1, ctrl)
```

10) When to ask the maintainers
- If you need to change environment requirements (new env var), confirm with the owner before removing required-env checks in `main.go`.
- If adding new public HTTP endpoints, add Swagger comments in the controller and update `docs` to keep generated docs consistent.

If anything here is unclear or you'd like more detail (examples for migrations, seeders, or test harnesses), tell me which area to expand and I'll update this file.
