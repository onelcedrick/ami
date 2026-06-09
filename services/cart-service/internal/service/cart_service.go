package service

import (
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"os"

	"github.com/am-info/cart-service/internal/model"
	"github.com/am-info/cart-service/internal/repository"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type CartService struct {
	repo *repository.CartRepository
}

func NewCartService(repo *repository.CartRepository) *CartService {
	return &CartService{repo: repo}
}

func (s *CartService) GetCart(userID string) (*model.CartResponse, error) {
	items, err := s.repo.GetCart(userID)
	if err != nil {
		return nil, err
	}

	var cartItems []model.CartItemResponse
	totalPrice := 0.0

	for _, item := range items {
		product, err := s.getProductInfo(item.ProductID)
		if err != nil {
			continue
		}

		subtotal := product.Price * float64(item.Quantity)
		totalPrice += subtotal

		cartItems = append(cartItems, model.CartItemResponse{
			ID:        item.ID,
			ProductID: item.ProductID,
			Product:   *product,
			Quantity:  item.Quantity,
			Subtotal:  subtotal,
		})
	}

	if cartItems == nil {
		cartItems = []model.CartItemResponse{}
	}

	return &model.CartResponse{
		Items:      cartItems,
		TotalItems: len(cartItems),
		TotalPrice: totalPrice,
	}, nil
}

func (s *CartService) AddToCart(userID string, req model.AddToCartRequest) (*model.CartItem, error) {
	product, err := s.getProductInfo(req.ProductID)
	if err != nil {
		return nil, errors.New("produit non trouvé")
	}

	if req.Quantity <= 0 {
		req.Quantity = 1
	}

	// Vérifier si le produit est déjà dans le panier
	existingItem, err := s.repo.FindByUserAndProduct(userID, req.ProductID)
	if err == nil {
		// Mettre à jour la quantité
		newQty := existingItem.Quantity + req.Quantity
		if newQty > product.Stock {
			return nil, fmt.Errorf("stock insuffisant: %d disponible(s)", product.Stock)
		}
		s.repo.UpdateQuantity(existingItem.ID, newQty)
		existingItem.Quantity = newQty
		return existingItem, nil
	}

	if !errors.Is(err, gorm.ErrRecordNotFound) {
		return nil, err
	}

	// Nouvel article
	item := &model.CartItem{
		ID:        uuid.New().String(),
		UserID:    userID,
		ProductID: req.ProductID,
		Quantity:  req.Quantity,
	}

	if err := s.repo.Create(item); err != nil {
		return nil, fmt.Errorf("erreur ajout au panier: %w", err)
	}

	return item, nil
}

func (s *CartService) UpdateQuantity(userID, itemID string, quantity int) error {
	if quantity <= 0 {
		return errors.New("la quantité doit être supérieure à 0")
	}
	return s.repo.UpdateQuantity(itemID, quantity)
}

func (s *CartService) RemoveItem(userID, itemID string) error {
	return s.repo.RemoveItem(userID, itemID)
}

func (s *CartService) ClearCart(userID string) error {
	return s.repo.ClearCart(userID)
}

func (s *CartService) GetCartCount(userID string) (int64, error) {
	return s.repo.GetCartCount(userID)
}

func (s *CartService) getProductInfo(productID string) (*model.ProductInfo, error) {
	productServiceURL := os.Getenv("PRODUCT_SERVICE_URL")
	if productServiceURL == "" {
		productServiceURL = "http://localhost:8082"
	}

	resp, err := http.Get(fmt.Sprintf("%s/api/v1/products/%s", productServiceURL, productID))
	if err != nil {
		return nil, err
	}
	defer resp.Body.Close()

	if resp.StatusCode != 200 {
		return nil, errors.New("produit non trouvé")
	}

	var product model.ProductInfo
	if err := json.NewDecoder(resp.Body).Decode(&product); err != nil {
		return nil, err
	}

	return &product, nil
}
