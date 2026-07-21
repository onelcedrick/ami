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

type CartResponse struct {
	Items []CartItemInfo `json:"items"`
}

type CartItemInfo struct {
	ProductName string  `json:"product_name"`
	ProductID   string  `json:"product_id"`
	UnitPrice   float64 `json:"unit_price"`
	Quantity    int     `json:"quantity"`
	Stock       int     `json:"stock"`
}

func (s *OrderService) CreateOrder(userID string) (*model.Order, error) {
	cartItems, err := s.getCartItems(userID)
	if err != nil || len(cartItems) == 0 {
		return nil, errors.New("panier vide")
	}

	order := &model.Order{
		UserID: userID,
		Status: model.StatusAwaitingPayment,
	}

	var totalAmount float64
	var orderItems []model.OrderItem

	for _, item := range cartItems {
		lineTotal := item.UnitPrice * float64(item.Quantity)
		totalAmount += lineTotal

		orderItems = append(orderItems, model.OrderItem{
			ID:          uuid.New().String(),
			OrderID:     "", // sera rempli après création
			ProductID:   item.ProductID,
			ProductName: item.ProductName,
			Quantity:    item.Quantity,
			UnitPrice:   item.UnitPrice,
			Total:       lineTotal,
		})
	}

	order.TotalAmount = totalAmount
	order.Items = orderItems
	order.ID = uuid.New().String()

	if err := s.repo.Create(order); err != nil {
		return nil, err
	}

	// Mettre à jour les OrderID des items
	for i := range orderItems {
		orderItems[i].OrderID = order.ID
	}

	// Vider le panier
	s.clearCart(userID)

	return order, nil
}

func (s *OrderService) GetUserOrders(userID string) ([]model.Order, error) {
	return s.repo.GetByUser(userID)
}

func (s *OrderService) GetAllOrders() ([]model.Order, error) {
	return s.repo.GetAll()
}

func (s *OrderService) GetOrder(orderID string) (*model.Order, error) {
	return s.repo.GetByID(orderID)
}

func (s *OrderService) CancelOrder(userID, orderID string) error {
	order, err := s.repo.GetByID(orderID)
	if err != nil {
		return errors.New("commande introuvable")
	}
	if order.UserID != userID {
		return errors.New("non autorise")
	}
	if order.Status != model.StatusPending && order.Status != model.StatusAwaitingPayment {
		return errors.New("seules les commandes en attente peuvent etre annulees")
	}
	return s.repo.UpdateStatus(orderID, model.StatusCancelled)
}

func (s *OrderService) UpdateStatus(orderID, status string) error {
	return s.repo.UpdateStatus(orderID, status)
}

func (s *OrderService) getCartItems(userID string) ([]CartItemInfo, error) {
	cartURL := os.Getenv("CART_SERVICE_URL")
	if cartURL == "" { cartURL = "http://localhost:8083" }

	req, _ := http.NewRequest("GET", fmt.Sprintf("%s/api/v1/cart/", cartURL), nil)
	req.Header.Set("X-User-ID", userID)
	
	token := os.Getenv("TOKEN")
	if token == "" {
		// Essayer de récupérer le token du contexte
		token = req.Header.Get("Authorization")
	}
	
	resp, err := http.DefaultClient.Do(req)
	if err != nil { return nil, err }
	defer resp.Body.Close()

	var cart CartResponse
	if err := json.NewDecoder(resp.Body).Decode(&cart); err != nil {
		return nil, err
	}
	
	fmt.Printf("📦 %d articles dans le panier\n", len(cart.Items))
	for _, item := range cart.Items {
		fmt.Printf("  → %s (x%d) = %.2f\n", item.ProductName, item.Quantity, item.UnitPrice*float64(item.Quantity))
	}
	
	return cart.Items, nil
}

func (s *OrderService) clearCart(userID string) {
	cartURL := os.Getenv("CART_SERVICE_URL")
	if cartURL == "" { cartURL = "http://localhost:8083" }
	req, _ := http.NewRequest("DELETE", fmt.Sprintf("%s/api/v1/cart/", cartURL), nil)
	req.Header.Set("X-User-ID", userID)
	http.DefaultClient.Do(req)
}
