package metrics

import (
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
)

// InstrumentationMiddleware is a Gin middleware that records request counts
// and durations to Prometheus metrics defined in this package.
func InstrumentationMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		start := time.Now()
		path := c.FullPath()
		if path == "" {
			path = c.Request.URL.Path
		}

		c.Next()

		status := c.Writer.Status()
		method := c.Request.Method
		duration := time.Since(start).Seconds()

		HTTPRequestsTotal.WithLabelValues(method, path, strconv.Itoa(status)).Inc()
		HTTPRequestDuration.WithLabelValues(method, path).Observe(duration)

		// Also record to in-memory monitor aggregator if present
		if monitorServer != nil {
			monitorServer.RecordRequest(duration)
		}
	}
}
