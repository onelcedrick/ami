package discount

import (
	"encoding/json"
	"fmt"
	"net/http"
	"sync"
	"time"
)

// Discount représente une promotion
type Discount struct {
	ID           string  `json:"id"`
	Name         string  `json:"name"`
	DiscountType string  `json:"discount_type"` // percentage, fixed_amount
	Value        float64 `json:"value"`
	TargetType   string  `json:"target_type"`   // global, product, category
	TargetID     string  `json:"target_id"`
	IsActive     bool    `json:"is_active"`
}

// PriceStrategy interface (Strategy Pattern)
type PriceStrategy interface {
	CalculateFinalPrice(originalPrice float64, productID string, categoryID string) float64
	GetDiscountPercent() float64
}

// NoDiscount - stratégie par défaut (pas de réduction)
type NoDiscount struct{}

func (s *NoDiscount) CalculateFinalPrice(originalPrice float64, productID, categoryID string) float64 {
	return originalPrice
}

func (s *NoDiscount) GetDiscountPercent() float64 { return 0 }

// PercentageDiscount - réduction en pourcentage
type PercentageDiscount struct {
	Percent    float64
	TargetType string
	TargetID   string
}

func (s *PercentageDiscount) CalculateFinalPrice(originalPrice float64, productID, categoryID string) float64 {
	if s.isApplicable(productID, categoryID) {
		return originalPrice * (1 - s.Percent/100)
	}
	return originalPrice
}

func (s *PercentageDiscount) GetDiscountPercent() float64 { return s.Percent }

func (s *PercentageDiscount) isApplicable(productID, categoryID string) bool {
	switch s.TargetType {
	case "global":
		return true
	case "product":
		return s.TargetID == productID
	case "category":
		return s.TargetID == categoryID
	}
	return false
}

// FixedAmountDiscount - réduction en montant fixe
type FixedAmountDiscount struct {
	Amount     float64
	TargetType string
	TargetID   string
}

func (s *FixedAmountDiscount) CalculateFinalPrice(originalPrice float64, productID, categoryID string) float64 {
	if s.isApplicable(productID, categoryID) {
		newPrice := originalPrice - s.Amount
		if newPrice < 0 {
			return 0
		}
		return newPrice
	}
	return originalPrice
}

func (s *FixedAmountDiscount) GetDiscountPercent() float64 { return 0 }

func (s *FixedAmountDiscount) isApplicable(productID, categoryID string) bool {
	switch s.TargetType {
	case "global":
		return true
	case "product":
		return s.TargetID == productID
	case "category":
		return s.TargetID == categoryID
	}
	return false
}

// DiscountEngine - applique la meilleure stratégie (Factory + Strategy)
type DiscountEngine struct {
	discounts []Discount
	mu        sync.RWMutex
	adminURL  string
}

var instance *DiscountEngine
var once sync.Once

// GetDiscountEngine - Singleton Pattern
func GetDiscountEngine(adminURL string) *DiscountEngine {
	once.Do(func() {
		instance = &DiscountEngine{
			discounts: make([]Discount, 0),
			adminURL:  adminURL,
		}
		go instance.refreshLoop()
	})
	return instance
}

// refreshLoop rafraîchit les promotions toutes les 60 secondes
func (e *DiscountEngine) refreshLoop() {
	for {
		e.fetchDiscounts()
		time.Sleep(60 * time.Second)
	}
}

func (e *DiscountEngine) fetchDiscounts() {
	resp, err := http.Get(fmt.Sprintf("%s/api/v1/admin/discounts", e.adminURL))
	if err != nil {
		return
	}
	defer resp.Body.Close()

	var discounts []Discount
	if err := json.NewDecoder(resp.Body).Decode(&discounts); err != nil {
		return
	}

	e.mu.Lock()
	e.discounts = discounts
	e.mu.Unlock()
}

// GetBestStrategy retourne la meilleure stratégie pour un produit (Factory Pattern)
func (e *DiscountEngine) GetBestStrategy(productID, categoryID string) PriceStrategy {
	e.mu.RLock()
	defer e.mu.RUnlock()

	var bestStrategy PriceStrategy = &NoDiscount{}
	var bestPrice float64 = 999999999

	for _, d := range e.discounts {
		if !d.IsActive {
			continue
		}

		var strategy PriceStrategy
		switch d.DiscountType {
		case "percentage":
			strategy = &PercentageDiscount{Percent: d.Value, TargetType: d.TargetType, TargetID: d.TargetID}
		case "fixed_amount":
			strategy = &FixedAmountDiscount{Amount: d.Value, TargetType: d.TargetType, TargetID: d.TargetID}
		default:
			continue
		}

		// Calculer le prix avec cette stratégie (on utilise 100 comme prix de référence)
		testPrice := strategy.CalculateFinalPrice(100, productID, categoryID)
		if testPrice < bestPrice {
			bestPrice = testPrice
			bestStrategy = strategy
		}
	}

	return bestStrategy
}

// ForceRefresh force le rafraîchissement des promotions
func (e *DiscountEngine) ForceRefresh() {
	e.fetchDiscounts()
}
