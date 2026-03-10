package debug

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"runtime"

	// register pprof handlers on the default mux
	_ "net/http/pprof"
)

// StartDebugServer starts a small HTTP server on the given addr that
// exposes pprof handlers and a simple /debug/goroutines JSON endpoint.
// The server uses the default http.DefaultServeMux where pprof registers
// its handlers. The returned *http.Server can be Shutdown by the caller.
func StartDebugServer(ctx context.Context, addr string) (*http.Server, error) {
	// register a lightweight handler for goroutine count
	http.HandleFunc("/debug/goroutines", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprintf(w, "{\"goroutines\":%d}", runtime.NumGoroutine())
	})

	srv := &http.Server{Addr: addr, Handler: http.DefaultServeMux}

	// shutdown when context is done
	go func() {
		<-ctx.Done()
		if err := srv.Shutdown(context.Background()); err != nil {
			log.Printf("debug server shutdown error: %v", err)
		}
	}()

	go func() {
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Printf("debug server error: %v", err)
		}
	}()

	return srv, nil
}
