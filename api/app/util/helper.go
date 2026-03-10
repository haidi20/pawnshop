package util

import "strconv"

// FormatThousands formats integer price using dot as thousand separator,
// e.g., 15000 -> "15.000". Negative values are supported.
func FormatThousands(n int64) string {
	sign := ""
	if n < 0 {
		sign = "-"
		n = -n
	}
	s := strconv.FormatInt(n, 10)
	// insert dots every 3 digits from right
	var parts []string
	for len(s) > 3 {
		parts = append([]string{s[len(s)-3:]}, parts...)
		s = s[:len(s)-3]
	}
	if s != "" {
		parts = append([]string{s}, parts...)
	}
	return sign + JoinWithDot(parts)
}

// JoinWithDot joins parts with a dot separator.
func JoinWithDot(parts []string) string {
	if len(parts) == 0 {
		return ""
	}
	res := parts[0]
	for i := 1; i < len(parts); i++ {
		res = res + "." + parts[i]
	}
	return res
}
