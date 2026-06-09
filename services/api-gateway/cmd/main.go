package main

import (
	"log"

	"github.com/am-info/api-gateway/internal/config"
	"github.com/am-info/api-gateway/internal/handler"
	"github.com/am-info/api-gateway/internal/middleware"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
)

func main() {
	cfg := config.Load()
	proxy := handler.NewProxyHandler()

	authMiddleware, err := middleware.NewAuthMiddleware(cfg.PublicKeyPath)
	if err != nil {
		log.Printf("⚠️  Erreur clé JWT: %v - Mode header X-User-ID", err)
	}

	app := fiber.New(fiber.Config{
		AppName:      "AM Info - API Gateway",
		BodyLimit:    10 * 1024 * 1024,
		// Désactiver le parsing automatique du body
		DisableDefaultContentType: true,
	})

	app.Use(recover.New())
	app.Use(logger.New(logger.Config{
		Format: "[${time}] ${status} - ${method} ${path}\n",
	}))
	app.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowMethods:  "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:  "Origin,Content-Type,Accept,Authorization,X-User-ID,X-User-Role",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "api-gateway"})
	})

	api := app.Group("/api/v1")

	// Routes publiques - définies AVANT tout middleware qui consomme le body
	api.Post("/auth/register", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/register"))
	api.Post("/auth/login", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/login"))
	api.Post("/auth/refresh", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/refresh"))
	api.Get("/products", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products"))
	api.Get("/products/featured", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/featured"))
	api.Get("/products/:id", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products"))
	api.Get("/categories", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/categories"))

	// Routes protégées
	protected := api.Group("")
	if authMiddleware != nil {
		protected.Use(authMiddleware.RequireAuth)
	}

	protected.Get("/auth/me", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/me"))
	protected.Get("/cart", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart"))
	protected.Get("/cart/count", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/count"))
	protected.Post("/cart/items", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/items"))
	protected.Put("/cart/items/:id", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/items"))
	protected.Delete("/cart/items/:id", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/items"))
	protected.Delete("/cart", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart"))
	protected.Post("/orders", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Get("/orders", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Get("/orders/:id", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Post("/orders/:id/pay", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Put("/orders/:id/cancel", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Post("/tickets", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
	protected.Get("/tickets", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
	protected.Get("/tickets/:id", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
	protected.Post("/tickets/:id/messages", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
	protected.Put("/tickets/:id/status", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))

	api.Post("/ia/chat", proxy.ProxyToService(cfg.IAServiceURL, "/api/v1/ia/chat"))

	log.Printf("🚪 API Gateway démarré sur le port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}
