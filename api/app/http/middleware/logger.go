package middleware

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"time"

	"pawnshop/app/config"

	"github.com/gin-gonic/gin"
)

// AttachErrorWithLocation attaches the error to the gin context and records the
// caller location (file:line) into the gin.Error meta. Call this from handlers
// instead of c.Error(err) when you want the middleware to log the exact source.
func AttachErrorWithLocation(c *gin.Context, err error) *gin.Error {
	e := c.Error(err)
	// Skip 2 frames: AttachErrorWithLocation -> caller
	_, file, line, ok := runtime.Caller(1)
	if ok {
		e.SetMeta(fmt.Sprintf("%s:%d", file, line))
	}
	return e
}

// ErrorLoggerMiddleware captures panics and handler errors and writes them to storage/logs/gin.log
// The latest log entry is prepended to the file so newest appear on top (as requested).
func ErrorLoggerMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		// wrap response writer to capture response body/status
		bw := &bodyWriter{ResponseWriter: c.Writer, body: bytes.NewBuffer(nil), status: 200}
		c.Writer = bw
		defer func() {
			if rec := recover(); rec != nil {
				// capture stack
				buf := make([]byte, 1<<16)
				n := runtime.Stack(buf, false)
				stack := string(buf[:n])
				// attempt to find the origin location
				loc := findAppFrameFromStack(stack)
				msg := fmt.Sprintf("PANIC: %v\n%s", rec, stack)
				if loc != "" {
					msg = msg + "\nLocation: " + loc
				}
				entry := formatEntry(c, msg)
				writeLog(entry)
				// ensure we return 500
				c.AbortWithStatusJSON(500, gin.H{"message": "internal server error"})
				return
			}

			// after handlers: only log when there are actual errors attached to the context
			if len(c.Errors) > 0 {
				msgs := []string{}
				metaLocs := []string{}
				for _, e := range c.Errors {
					msgs = append(msgs, e.Error())
					// if controller attached meta (file:line), capture it
					if e.Meta != nil {
						if s, ok := e.Meta.(string); ok && s != "" {
							metaLocs = append(metaLocs, s)
						}
					}
				}
				// make the message explicit that these are errors
				joined := strings.Join(msgs, " ; ")
				// prefer meta locations if present, else fall back to stack-inspection
				if len(metaLocs) > 0 {
					joined = joined + " (at " + strings.Join(metaLocs, ", ") + ")"
				} else {
					loc := findAppFrame()
					if loc != "" {
						joined = joined + " (at " + loc + ")"
					}
				}
				entry := formatEntry(c, "ERROR: "+joined)
				writeLog(entry)
			}

			// If there were no c.Errors but the response indicates an error (4xx or 5xx), try to
			// extract an error message from the response body (common pattern: JSON {"message": "..."}).
			// This helps log errors when handlers forgot to call c.Error(err).
			status := bw.status
			if status >= 400 && len(c.Errors) == 0 {
				bodyBytes := bw.body.Bytes()
				var parsed map[string]interface{}
				var msg string
				if len(bodyBytes) > 0 && json.Unmarshal(bodyBytes, &parsed) == nil {
					// try common keys
					if v, ok := parsed["message"]; ok {
						msg = fmt.Sprintf("%v", v)
					} else if v, ok := parsed["error"]; ok {
						msg = fmt.Sprintf("%v", v)
					} else if v, ok := parsed["detail"]; ok {
						msg = fmt.Sprintf("%v", v)
					} else if v, ok := parsed["errors"]; ok {
						// could be array or map
						msg = fmt.Sprintf("%v", v)
					}
				}
				if msg == "" {
					// fallback to raw body as string (trim to reasonable length)
					s := strings.TrimSpace(string(bodyBytes))
					if len(s) > 0 {
						if len(s) > 1000 {
							s = s[:1000] + "..."
						}
						msg = s
					} else {
						msg = fmt.Sprintf("status %d with empty body", status)
					}
				}
				loc := findAppFrame()
				if loc != "" {
					msg = msg + " (at " + loc + ")"
				}
				entry := formatEntry(c, "ERROR: "+msg)
				writeLog(entry)
			}
		}()

		c.Next()
	}
}

// bodyWriter captures response body and status
type bodyWriter struct {
	gin.ResponseWriter
	body   *bytes.Buffer
	status int
}

func (w *bodyWriter) Write(b []byte) (int, error) {
	w.body.Write(b)
	return w.ResponseWriter.Write(b)
}

