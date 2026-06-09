package main

import (
	"log"
	"os"

	"github.com/am-info/order-service/internal/handler"
	"github.com/am-info/order-service/internal/middleware"
	"github.com/am-info/order-service/internal/repository"
	"github.com/am-info/order-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://aminfo:aminfo123@localhost:5433/aminfo_orders?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	// Créer les tables si nécessaire
	db.Exec(`CREATE TABLE IF NOT EXISTS orders (
		id VARCHAR(36) PRIMARY KEY, user_id VARCHAR(255) NOT NULL,
		order_number VARCHAR(20) NOT NULL UNIQUE, status VARCHAR(20) DEFAULT 'pending',
		subtotal NUMERIC(10,2) NOT NULL, tax_amount NUMERIC(10,2) DEFAULT 0,
		shipping_amount NUMERIC(10,2) DEFAULT 0, discount_amount NUMERIC(10,2) DEFAULT 0,
		total NUMERIC(10,2) NOT NULL, currency VARCHAR(3) DEFAULT 'EUR',
		shipping_address TEXT, payment_method VARCHAR(50),
		payment_status VARCHAR(20) DEFAULT 'pending', payment_id VARCHAR(255),
		notes TEXT, created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS order_items (
		id VARCHAR(36) PRIMARY KEY, order_id VARCHAR(36) NOT NULL,
		product_id VARCHAR(255) NOT NULL, product_name VARCHAR(255) NOT NULL,
		product_sku VARCHAR(100), product_price NUMERIC(10,2) NOT NULL,
		quantity INT NOT NULL, total NUMERIC(10,2) NOT NULL
	)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_orders_user ON orders(user_id)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(order_id)`)

	log.Println("✅ Order Service: Database connectée")

	repo := repository.NewOrderRepository(db)
	orderService := service.NewOrderService(repo)
	orderHandler := handler.NewOrderHandler(orderService)

	app := fiber.New(fiber.Config{AppName: "AM Info - Order Service"})
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-User-ID",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "order-service"})
	})

	// Routes protégées
	api := app.Group("/api/v1")
	api.Use(middleware.AuthMiddleware)

	api.Post("/orders", orderHandler.CreateOrder)
	api.Get("/orders", orderHandler.GetUserOrders)
	api.Get("/orders/:id", orderHandler.GetOrder)
	api.Post("/orders/:id/pay", orderHandler.ProcessPayment)
	api.Put("/orders/:id/cancel", orderHandler.CancelOrder)

	// Admin
	admin := app.Group("/api/v1/admin")
	admin.Use(middleware.AuthMiddleware)
	admin.Put("/orders/:id/status", orderHandler.UpdateStatus)
	admin.Get("/orders", orderHandler.GetAllOrders)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	log.Printf("📦 Order Service démarré sur le port %s", port)
	log.Fatal(app.Listen(":" + port))
}
