package main

import (
	"log"
	"os"

	"github.com/am-info/ticket-service/internal/handler"
	"github.com/am-info/ticket-service/internal/middleware"
	"github.com/am-info/ticket-service/internal/repository"
	"github.com/am-info/ticket-service/internal/service"
	ws "github.com/am-info/ticket-service/internal/websocket"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/websocket/v2"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func main() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "postgresql://aminfo:aminfo123@localhost:5433/aminfo_tickets?sslmode=disable"
	}

	db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("❌ Erreur connexion DB:", err)
	}

	// Créer les tables
	db.Exec(`CREATE TABLE IF NOT EXISTS tickets (
		id VARCHAR(36) PRIMARY KEY, client_id VARCHAR(255) NOT NULL,
		technician_id VARCHAR(255), order_id VARCHAR(36),
		subject VARCHAR(255) NOT NULL, description TEXT NOT NULL,
		status VARCHAR(20) DEFAULT 'open', priority VARCHAR(10) DEFAULT 'medium',
		category VARCHAR(50) DEFAULT 'general',
		created_at TIMESTAMPTZ DEFAULT NOW(), updated_at TIMESTAMPTZ DEFAULT NOW(),
		resolved_at TIMESTAMPTZ, closed_at TIMESTAMPTZ
	)`)
	db.Exec(`CREATE TABLE IF NOT EXISTS ticket_messages (
		id VARCHAR(36) PRIMARY KEY, ticket_id VARCHAR(36) NOT NULL,
		sender_id VARCHAR(255) NOT NULL, sender_role VARCHAR(20) NOT NULL,
		message TEXT NOT NULL, attachment_url TEXT,
		is_read BOOLEAN DEFAULT false, created_at TIMESTAMPTZ DEFAULT NOW()
	)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_tickets_client ON tickets(client_id)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status)`)
	db.Exec(`CREATE INDEX IF NOT EXISTS idx_ticket_msgs_ticket ON ticket_messages(ticket_id)`)

	log.Println("✅ Ticket Service: Database connectée")

	wsHub := service.NewWebSocketHub()
	repo := repository.NewTicketRepository(db)
	ticketService := service.NewTicketService(repo, wsHub)
	ticketHandler := handler.NewTicketHandler(ticketService)
	wsHandler := ws.NewWSHandler(wsHub)

	app := fiber.New(fiber.Config{AppName: "AM Info - Ticket Service"})
	app.Use(recover.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,DELETE",
		AllowHeaders: "Origin,Content-Type,Accept,Authorization,X-User-ID,X-User-Role",
	}))

	app.Get("/health", func(c *fiber.Ctx) error {
		return c.JSON(fiber.Map{"status": "ok", "service": "ticket-service"})
	})

	// WebSocket
	app.Get("/ws", websocket.New(wsHandler.HandleConnection))

	// Routes protégées
	api := app.Group("/api/v1")
	api.Use(middleware.AuthMiddleware)

	api.Post("/tickets", ticketHandler.CreateTicket)
	api.Get("/tickets", ticketHandler.GetTickets)
	api.Get("/tickets/unread-count", ticketHandler.GetUnreadCount)
	api.Get("/tickets/:id", ticketHandler.GetTicket)
	api.Post("/tickets/:id/messages", ticketHandler.AddMessage)
	api.Put("/tickets/:id/status", ticketHandler.UpdateStatus)
	api.Post("/tickets/:id/assign", ticketHandler.AssignTechnician)
	api.Post("/tickets/:id/read", ticketHandler.MarkAsRead)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8085"
	}

	log.Printf("🎫 Ticket Service démarré sur le port %s", port)
	log.Printf("📡 WebSocket: ws://localhost:%s/ws?user_id=USER&role=ROLE", port)
	log.Fatal(app.Listen(":" + port))
}