func (w *bodyWriter) WriteHeader(statusCode int) {
	w.status = statusCode
	w.ResponseWriter.WriteHeader(statusCode)
}

// findAppFrame walks the current goroutine stack and returns the first
// caller frame that looks like application code (not runtime, stdlib or vendor).
func findAppFrame() string {
	// skip first few frames to get out of middleware functions
	pcs := make([]uintptr, 32)
	n := runtime.Callers(4, pcs)
	if n == 0 {
		return ""
	}
	frames := runtime.CallersFrames(pcs[:n])
	for {
		frame, more := frames.Next()
		// skip frames in runtime, testing, gin, net/http, pkg/mod
		if !strings.Contains(frame.File, "/runtime/") &&
			!strings.Contains(frame.File, "_test.go") &&
			!strings.Contains(frame.File, "github.com/gin-gonic") &&
			!strings.Contains(frame.File, "net/http") &&
			!strings.Contains(frame.File, "pkg/mod") {
			return fmt.Sprintf("%s:%d", frame.File, frame.Line)
		}
		if !more {
			break
		}
	}
	return ""
}

// findAppFrameFromStack parses a stack trace text and returns the first
// non-runtime frame as file:line.
func findAppFrameFromStack(stack string) string {
	// stack entries look like:
	// goroutine N [running]:\nfunction\n\t/path/to/file.go:123 +0x...
	lines := strings.Split(stack, "\n")
	for i := 0; i < len(lines); i++ {
		line := lines[i]
		if strings.HasPrefix(line, "\t") {
			path := strings.TrimSpace(strings.TrimPrefix(line, "\t"))
			// path may contain "+0x" suffix; strip it
			if idx := strings.Index(path, " +"); idx != -1 {
				path = path[:idx]
			}
			// ignore runtime and vendor
			if strings.Contains(path, "/runtime/") || strings.Contains(path, "pkg/mod") || strings.Contains(path, "<autogenerated>") {
				continue
			}
			// ensure it contains ':' for line number
			if strings.Contains(path, ":") {
				return path
			}
		}
	}
	return ""
}

// formatEntry creates a human-friendly log block.
func formatEntry(c *gin.Context, message string) string {
	ts := formatTimestampIndo(time.Now())
	method := c.Request.Method
	path := c.Request.URL.Path
	query := c.Request.URL.RawQuery
	if query != "" {
		path = path + "?" + query
	}
	ip := c.ClientIP()
	ua := c.Request.UserAgent()

	return fmt.Sprintf("[%s] %s %s %s\nIP: %s\nUA: %s\n%s\n----\n", ts, method, path, c.Request.Proto, ip, ua, message)
}

// formatTimestampIndo formats time into Indonesian human-readable form:
// e.g. "Kamis, 27 November 2025 20:35"
func formatTimestampIndo(t time.Time) string {
	hari := []string{"Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"}
	bulan := []string{"Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"}
	weekday := hari[int(t.Weekday())]
	day := t.Day()
	month := bulan[int(t.Month())-1]
	year := t.Year()
	hour := t.Hour()
	min := t.Minute()
	return fmt.Sprintf("%s, %02d %s %04d %02d:%02d", weekday, day, month, year, hour, min)
}

// prependLog writes the entry at the top of the log file.
func prependLog(entry string) {
	// kept for backward-compat; prefer writeLog below
	writeLog(entry)
}

// writeLog writes the log entry according to configured mode (prepend or append)
func writeLog(entry string) {
	logFile := config.LogFilePath()

	// ensure directory exists
	dir := filepath.Dir(logFile)
	if err := os.MkdirAll(dir, 0755); err != nil {
		dir = "."
		logFile = filepath.Join(dir, filepath.Base(logFile))
	}

	mode := config.LogMode()
	if mode == "append" {
		// append mode is safer for concurrency
		f, err := os.OpenFile(logFile, os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0644)
		if err != nil {
			return
		}
		defer f.Close()
		_, _ = f.WriteString(entry)
		return
	}

	// default: prepend mode (read + write)
	old, _ := ioutil.ReadFile(logFile)
	content := []byte(entry)
	if len(old) > 0 {
		content = append(content, old...)
	}
	tmp := logFile + ".tmp"
	if err := ioutil.WriteFile(tmp, content, 0644); err == nil {
		_ = os.Rename(tmp, logFile)
	}
}
