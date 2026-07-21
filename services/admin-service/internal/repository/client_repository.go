package repository

import (
	"database/sql"
)

type ClientRepository struct {
	authDB   *sql.DB
	ordersDB *sql.DB
}

func NewClientRepository(authDB, ordersDB *sql.DB) *ClientRepository {
	return &ClientRepository{authDB: authDB, ordersDB: ordersDB}
}

func (r *ClientRepository) GetClients() ([]map[string]interface{}, error) {
	rows, err := r.authDB.Query(`
		SELECT u.id, u.first_name || ' ' || u.last_name as full_name, u.email,
			u.created_at, u.is_active
		FROM users u
		WHERE u.role = 'client'
		ORDER BY u.created_at DESC
	`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var clients []map[string]interface{}
	for rows.Next() {
		var id, fullName, email string
		var createdAt sql.NullTime
		var isActive bool
		rows.Scan(&id, &fullName, &email, &createdAt, &isActive)

		// Récupérer total_spent depuis la DB orders
		var totalSpent float64
		var totalOrders int
		r.ordersDB.QueryRow(`
			SELECT COALESCE(SUM(total), 0), COUNT(id) 
			FROM orders WHERE user_id = $1 AND status IN ('paid', 'delivered')
		`, id).Scan(&totalSpent, &totalOrders)

		clients = append(clients, map[string]interface{}{
			"id":           id,
			"full_name":    fullName,
			"email":        email,
			"total_spent":  totalSpent,
			"total_orders": totalOrders,
			"created_at":   createdAt.Time,
			"is_active":    isActive,
		})
	}

	if clients == nil {
		clients = []map[string]interface{}{}
	}
	return clients, nil
}

func (r *ClientRepository) GetClientEmails() ([]map[string]string, error) {
	rows, err := r.authDB.Query(`
		SELECT email, first_name || ' ' || last_name as full_name 
		FROM users WHERE role = 'client' AND is_active = true
	`)
	if err != nil {
		return nil, err
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
	return emails, nil
}
