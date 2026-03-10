FROM golang:1.20-alpine AS builder
WORKDIR /src

# Copy go.mod/go.sum and download modules first to leverage Docker cache
COPY go.mod go.sum ./
RUN go mod download

# Copy the rest of the source and build the binary
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o /app/server main.go

FROM alpine:3.18
RUN apk add --no-cache ca-certificates
WORKDIR /app
COPY --from=builder /app/server /app/server

# Application listens on this port by default (can be overridden via env)
EXPOSE 8080
ENV APP_PORT=8080
CMD ["/app/server"]
