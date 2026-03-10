package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
)

// optional in-memory monitor server (interface) to avoid import cycles.
var monitorServer interface {
	RecordRequest(float64)
}

// RegisterMonitorServer wires an object implementing RecordRequest(float64)
// so the middleware can forward recorded request durations to the UI
// aggregator. Provide nil to unset.
func RegisterMonitorServer(m interface{ RecordRequest(float64) }) {
	monitorServer = m
}

var (
	// HTTP request total counter (labels: method, path, status)
	HTTPRequestsTotal = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	// HTTP request duration histogram (in seconds)
	HTTPRequestDuration = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "Histogram of HTTP request durations",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)
)

// RegisterCollectors registers standard Go / process collectors along with
// HTTP metrics. Call this once at startup.
func RegisterCollectors() error {
	if err := prometheus.Register(HTTPRequestsTotal); err != nil {
		if _, ok := err.(prometheus.AlreadyRegisteredError); !ok {
			return err
		}
	}
	if err := prometheus.Register(HTTPRequestDuration); err != nil {
		if _, ok := err.(prometheus.AlreadyRegisteredError); !ok {
			return err
		}
	}

	// Register default Go and process collectors
	_ = prometheus.Register(collectors.NewGoCollector())
	_ = prometheus.Register(collectors.NewProcessCollector(collectors.ProcessCollectorOpts{}))
	return nil
}

// RegisterGaugeFunc registers a Gauge whose value is read from the provided
// function. Useful to expose dynamic values (e.g., socket.io client count).
func RegisterGaugeFunc(name, help string, f func() float64) error {
	g := prometheus.NewGaugeFunc(prometheus.GaugeOpts{Name: name, Help: help}, f)
	if err := prometheus.Register(g); err != nil {
		if _, ok := err.(prometheus.AlreadyRegisteredError); !ok {
			return err
		}
	}
	return nil
}
