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
		log.Printf("⚠️  Erreur clé JWT: %v", err)
	}

	app := fiber.New(fiber.Config{
		AppName:      "AM Info - API Gateway",
		BodyLimit:    10 * 1024 * 1024,
	})

	app.Use(recover.New())
    // app.Use(middleware.ActivityLogger("http://localhost:8086"))
    app.Static("/uploads", "../../uploads")
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins:  "*",
		AllowMethods:  "GET,POST,PUT,DELETE,OPTIONS,PATCH",
		AllowHeaders:  "Origin,Content-Type,Accept,Authorization,X-User-ID",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "api-gateway"})
	})

	api := app.Group("/api/v1")

	// Public
	api.Post("/auth/register", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/register"))
	api.Post("/auth/login", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/login"))
	api.Get("/products", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products"))
    api.Get("/search-all", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products"))
	api.Get("/products/featured", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/featured"))
	api.Get("/products/:id", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/:id"))
	api.Get("/categories", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/categories"))

	// Protected
	protected := api.Group("")
	if authMiddleware != nil {
		protected.Use(authMiddleware.RequireAuth)
	}

	protected.Get("/auth/me", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/me"))
    protected.Post("/auth/avatar", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/avatar"))
    protected.Put("/auth/profile", proxy.ProxyToService(cfg.AuthServiceURL, "/api/v1/auth/profile"))
	protected.Post("/products", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products"))
	protected.Put("/products/:id", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/:id"))
	protected.Delete("/products/:id", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/:id"))
    protected.Patch("/products/:id/visibility", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/:id/visibility"))
    protected.Patch("/products/:id/stock", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/products/:id/stock"))
	protected.Post("/categories", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/categories"))
	protected.Put("/categories/:id", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/categories/:id"))
	protected.Delete("/categories/:id", proxy.ProxyToService(cfg.ProductServiceURL, "/api/v1/categories/:id"))

	protected.Get("/cart", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart"))
	protected.Post("/cart/items", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/items"))
	protected.Put("/cart/items/:id", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/items/:id"))
	protected.Delete("/cart/items/:id", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart/items/:id"))
	protected.Delete("/cart", proxy.ProxyToService(cfg.CartServiceURL, "/api/v1/cart"))

	protected.Post("/orders", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Get("/orders", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))
	protected.Get("/orders/:id", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/orders"))

	protected.Post("/tickets", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
	protected.Get("/tickets", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
	protected.Get("/tickets/:id", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets/:id"))
	protected.Post("/tickets/:id/messages", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets/:id/messages"))
    protected.Post("/tickets/:id/upload", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets/:id/upload"))
    // Admin Service routes
    admin := app.Group("/api/v1/admin")
    admin.Get("/stats/", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/stats/"))
    admin.Get("/logs/", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/logs/"))
    admin.Get("/logs/stats", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/logs/stats"))
    admin.Get("/orders", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/admin/orders"))
    admin.Put("/orders/:id/status", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/admin/orders/:id/status"))
    admin.Post("/logs/activity", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/logs/activity"))
    admin.Get("/clients/", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/clients/"))
    admin.Get("/stats/", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/stats/"))
    admin.Get("/logs/", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/logs/"))
    admin.Get("/logs/stats", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/logs/stats"))
    admin.Get("/orders", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/admin/orders"))
    admin.Put("/orders/:id/status", proxy.ProxyToService(cfg.OrderServiceURL, "/api/v1/admin/orders/:id/status"))
    admin.Get("/clients/emails", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/clients/emails"))
    admin.Post("/clients/broadcast", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/clients/broadcast"))
    admin.Get("/discounts", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/discounts"))
    admin.Post("/discounts", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/discounts"))
    admin.Patch("/discounts/:id/toggle", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/discounts/:id/toggle"))
    admin.Post("/invoices/:id", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/invoices/:id"))
    admin.Post("/invoices/:id", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/invoices/:id"))
    admin.Delete("/discounts/:id", proxy.ProxyToService("http://localhost:8086", "/api/v1/admin/discounts/:id"))

    // Technician routes
    tech := app.Group("/api/v1/technician")
    if authMiddleware != nil { tech.Use(authMiddleware.RequireAuth) }
    tech.Get("/tickets", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets"))
    tech.Post("/tickets/:id/assign", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets/:id/assign"))
    tech.Put("/tickets/:id/status", proxy.ProxyToService(cfg.TicketServiceURL, "/api/v1/tickets/:id/status"))
	log.Printf("🚪 API Gateway démarré sur le port %s", cfg.Port)
	log.Fatal(app.Listen(":" + cfg.Port))
}

