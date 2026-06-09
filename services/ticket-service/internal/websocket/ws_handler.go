package websocket

import (
	"log"

	"github.com/am-info/ticket-service/internal/service"
	"github.com/gofiber/websocket/v2"
)

type WSHandler struct {
	hub *service.WebSocketHub
}

func NewWSHandler(hub *service.WebSocketHub) *WSHandler {
	return &WSHandler{hub: hub}
}

func (h *WSHandler) HandleConnection(c *websocket.Conn) {
	userID := c.Query("user_id", "unknown")
	userRole := c.Query("role", "client")

	client := &service.Client{
		ID:   userID,
		Role: userRole,
		Conn: c,
		Send: make(chan []byte, 256),
	}

	h.hub.Register(client)

	go h.writePump(client)
	h.readPump(client)
}

func (h *WSHandler) writePump(client *service.Client) {
	defer client.Conn.Close()

	for message := range client.Send {
		if err := client.Conn.WriteMessage(websocket.TextMessage, message); err != nil {
			log.Printf("Erreur écriture WS: %v", err)
			break
		}
	}
}

func (h *WSHandler) readPump(client *service.Client) {
	defer func() {
		h.hub.Unregister(client)
		client.Conn.Close()
	}()

	for {
		_, message, err := client.Conn.ReadMessage()
		if err != nil {
			break
		}
		log.Printf("📨 Message WS reçu de %s: %s", client.ID, string(message))
	}
}
