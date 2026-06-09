package main

import (
	"context"
	"log"
	"os"

	"github.com/am-info/product-service/internal/handler"
	"github.com/am-info/product-service/internal/model"
	"github.com/am-info/product-service/internal/repository"
	"github.com/am-info/product-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/redis/go-redis/v9"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://aminfo:aminfo123@localhost:5433/aminfo_products?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	if err := db.AutoMigrate(&model.Category{}, &model.Product{}); err != nil {
		log.Fatal("❌ Erreur migration:", err)
	}

	sqlDB, _ := db.DB()
	sqlDB.SetMaxOpenConns(25)
	sqlDB.SetMaxIdleConns(10)

	log.Println("✅ Database connectée et migrée")

	redisURL := os.Getenv("REDIS_URL")
	if redisURL == "" {
		redisURL = "localhost:6380"
	}

	redisClient := redis.NewClient(&redis.Options{
		Addr:     redisURL,
		Password: os.Getenv("REDIS_PASSWORD"),
		DB:       0,
	})

	ctx := context.Background()
	if err := redisClient.Ping(ctx).Err(); err != nil {
		log.Println("⚠️  Redis non disponible:", err)
	} else {
		log.Println("✅ Redis connecté")
	}

	repo := repository.NewProductRepository(db)
	productService := service.NewProductService(repo, redisClient)
	productHandler := handler.NewProductHandler(productService, repo)

	seedData(db)

	app := fiber.New(fiber.Config{
		AppName: "AM Info - Product Service",
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
			"service": "product-service",
		})
	})

	api := app.Group("/api/v1")
	api.Get("/products", productHandler.GetProducts)
	api.Get("/products/featured", productHandler.GetFeaturedProducts)
	api.Get("/products/:id", productHandler.GetProduct)
	api.Post("/products", productHandler.CreateProduct)
	api.Put("/products/:id", productHandler.UpdateProduct)
	api.Delete("/products/:id", productHandler.DeleteProduct)
	api.Get("/categories", productHandler.GetCategories)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8082"
	}

	log.Printf("🚀 Product Service démarré sur le port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func seedData(db *gorm.DB) {
	// Vérifier si des produits existent déjà
	var count int64
	db.Model(&model.Product{}).Count(&count)
	if count > 0 {
		log.Println("📦 Données déjà existantes, skip seed")
		return
	}

	log.Println("📦 Création des données de test...")

	categories := []model.Category{
		{Name: "Informatique", Slug: "informatique", Description: "Ordinateurs et accessoires"},
		{Name: "Téléphonie", Slug: "telephonie", Description: "Smartphones et accessoires"},
		{Name: "Audio", Slug: "audio", Description: "Casques, écouteurs, enceintes"},
		{Name: "Gaming", Slug: "gaming", Description: "Jeux et matériel gaming"},
	}
	db.Create(&categories)

	products := []model.Product{
		{
			Name: "MacBook Pro 16\"", Slug: "macbook-pro-16",
			Description: "Ordinateur portable puissant avec puce M3",
			Price: 2499.99, SKU: "MBP16-M3-001", StockQuantity: 15,
			CategoryID: &categories[0].ID, Brand: "Apple", IsFeatured: true,
		},
		{
			Name: "iPhone 15 Pro", Slug: "iphone-15-pro",
			Description: "Smartphone haut de gamme",
			Price: 1199.99, SKU: "IP15P-001", StockQuantity: 30,
			CategoryID: &categories[1].ID, Brand: "Apple", IsFeatured: true,
		},
		{
			Name: "Sony WH-1000XM5", Slug: "sony-wh1000xm5",
			Description: "Casque audio sans fil avec réduction de bruit",
			Price: 349.99, SKU: "SONY-XM5-001", StockQuantity: 50,
			CategoryID: &categories[2].ID, Brand: "Sony",
		},
		{
			Name: "Dell XPS 15", Slug: "dell-xps-15",
			Description: "PC portable premium",
			Price: 1799.99, SKU: "DELL-XPS15-001", StockQuantity: 10,
			CategoryID: &categories[0].ID, Brand: "Dell",
		},
		{
			Name: "Samsung Galaxy S24", Slug: "samsung-galaxy-s24",
			Description: "Smartphone Android premium",
			Price: 899.99, SKU: "SAM-S24-001", StockQuantity: 25,
			CategoryID: &categories[1].ID, Brand: "Samsung",
		},
		{
			Name: "Logitech G Pro X", Slug: "logitech-g-pro-x",
			Description: "Casque gaming sans fil",
			Price: 199.99, SKU: "LOG-GPX-001", StockQuantity: 40,
			CategoryID: &categories[3].ID, Brand: "Logitech",
		},
		{
			Name: "AirPods Pro 2", Slug: "airpods-pro-2",
			Description: "Écouteurs sans fil avec réduction de bruit",
			Price: 279.99, SKU: "APP-AP2-001", StockQuantity: 60,
			CategoryID: &categories[2].ID, Brand: "Apple",
		},
	}
	db.Create(&products)

	log.Printf("✅ %d catégories et %d produits créés", len(categories), len(products))
}
