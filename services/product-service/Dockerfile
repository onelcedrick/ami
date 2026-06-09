FROM golang:1.22-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=arm64 \
    go build -ldflags="-w -s" -o /app/product-service cmd/main.go

FROM alpine:3.19
RUN apk --no-cache add ca-certificates tzdata
COPY --from=builder /app/product-service /product-service
EXPOSE 8082
HEALTHCHECK --interval=30s --timeout=3s \
    CMD wget -q --spider http://localhost:8082/health || exit 1
USER 1000:1000
CMD ["/product-service"]
