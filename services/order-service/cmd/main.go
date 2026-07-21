package main

import (
	"log"
	"os"

	"github.com/am-info/order-service/internal/handler"
	"github.com/am-info/order-service/internal/middleware"
	"github.com/am-info/order-service/internal/model"
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

	// Recréer les tables avec les bons champs
	db.AutoMigrate(&model.Order{}, &model.OrderItem{})

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

	api := app.Group("/api/v1")
	api.Use(middleware.AuthMiddleware)

	api.Post("/orders", orderHandler.CreateOrder)
	api.Get("/orders", orderHandler.GetUserOrders)
	api.Get("/orders/:id", orderHandler.GetOrder)
	api.Put("/orders/:id/cancel", orderHandler.CancelOrder)

	admin := api.Group("/admin")
	admin.Get("/orders", orderHandler.GetAllOrders)
	admin.Put("/orders/:id/status", orderHandler.UpdateStatus)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8084"
	}

	log.Printf("📦 Order Service démarré sur le port %s", port)
	log.Fatal(app.Listen(":" + port))
}
