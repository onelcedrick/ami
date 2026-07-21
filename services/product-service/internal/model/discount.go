package model

type Discount struct {
    ID           string  `json:"id"`
    Name         string  `json:"name"`
    TargetType   string  `json:"target_type"` // product, category, global
    TargetID     string  `json:"target_id"`
    DiscountType string  `json:"discount_type"` // percentage, fixed_amount
    Value        float64 `json:"value"`
    IsActive     bool    `json:"is_active"`
}
