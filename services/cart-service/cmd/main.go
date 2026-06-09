package main

import (
	"log"
	"os"

	"github.com/am-info/cart-service/internal/handler"
	"github.com/am-info/cart-service/internal/middleware"
	"github.com/am-info/cart-service/internal/model"
	"github.com/am-info/cart-service/internal/repository"
	"github.com/am-info/cart-service/internal/service"
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
		dsn = "postgresql://aminfo:aminfo123@localhost:5433/aminfo_cart?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	if err := db.AutoMigrate(&model.CartItem{}); err != nil {
		log.Fatal("❌ Erreur migration:", err)
	}

	log.Println("✅ Cart Service: Database connectée")

	repo := repository.NewCartRepository(db)
	cartService := service.NewCartService(repo)
	cartHandler := handler.NewCartHandler(cartService)

	app := fiber.New(fiber.Config{
		AppName: "AM Info - Cart Service",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-User-ID",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "cart-service"})
	})

	// Toutes les routes protégées par JWT
	api := app.Group("/api/v1/cart")
	api.Use(middleware.AuthMiddleware)

	api.Get("/", cartHandler.GetCart)
	api.Get("/count", cartHandler.GetCartCount)
	api.Post("/items", cartHandler.AddToCart)
	api.Put("/items/:id", cartHandler.UpdateQuantity)
	api.Delete("/items/:id", cartHandler.RemoveItem)
	api.Delete("/", cartHandler.ClearCart)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8083"
	}

	log.Printf("🛒 Cart Service démarré sur le port %s", port)
	log.Fatal(app.Listen(":" + port))
}
