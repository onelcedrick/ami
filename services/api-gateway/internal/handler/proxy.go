package handler

import (
	"io"
	"log"
	"net/http"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

type ProxyHandler struct {
	client *http.Client
}

func NewProxyHandler() *ProxyHandler {
	return &ProxyHandler{
		client: &http.Client{
			Timeout: 30 * time.Second,
		},
	}
}

func (h *ProxyHandler) ProxyToService(serviceURL, path string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		targetURL := strings.TrimRight(serviceURL, "/") + path
		
		if query := string(c.Request().URI().QueryString()); query != "" {
			targetURL += "?" + query
		}

		// Obtenir le body directement du contexte HTTP
		bodyBytes := c.Request().Body()
		
		log.Printf("🔄 %s %s → %s (%d bytes)", c.Method(), c.OriginalURL(), targetURL, len(bodyBytes))

		var bodyReader io.Reader
		if len(bodyBytes) > 0 {
			bodyReader = strings.NewReader(string(bodyBytes))
		}

		req, err := http.NewRequestWithContext(c.Context(), c.Method(), targetURL, bodyReader)
		if err != nil {
			return c.Status(502).JSON(fiber.Map{"error": "Erreur"})
		}

		// Headers
		ct := c.Get("Content-Type")
		if ct == "" {
			ct = "application/json"
		}
		req.Header.Set("Content-Type", ct)
		
		if auth := c.Get("Authorization"); auth != "" {
			req.Header.Set("Authorization", auth)
		}
		if xuid := c.Get("X-User-ID"); xuid != "" {
			req.Header.Set("X-User-ID", xuid)
		}
		if xrole := c.Get("X-User-Role"); xrole != "" {
			req.Header.Set("X-User-Role", xrole)
		}

		resp, err := h.client.Do(req)
		if err != nil {
			log.Printf("❌ Erreur: %v", err)
			return c.Status(502).JSON(fiber.Map{"error": "Service indisponible"})
		}
		defer resp.Body.Close()

		respBody, _ := io.ReadAll(resp.Body)
		c.Status(resp.StatusCode)
		
		for key, values := range resp.Header {
			for _, value := range values {
				c.Set(key, value)
			}
		}

		return c.Send(respBody)
	}
}
