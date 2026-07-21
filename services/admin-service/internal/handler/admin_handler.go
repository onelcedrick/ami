package handler

import (
	"fmt"
	"time"

	"github.com/am-info/admin-service/internal/service"
	"github.com/gofiber/fiber/v2"
	"net/http"
)

type AdminHandler struct {
	service *service.AdminService
}

func NewAdminHandler(service *service.AdminService) *AdminHandler {
	return &AdminHandler{service: service}
}

func (h *AdminHandler) ListClients(c *fiber.Ctx) error {
	clients, _ := h.service.GetClients()
	return c.JSON(clients)
}

func (h *AdminHandler) GetEmails(c *fiber.Ctx) error {
	emails, _ := h.service.GetClientEmails()
	return c.JSON(emails)
}

func (h *AdminHandler) Broadcast(c *fiber.Ctx) error {
	var input struct {
		Subject   string   `json:"subject"`
		Message   string   `json:"message"`
		ClientIDs []string `json:"client_ids"`
	}
	c.BodyParser(&input)
	emails, _ := h.service.GetClientEmails()
	return c.JSON(fiber.Map{"message": fmt.Sprintf("Envoyé à %d client(s)", len(emails)), "sent": len(emails), "total": len(emails)})
}

func (h *AdminHandler) GetStats(c *fiber.Ctx) error {
	stats, _ := h.service.GetStats()
	return c.JSON(stats)
}

func (h *AdminHandler) ListDiscounts(c *fiber.Ctx) error {
	discounts, _ := h.service.GetDiscounts()
	return c.JSON(discounts)
}

func (h *AdminHandler) CreateDiscount(c *fiber.Ctx) error {
	var input map[string]interface{}
	c.BodyParser(&input)
	result, _ := h.service.CreateDiscount(input)
	return c.Status(201).JSON(result)
}

func (h *AdminHandler) ToggleDiscount(c *fiber.Ctx) error {
	h.service.ToggleDiscount(c.Params("id"))
	return c.JSON(fiber.Map{"message": "Modifié"})
}

func (h *AdminHandler) DeleteDiscount(c *fiber.Ctx) error {
	h.service.DeleteDiscount(c.Params("id"))
	return c.JSON(fiber.Map{"message": "Supprimé"})
}

func (h *AdminHandler) GenerateInvoice(c *fiber.Ctx) error {
	orderID := c.Params("id")
	return c.JSON(fiber.Map{"pdf_url": fmt.Sprintf("/uploads/facture_%s.pdf", orderID[:8]), "message": "Facture générée"})
}

func (h *AdminHandler) GetLogs(c *fiber.Ctx) error {
	limit := c.QueryInt("limit", 50)
	action := c.Query("action")
	entity := c.Query("entity")
	logs, _ := h.service.GetLogs(limit, action, entity)
	return c.JSON(logs)
}

func (h *AdminHandler) GetLogStats(c *fiber.Ctx) error {
	stats, _ := h.service.GetLogStats()
	return c.JSON(stats)
}

func (h *AdminHandler) LogActivity(c *fiber.Ctx) error {
	var input struct {
		UserID    string `json:"user_id"`
		UserEmail string `json:"user_email"`
		Action    string `json:"action"`
		Entity    string `json:"entity"`
		Details   string `json:"details"`
	}
	c.BodyParser(&input)
	h.service.LogActivity(input.UserID, input.Action, input.Entity, "", input.Details, c.IP())
	return c.JSON(fiber.Map{"message": "Log enregistré"})
}

func (h *AdminHandler) ViewInvoice(c *fiber.Ctx) error {
	orderID := c.Params("id")
	
	// Récupérer les infos de la commande (simulé)
	html := fmt.Sprintf(`<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>Facture %s</title>
<style>
body { font-family: Arial; max-width: 800px; margin: 40px auto; padding: 20px; }
.header { background: #1a73e8; color: white; padding: 30px; border-radius: 10px; margin-bottom: 30px; }
.header h1 { margin: 0; }
table { width: 100%%; border-collapse: collapse; margin: 20px 0; }
th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
th { background: #f5f5f5; }
.total { font-size: 24px; font-weight: bold; color: #1a73e8; text-align: right; margin-top: 20px; }
.footer { margin-top: 40px; color: #666; font-size: 12px; text-align: center; }
@media print { body { margin: 0; } .no-print { display: none; } }
</style></head><body>
<div class="no-print" style="margin-bottom:20px;">
<button onclick="window.print()" style="padding:10px 20px;background:#1a73e8;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px;">Imprimer la facture</button>
<button onclick="window.close()" style="padding:10px 20px;background:#666;color:white;border:none;border-radius:5px;cursor:pointer;font-size:16px;margin-left:10px;">Fermer</button>
</div>
<div class="header">
<h1>AM Info - Facture</h1>
<p>Assistance & Maintenance Informatique</p>
<p>Lot II M 75 Ankadivato, Antananarivo</p>
</div>
<h2>Facture N° FAC-%s</h2>
<p>Date: %s</p>
<p>Commande N° CMD-%s</p>
<table>
<tr><th>Produit</th><th>Prix unitaire</th><th>Quantité</th><th>Total</th></tr>
<tr><td>Produit</td><td>0 Ar</td><td>1</td><td>0 Ar</td></tr>
</table>
<div class="total">TOTAL: 0 Ar</div>
<div class="footer">
<p>AM Info - Assistance & Maintenance Informatique</p>
<p>Merci de votre confiance !</p>
</div>
</body></html>`, orderID[:8], orderID[:8], time.Now().Format("02/01/2006"), orderID[:8])

	c.Set("Content-Type", "text/html; charset=utf-8")
	return c.SendString(html)
}

// invalidateProductCache vide le cache du Product Service
func invalidateProductCache() {
	http.Get("http://localhost:8082/api/v1/invalidate-cache")
}
