package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/am-info/order-service/internal/model"
	"github.com/am-info/order-service/internal/repository"
	"github.com/google/uuid"
)

type OrderService struct {
	repo *repository.OrderRepository
}

func NewOrderService(repo *repository.OrderRepository) *OrderService {
	return &OrderService{repo: repo}
}

func (s *OrderService) CreateOrder(userID string, req model.CreateOrderRequest) (*model.Order, error) {
	cartItems, err := s.getCartItems(userID)
	if err != nil {
		return nil, fmt.Errorf("impossible de récupérer le panier: %w", err)
	}

	if len(cartItems) == 0 {
		return nil, errors.New("le panier est vide")
	}

	fmt.Printf("📦 %d articles dans le panier\n", len(cartItems))

	var subtotal float64
	var orderItems []model.OrderItem

	for _, item := range cartItems {
		productTotal := item.ProductPrice * float64(item.Quantity)
		subtotal += productTotal

		orderItems = append(orderItems, model.OrderItem{
			ProductID:    item.ProductID,
			ProductName:  item.ProductName,
			ProductSKU:   item.ProductSKU,
			ProductPrice: item.ProductPrice,
			Quantity:     item.Quantity,
			Total:        productTotal,
		})
	}

	taxAmount := subtotal * 0.20
	shippingAmount := 5.99
	if subtotal > 100 {
		shippingAmount = 0
	}
	total := subtotal + taxAmount + shippingAmount

	order := &model.Order{
		ID:              uuid.New().String(),
		UserID:          userID,
		Status:          model.StatusPending,
		Subtotal:        subtotal,
		TaxAmount:       taxAmount,
		ShippingAmount:  shippingAmount,
		Total:           total,
		Currency:        "EUR",
		ShippingAddress: req.ShippingAddress,
		PaymentMethod:   req.PaymentMethod,
		PaymentStatus:   model.PaymentPending,
		Notes:           req.Notes,
		Items:           orderItems,
	}

	if err := s.repo.CreateOrder(order); err != nil {
		return nil, fmt.Errorf("erreur création commande: %w", err)
	}

	s.clearCart(userID)

	return order, nil
}

func (s *OrderService) GetOrder(orderID string) (*model.Order, error) {
	return s.repo.GetOrderByID(orderID)
}

func (s *OrderService) GetUserOrders(userID string, status string) ([]model.Order, error) {
	return s.repo.GetOrdersByUser(userID, status)
}

func (s *OrderService) GetAllOrders(status string, page, limit int) ([]model.Order, int64, error) {
	if page < 1 {
		page = 1
	}
	if limit < 1 || limit > 100 {
		limit = 20
	}
	offset := (page - 1) * limit
	return s.repo.GetAllOrders(status, limit, offset)
}

func (s *OrderService) UpdateStatus(orderID, status string) error {
	return s.repo.UpdateStatus(orderID, status)
}

func (s *OrderService) ProcessPayment(orderID string, req model.PaymentRequest) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return errors.New("commande non trouvée")
	}

	if order.PaymentStatus == model.PaymentPaid {
		return errors.New("commande déjà payée")
	}

	paymentID := "PAY-" + uuid.New().String()[:12]
	paymentStatus := model.PaymentPaid
	orderStatus := model.StatusConfirmed

	s.repo.UpdateStatus(orderID, orderStatus)
	return s.repo.UpdatePaymentStatus(orderID, paymentStatus, paymentID)
}

func (s *OrderService) CancelOrder(orderID string) error {
	order, err := s.repo.GetOrderByID(orderID)
	if err != nil {
		return errors.New("commande non trouvée")
	}

	if order.Status == model.StatusShipped || order.Status == model.StatusDelivered {
		return errors.New("impossible d'annuler une commande expédiée")
	}

	return s.repo.UpdateStatus(orderID, model.StatusCancelled)
}

type CartItemInfo struct {
	ProductID    string  `json:"product_id"`
	ProductName  string  `json:"product_name"`
	ProductPrice float64 `json:"product_price"`
	ProductSKU   string  `json:"product_sku"`
	Quantity     int     `json:"quantity"`
}

func (s *OrderService) getCartItems(userID string) ([]CartItemInfo, error) {
	cartServiceURL := os.Getenv("CART_SERVICE_URL")
	if cartServiceURL == "" {
		cartServiceURL = "http://localhost:8083"
	}

	url := fmt.Sprintf("%s/api/v1/cart", cartServiceURL)
	
	req, err := http.NewRequest("GET", url, nil)
	if err != nil {
		return nil, err
	}
	req.Header.Set("X-User-ID", userID)
	
	client := &http.Client{}
	resp, err := client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erreur connexion cart service: %w", err)
	}
	defer resp.Body.Close()

	var cartResponse struct {
		Items []struct {
			ProductID string `json:"product_id"`
			Product   struct {
				ID    string  `json:"id"`
				Name  string  `json:"name"`
				Price float64 `json:"price"`
				SKU   string  `json:"sku"`
			} `json:"product"`
			Quantity int `json:"quantity"`
		} `json:"items"`
	}

	if err := json.NewDecoder(resp.Body).Decode(&cartResponse); err != nil {
		return nil, fmt.Errorf("erreur décodage panier: %w", err)
	}

	var items []CartItemInfo
	for _, item := range cartResponse.Items {
		items = append(items, CartItemInfo{
			ProductID:    item.ProductID,
			ProductName:  item.Product.Name,
			ProductPrice: item.Product.Price,
			ProductSKU:   item.Product.SKU,
			Quantity:     item.Quantity,
		})
		fmt.Printf("  → %s (x%d) = %.2f€\n", item.Product.Name, item.Quantity, item.Product.Price*float64(item.Quantity))
	}

	return items, nil
}

func (s *OrderService) clearCart(userID string) error {
	cartServiceURL := os.Getenv("CART_SERVICE_URL")
	if cartServiceURL == "" {
		cartServiceURL = "http://localhost:8083"
	}

	url := fmt.Sprintf("%s/api/v1/cart", cartServiceURL)
	req, _ := http.NewRequest("DELETE", url, nil)
	req.Header.Set("X-User-ID", userID)
	
	_, err := http.DefaultClient.Do(req)
	return err
}
