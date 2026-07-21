package repository

import (
	"database/sql"
	"time"
)

type StatsRepository struct {
	authDB    *sql.DB
	ordersDB  *sql.DB
	productsDB *sql.DB
	ticketsDB *sql.DB
}

func NewStatsRepository(authDB, ordersDB, productsDB, ticketsDB *sql.DB) *StatsRepository {
	return &StatsRepository{
		authDB:    authDB,
		ordersDB:  ordersDB,
		productsDB: productsDB,
		ticketsDB: ticketsDB,
	}
}

func (r *StatsRepository) GetDashboardStats() (map[string]interface{}, error) {
	now := time.Now()

	// Total orders
	var totalOrders int
	r.ordersDB.QueryRow("SELECT COUNT(*) FROM orders").Scan(&totalOrders)

	// Orders by status
	ordersByStatus := make(map[string]int)
	statuses := []string{"pending", "awaiting_payment", "confirmed", "paid", "shipped", "delivered", "cancelled"}
	for _, status := range statuses {
		var count int
		r.ordersDB.QueryRow("SELECT COUNT(*) FROM orders WHERE status = $1", status).Scan(&count)
		ordersByStatus[status] = count
	}

	// Total revenue
	var totalRevenue sql.NullFloat64
	r.ordersDB.QueryRow("SELECT COALESCE(SUM(total), 0) FROM orders WHERE status IN ('paid', 'delivered')").Scan(&totalRevenue)

	// Revenue 30 days
	var revenue30d sql.NullFloat64
	r.ordersDB.QueryRow("SELECT COALESCE(SUM(total), 0) FROM orders WHERE created_at >= $1 AND status IN ('paid', 'delivered')", 
		now.AddDate(0, 0, -30)).Scan(&revenue30d)

	// Daily orders (7 days)
	dailyOrders := []map[string]interface{}{}
	for i := 6; i >= 0; i-- {
		day := now.AddDate(0, 0, -i)
		dayStart := time.Date(day.Year(), day.Month(), day.Day(), 0, 0, 0, 0, day.Location())
		dayEnd := dayStart.AddDate(0, 0, 1)
		var count int
		r.ordersDB.QueryRow("SELECT COUNT(*) FROM orders WHERE created_at >= $1 AND created_at < $2", dayStart, dayEnd).Scan(&count)
		dailyOrders = append(dailyOrders, map[string]interface{}{
			"date":  dayStart.Format("02/01"),
			"count": count,
		})
	}

	// Tickets by status
	ticketsByStatus := make(map[string]int)
	ticketStatuses := []string{"open", "in_progress", "waiting_client", "resolved", "closed"}
	for _, status := range ticketStatuses {
		var count int
		r.ticketsDB.QueryRow("SELECT COUNT(*) FROM tickets WHERE status = $1", status).Scan(&count)
		ticketsByStatus[status] = count
	}

	// Top categories
	topCategories := []map[string]interface{}{}
	rows, err := r.productsDB.Query(`
		SELECT c.name, COUNT(p.id) 
		FROM products p JOIN categories c ON p.category_id = c.id 
		GROUP BY c.name ORDER BY COUNT(p.id) DESC LIMIT 5
	`)
	if err == nil {
		defer rows.Close()
		for rows.Next() {
			var name string
			var count int
			rows.Scan(&name, &count)
			topCategories = append(topCategories, map[string]interface{}{"name": name, "count": count})
		}
	}
	if topCategories == nil {
		topCategories = []map[string]interface{}{}
	}

	// Stock
	var lowStock, outOfStock int
	r.productsDB.QueryRow("SELECT COUNT(*) FROM products WHERE stock_quantity <= 5 AND stock_quantity > 0").Scan(&lowStock)
	r.productsDB.QueryRow("SELECT COUNT(*) FROM products WHERE stock_quantity = 0").Scan(&outOfStock)

	// Total clients
	var totalClients int
	r.authDB.QueryRow("SELECT COUNT(*) FROM users WHERE role = 'client'").Scan(&totalClients)

	// Total products
	var totalProducts int
	r.productsDB.QueryRow("SELECT COUNT(*) FROM products").Scan(&totalProducts)

	// Total tickets
	var totalTickets int
	r.ticketsDB.QueryRow("SELECT COUNT(*) FROM tickets").Scan(&totalTickets)

	result := map[string]interface{}{
		"total_orders":      totalOrders,
		"orders_by_status":  ordersByStatus,
		"total_revenue":     totalRevenue.Float64,
		"revenue_30d":       revenue30d.Float64,
		"daily_orders":      dailyOrders,
		"tickets_by_status": ticketsByStatus,
		"top_categories":    topCategories,
		"low_stock":         lowStock,
		"out_of_stock":      outOfStock,
		"total_clients":     totalClients,
		"total_products":    totalProducts,
		"total_tickets":     totalTickets,
	}

	return result, nil
}
