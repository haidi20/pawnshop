package config

import (
	"os"
	"strings"
)

// LogFilePath returns the path to the log file from env or default.
// Default: storage/logs/gin.log
func LogFilePath() string {
	p := strings.TrimSpace(os.Getenv("LOG_FILE"))
	if p == "" {
		return "storage/logs/gin.log"
	}
	return p
}

// LogMode returns the logging mode: "prepend" or "append". Default is "prepend"
// Use "append" in production for better concurrency and performance.
func LogMode() string {
	m := strings.ToLower(strings.TrimSpace(os.Getenv("LOG_MODE")))
	if m == "" {
		return "prepend"
	}
	if m != "prepend" && m != "append" {
		return "prepend"
	}
	return m
}
