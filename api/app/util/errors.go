package util

import (
	"errors"
)

// ValidationError menandai error yang berasal dari validasi atau kondisi bisnis
// yang harus diterjemahkan menjadi HTTP 400 (Bad Request).
type ValidationError struct {
	Err error
}

func (v *ValidationError) Error() string {
	if v == nil || v.Err == nil {
		return "validation error"
	}
	return v.Err.Error()
}

func (v *ValidationError) Unwrap() error {
	if v == nil {
		return nil
	}
	return v.Err
}

// NewValidationError wraps an existing error into a ValidationError
func NewValidationError(err error) error {
	if err == nil {
		err = errors.New("validation error")
	}
	return &ValidationError{Err: err}
}

// IsValidationError returns true jika error atau salah satu wrapped error adalah ValidationError
func IsValidationError(err error) bool {
	var v *ValidationError
	return errors.As(err, &v)
}
