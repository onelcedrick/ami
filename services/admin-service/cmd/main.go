package main

import (
	"database/sql"
	"log"
	"os"

	"github.com/am-info/admin-service/internal/handler"
	"github.com/am-info/admin-service/internal/middleware"
	"github.com/am-info/admin-service/internal/repository"
	"github.com/am-info/admin-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	_ "github.com/lib/pq"
)

func main() {
	authDSN := getEnv("AUTH_DATABASE_URL", "postgresql://aminfo:aminfo123@localhost:5433/aminfo_auth?sslmode=disable")
	ordersDSN := getEnv("ORDERS_DATABASE_URL", "postgresql://aminfo:aminfo123@localhost:5433/aminfo_orders?sslmode=disable")
	productsDSN := getEnv("PRODUCTS_DATABASE_URL", "postgresql://aminfo:aminfo123@localhost:5433/aminfo_products?sslmode=disable")
	ticketsDSN := getEnv("TICKETS_DATABASE_URL", "postgresql://aminfo:aminfo123@localhost:5433/aminfo_tickets?sslmode=disable")
	discountDSN := getEnv("DISCOUNT_DATABASE_URL", "postgresql://aminfo:aminfo123@localhost:5433/aminfo_orders?sslmode=disable")

	authDB := mustConnect(authDSN)
	ordersDB := mustConnect(ordersDSN)
	productsDB := mustConnect(productsDSN)
	ticketsDB := mustConnect(ticketsDSN)
	discountDB := mustConnect(discountDSN)

	log.Println("✅ Admin Service: All databases connected")

	clientRepo := repository.NewClientRepository(authDB, ordersDB)
	statsRepo := repository.NewStatsRepository(authDB, ordersDB, productsDB, ticketsDB)
	discRepo := repository.NewDiscountRepository(discountDB)
	logsRepo := repository.NewLogsRepository(ordersDB)
	adminService := service.NewAdminService(clientRepo, statsRepo, discRepo, logsRepo)
	adminHandler := handler.NewAdminHandler(adminService)

	app := fiber.New(fiber.Config{AppName: "AM Info - Admin Service"})
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{AllowOrigins: "*", AllowMethods: "GET,POST,PUT,DELETE,PATCH", AllowHeaders: "Origin,Content-Type,Accept,Authorization"}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "admin-service"})
	})

	admin := app.Group("/api/v1/admin")
	admin.Use(middleware.RequireAuth)
	admin.Use(middleware.RequireAdmin)

	admin.Get("/stats/", adminHandler.GetStats)
	admin.Get("/clients/", adminHandler.ListClients)
	admin.Get("/clients/emails", adminHandler.GetEmails)
	admin.Post("/clients/broadcast", adminHandler.Broadcast)
	admin.Get("/discounts", adminHandler.ListDiscounts)
	admin.Post("/discounts", adminHandler.CreateDiscount)
	admin.Patch("/discounts/:id/toggle", adminHandler.ToggleDiscount)
	admin.Delete("/discounts/:id", adminHandler.DeleteDiscount)
	admin.Post("/invoices/:id", adminHandler.GenerateInvoice)
    admin.Get("/invoices/:id", adminHandler.ViewInvoice)
	admin.Get("/logs/", adminHandler.GetLogs)
	admin.Get("/logs/stats", adminHandler.GetLogStats)
    admin.Post("/logs/activity", adminHandler.LogActivity)
    // Payments

	port := getEnv("PORT", "8086")
	log.Printf("🛡️ Admin Service démarré sur le port %s", port)
	log.Fatal(app.Listen(":" + port))
}

func getEnv(key, defaultVal string) string { if v := os.Getenv(key); v != "" { return v }; return defaultVal }
func mustConnect(dsn string) *sql.DB { db, err := sql.Open("postgres", dsn); if err != nil { log.Fatal(err) }; return db }
