package service

import (
	"time"
)

type SLARule struct {
	ResponseTime   int    `json:"response_time"`
	ResolutionTime int    `json:"resolution_time"`
	Label          string `json:"label"`
	Color          string `json:"color"`
	Icon           string `json:"icon"`
}

var SLARules = map[string]SLARule{
	"urgent": {ResponseTime: 15, ResolutionTime: 120, Label: "Urgent", Color: "red", Icon: "🔴"},
	"high":   {ResponseTime: 60, ResolutionTime: 480, Label: "Haute", Color: "orange", Icon: "🟠"},
	"medium": {ResponseTime: 240, ResolutionTime: 1440, Label: "Normal", Color: "blue", Icon: "🔵"},
	"low":    {ResponseTime: 1440, ResolutionTime: 4320, Label: "Faible", Color: "green", Icon: "🟢"},
}

type SLAStatus struct {
	SLAStatus          string  `json:"sla_status"`
	SLAColor           string  `json:"sla_color"`
	SLAMessage         string  `json:"sla_message"`
	ElapsedMinutes     int     `json:"elapsed_minutes"`
	ResponseTimeMin    int     `json:"response_time_minutes"`
	ResolutionTimeMin  int     `json:"resolution_time_minutes"`
	RemainingPercent   int     `json:"remaining_percent"`
	PriorityLabel      string  `json:"priority_label"`
	PriorityIcon       string  `json:"priority_icon"`
}

func GetSLAStatus(priority string, createdAt time.Time, status string) SLAStatus {
	rule, ok := SLARules[priority]
	if !ok {
		rule = SLARules["medium"]
	}

	now := time.Now()
	elapsed := int(now.Sub(createdAt).Minutes())

	remainingPct := 100
	if status == "open" {
		remainingPct = max(0, min(100, int((1-float64(elapsed)/float64(rule.ResponseTime))*100)))
	}

	slaStatus := "ok"
	slaColor := "green"
	slaMessage := "Dans les temps"

	if remainingPct < 25 {
		slaStatus = "warning"
		slaColor = "orange"
		slaMessage = "Urgent : temps limite approche"
	} else if remainingPct < 50 {
		slaStatus = "attention"
		slaColor = "yellow"
		slaMessage = "Attention : verifier ce ticket"
	}

	if (status == "open" && elapsed > rule.ResponseTime) || (status != "resolved" && status != "closed" && elapsed > rule.ResolutionTime) {
		slaStatus = "breached"
		slaColor = "red"
		slaMessage = "SLA depasse !"
	}

	return SLAStatus{
		SLAStatus:         slaStatus,
		SLAColor:          slaColor,
		SLAMessage:        slaMessage,
		ElapsedMinutes:    elapsed,
		ResponseTimeMin:   rule.ResponseTime,
		ResolutionTimeMin: rule.ResolutionTime,
		RemainingPercent:  remainingPct,
		PriorityLabel:     rule.Label,
		PriorityIcon:      rule.Icon,
	}
}

func max(a, b int) int { if a > b { return a }; return b }
func min(a, b int) int { if a < b { return a }; return b }
