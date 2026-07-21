package model

type DashboardStats struct {
	TotalOrders     int                    `json:"total_orders"`
	OrdersByStatus  map[string]int         `json:"orders_by_status"`
	TotalRevenue    float64                `json:"total_revenue"`
	Revenue30d      float64                `json:"revenue_30d"`
	DailyOrders     []DailyOrder           `json:"daily_orders"`
	TicketsByStatus map[string]int         `json:"tickets_by_status"`
	TopCategories   []CategoryCount        `json:"top_categories"`
	LowStock        int                    `json:"low_stock"`
	OutOfStock      int                    `json:"out_of_stock"`
	TotalClients    int                    `json:"total_clients"`
	TotalProducts   int                    `json:"total_products"`
	TotalTickets    int                    `json:"total_tickets"`
}

type DailyOrder struct {
	Date  string `json:"date"`
	Count int    `json:"count"`
}

type CategoryCount struct {
	Name  string `json:"name"`
	Count int    `json:"count"`
}
