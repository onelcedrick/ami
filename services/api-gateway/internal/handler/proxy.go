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
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

func (h *ProxyHandler) ProxyToService(serviceURL, path string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		// Remplacer les paramètres dans le path (:id, :user_id, etc.)
		targetPath := path
		for _, param := range c.Route().Params {
			targetPath = strings.Replace(targetPath, ":"+param, c.Params(param), 1)
		}
		
		targetURL := strings.TrimRight(serviceURL, "/") + targetPath
		
		if query := string(c.Request().URI().QueryString()); query != "" {
			targetURL += "?" + query
		}

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
		if ct := c.Get("Content-Type"); ct != "" {
			req.Header.Set("Content-Type", ct)
		} else if len(bodyBytes) > 0 {
			req.Header.Set("Content-Type", "application/json")
		}
		
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
