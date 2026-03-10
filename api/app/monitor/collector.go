package monitor

import (
	"sync"
	"time"
)

// simple sliding window aggregator for request counts and durations
type Aggregator struct {
	mu       sync.RWMutex
	window   int       // seconds
	counts   []int64   // per-second counts
	totalDur []float64 // per-second total duration (seconds)
	start    time.Time // start time for index 0
}

func NewAggregator(windowSeconds int) *Aggregator {
	return &Aggregator{
		window:   windowSeconds,
		counts:   make([]int64, windowSeconds),
		totalDur: make([]float64, windowSeconds),
		start:    time.Now().Truncate(time.Second),
	}
}

// Record a request that took duration seconds
func (a *Aggregator) Record(duration float64) {
	a.mu.Lock()
	defer a.mu.Unlock()
	now := time.Now().Truncate(time.Second)
	sec := int(now.Sub(a.start).Seconds())
	if sec < 0 {
		// clock skew, reset
		a.reset(now)
		sec = 0
	}
	if sec >= a.window {
		// advance window
		a.advance(sec)
		sec = int(now.Sub(a.start).Seconds())
	}
	idx := sec % a.window
	a.counts[idx]++
	a.totalDur[idx] += duration
}

func (a *Aggregator) reset(now time.Time) {
	a.counts = make([]int64, a.window)
	a.totalDur = make([]float64, a.window)
	a.start = now
}

func (a *Aggregator) advance(sec int) {
	// move start forward by sec-window+1 such that now fits
	shift := sec - a.window + 1
	if shift <= 0 {
		return
	}
	if shift >= a.window {
		a.reset(a.start.Add(time.Duration(sec) * time.Second))
		return
	}
	// zero out buckets we moved past
	for i := 0; i < shift; i++ {
		idx := (i + int(a.start.Sub(a.start).Seconds())) % a.window
		_ = idx // not used, just keep semantics
	}
	a.start = a.start.Add(time.Duration(shift) * time.Second)
	// clear newly available slots
	for i := 0; i < a.window; i++ {
		a.counts[i] = 0
		a.totalDur[i] = 0
	}
}

// Snapshot returns copies of timestamps (unix seconds), counts and avg durations
func (a *Aggregator) Snapshot() (times []int64, counts []int64, avgDur []float64) {
	a.mu.RLock()
	defer a.mu.RUnlock()
	times = make([]int64, a.window)
	counts = make([]int64, a.window)
	avgDur = make([]float64, a.window)
	for i := 0; i < a.window; i++ {
		t := a.start.Add(time.Duration(i) * time.Second)
		times[i] = t.Unix()
		counts[i] = a.counts[i]
		if a.counts[i] > 0 {
			avgDur[i] = a.totalDur[i] / float64(a.counts[i])
		} else {
			avgDur[i] = 0
		}
	}
	return
}
