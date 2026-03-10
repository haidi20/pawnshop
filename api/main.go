package main

import (
	"context"
	"log"
	"os"
	"pawnshop/app/debug"
	"pawnshop/routes"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if os.Getenv("APP_ENV") != "production" {
		if err := godotenv.Load(); err != nil {
			log.Println("file .env tidak ditemukan, menggunakan environment sistem")
		}
	}

	port := os.Getenv("APP_PORT")
	if port == "" {
		port = "8001"
		log.Println("APP_PORT tidak diset, menggunakan default: 8001")
	}

	r := gin.Default()
	routes.SetupAPIRoutes(r)

	if os.Getenv("APP_ENV") != "production" {
		ctx, cancel := context.WithCancel(context.Background())
		defer cancel()

		go func() {
			if _, err := debug.StartDebugServer(ctx, "127.0.0.1:6060"); err != nil {
				log.Printf("gagal start debug server: %v", err)
			} else {
				log.Println("debug server tersedia di 127.0.0.1:6060")
			}
		}()

		time.Sleep(50 * time.Millisecond)
	}

	if err := r.SetTrustedProxies(nil); err != nil {
		log.Printf("gagal set trusted proxies: %v", err)
	}

	log.Printf("server berjalan di http://0.0.0.0:%s", port)
	if err := r.Run("0.0.0.0:" + port); err != nil {
		panic(err)
	}
}
