package main

import (
	"log"
	"os"

	"github.com/am-info/auth-service/internal/handler"
	"github.com/am-info/auth-service/internal/middleware"
	"github.com/am-info/auth-service/internal/model"
	"github.com/am-info/auth-service/internal/repository"
	"github.com/am-info/auth-service/internal/service"
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
		dsn = "postgresql://aminfo:aminfo123@localhost:5433/aminfo_auth?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	if err := db.AutoMigrate(&model.User{}); err != nil {
		log.Fatal("❌ Erreur migration:", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)

	log.Println("✅ Database connectée et migrée")

	repo := repository.NewUserRepository(db)
	authService, err := service.NewAuthService(repo)
	if err != nil {
		log.Fatal("❌ Erreur initialisation auth service:", err)
	}

	authHandler := handler.NewAuthHandler(authService)
	authMiddleware := middleware.NewAuthMiddleware(authService.PublicKey())

	app := fiber.New(fiber.Config{
		AppName: "AM Info - Auth Service",
	})

	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":  "ok",
			"service": "auth-service",
		})
	})

	api := app.Group("/api/v1/auth")

	// Routes publiques
	api.Post("/register", authHandler.Register)
	api.Post("/login", authHandler.Login)
	api.Post("/refresh", authHandler.RefreshToken)

	// Routes protégées
	protected := api.Group("")
	protected.Use(authMiddleware.RequireAuth)
	protected.Get("/me", authHandler.GetProfile)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8081"
	}

	log.Printf("🔐 Auth Service démarré sur le port %s", port)
	log.Println("📝 Algorithmes: JWT RS256 + Argon2id")
	log.Fatal(app.Listen(":" + port))
}
