package handler

import (
	"database/sql"
	"fmt"
	"log"

	"github.com/gofiber/fiber/v2"
	_ "github.com/lib/pq"
)

type AdminHandler struct {
	db *sql.DB
}

func NewAdminHandler(db *sql.DB) *AdminHandler {
	return &AdminHandler{db: db}
}

// GET /api/v1/admin/clients/
func (h *AdminHandler) ListClients(c *fiber.Ctx) error {
	rows, err := h.db.Query(`
		SELECT u.id, u.first_name || ' ' || u.last_name as full_name, u.email,
			COALESCE(SUM(CASE WHEN o.status IN ('paid', 'delivered') THEN o.total ELSE 0 END), 0) as total_spent,
			COUNT(o.id) as total_orders,
			u.created_at, u.is_active
		FROM users u
		LEFT JOIN orders o ON u.id = o.user_id
		WHERE u.role = 'client'
		GROUP BY u.id
		ORDER BY total_spent DESC
	`)
	if err != nil {
		log.Printf("❌ Erreur liste clients: %v", err)
		return c.JSON([]interface{}{})
	}
	defer rows.Close()

	var clients []map[string]interface{}
	for rows.Next() {
		var id, fullName, email string
		var totalSpent float64
		var totalOrders int
		var createdAt sql.NullTime
		var isActive bool

		rows.Scan(&id, &fullName, &email, &totalSpent, &totalOrders, &createdAt, &isActive)
		clients = append(clients, map[string]interface{}{
			"id": id, "full_name": fullName, "email": email,
			"total_spent": totalSpent, "total_orders": totalOrders,
			"created_at": createdAt.Time,
			"is_active": isActive,
		})
	}

	if clients == nil {
		clients = []map[string]interface{}{}
	}
	return c.JSON(clients)
}

// GET /api/v1/admin/clients/emails
func (h *AdminHandler) GetEmails(c *fiber.Ctx) error {
	rows, err := h.db.Query(`
		SELECT email, first_name || ' ' || last_name as full_name 
		FROM users WHERE role = 'client' AND is_active = true
	`)
	if err != nil {
		return c.JSON([]interface{}{})
	}
	defer rows.Close()

	var emails []map[string]string
	for rows.Next() {
		var email, name string
		rows.Scan(&email, &name)
		emails = append(emails, map[string]string{"email": email, "name": name})
	}
	if emails == nil {
		emails = []map[string]string{}
	}
	return c.JSON(emails)
}

// POST /api/v1/admin/clients/broadcast
func (h *AdminHandler) Broadcast(c *fiber.Ctx) error {
	var input struct {
		Subject    string   `json:"subject"`
		Message    string   `json:"message"`
		ClientIDs  []string `json:"client_ids"`
	}
	if err := c.BodyParser(&input); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Données invalides"})
	}

	if input.Subject == "" || input.Message == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Sujet et message requis"})
	}

	// Récupérer les emails
	query := "SELECT email, first_name || ' ' || last_name FROM users WHERE role = 'client' AND is_active = true"
	args := []interface{}{}
	if len(input.ClientIDs) > 0 {
		query += " AND email = ANY($1)"
		args = append(args, input.ClientIDs)
	}

	rows, err := h.db.Query(query, args...)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Erreur"})
	}
	defer rows.Close()

	type Client struct {
		Email string
		Name  string
	}
	var clients []Client
	for rows.Next() {
		var c Client
		rows.Scan(&c.Email, &c.Name)
		clients = append(clients, c)
	}

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Envoye a %d/%d client(s)", len(clients), len(clients)),
		"sent": len(clients),
		"total": len(clients),
	})
}
