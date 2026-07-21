package service

import (
	"fmt"
	"math/rand"
	"time"
)

// PaymentStrategy interface (Strategy Pattern)
type PaymentStrategy interface {
	GenerateReference(orderID string) string
	VerifyPayment(reference string, amount float64, phone string) map[string]interface{}
	GetMethodName() string
}

// MVola Strategy
type MVolaStrategy struct{}

func (s *MVolaStrategy) GenerateReference(orderID string) string {
	return fmt.Sprintf("MVOLA-%s-%s", orderID[:8], time.Now().Format("01021504"))
}

func (s *MVolaStrategy) VerifyPayment(reference string, amount float64, phone string) map[string]interface{} {
	success := rand.Float64() > 0.1
	msg := "Paiement MVola confirme"
	if !success { msg = "Paiement MVola en attente" }
	return map[string]interface{}{
		"verified": success, "reference": reference, "method": "MVola",
		"amount": amount, "phone": phone, "message": msg,
		"transaction_id": fmt.Sprintf("MV-%d", rand.Intn(900000)+100000),
	}
}

func (s *MVolaStrategy) GetMethodName() string { return "MVola" }

// Orange Money Strategy
type OrangeMoneyStrategy struct{}

func (s *OrangeMoneyStrategy) GenerateReference(orderID string) string {
	return fmt.Sprintf("OM-%s-%s", orderID[:8], time.Now().Format("01021504"))
}

func (s *OrangeMoneyStrategy) VerifyPayment(reference string, amount float64, phone string) map[string]interface{} {
	success := rand.Float64() > 0.1
	msg := "Paiement Orange Money confirme"
	if !success { msg = "Paiement Orange Money en attente" }
	return map[string]interface{}{
		"verified": success, "reference": reference, "method": "Orange Money",
		"amount": amount, "phone": phone, "message": msg,
		"transaction_id": fmt.Sprintf("OM-%d", rand.Intn(900000)+100000),
	}
}

func (s *OrangeMoneyStrategy) GetMethodName() string { return "Orange Money" }

// Airtel Money Strategy
type AirtelMoneyStrategy struct{}

func (s *AirtelMoneyStrategy) GenerateReference(orderID string) string {
	return fmt.Sprintf("AIRTEL-%s-%s", orderID[:8], time.Now().Format("01021504"))
}

func (s *AirtelMoneyStrategy) VerifyPayment(reference string, amount float64, phone string) map[string]interface{} {
	success := rand.Float64() > 0.1
	msg := "Paiement Airtel Money confirme"
	if !success { msg = "Paiement Airtel Money en attente" }
	return map[string]interface{}{
		"verified": success, "reference": reference, "method": "Airtel Money",
		"amount": amount, "phone": phone, "message": msg,
		"transaction_id": fmt.Sprintf("AM-%d", rand.Intn(900000)+100000),
	}
}

func (s *AirtelMoneyStrategy) GetMethodName() string { return "Airtel Money" }

// PaymentStrategyFactory
var strategies = map[string]PaymentStrategy{
	"mvola":        &MVolaStrategy{},
	"orange_money": &OrangeMoneyStrategy{},
	"airtel_money": &AirtelMoneyStrategy{},
}

func GetPaymentStrategy(method string) PaymentStrategy {
	return strategies[method]
}

func GetPaymentMethods() []map[string]interface{} {
	return []map[string]interface{}{
		{"id": "mvola", "name": "MVola", "icon": "📱", "color": "bg-yellow-500", "prefix": "034"},
		{"id": "orange_money", "name": "Orange Money", "icon": "🟠", "color": "bg-orange-500", "prefix": "032"},
		{"id": "airtel_money", "name": "Airtel Money", "icon": "🔴", "color": "bg-red-500", "prefix": "033"},
	}
}
