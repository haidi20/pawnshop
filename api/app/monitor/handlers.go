package monitor

import (
	"encoding/json"
	"net/http"
	"runtime"
	"time"
)

type Server struct {
	agg *Aggregator
	// function to read socket clients (set from routes)
	clientsFunc func() int
}

func NewServer(windowSeconds int) *Server {
	return &Server{agg: NewAggregator(windowSeconds)}
}

// SetClientsFunc sets a callback to get socket.io client count
func (s *Server) SetClientsFunc(f func() int) {
	s.clientsFunc = f
}

// RecordRequest records duration (seconds)
func (s *Server) RecordRequest(duration float64) {
	if s.agg != nil {
		s.agg.Record(duration)
	}
}

// HandlerJSON returns a http.HandlerFunc that returns monitoring JSON
func (s *Server) HandlerJSON() http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		times, counts, avg := s.agg.Snapshot()
		clients := 0
		if s.clientsFunc != nil {
			clients = s.clientsFunc()
		}
		resp := map[string]any{
			"ts":         times,
			"counts":     counts,
			"avg_dur":    avg,
			"clients":    clients,
			"goroutines": runtime.NumGoroutine(),
			"now":        time.Now().Unix(),
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(resp)
	}
}
