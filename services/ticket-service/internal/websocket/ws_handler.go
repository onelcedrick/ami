package websocket

import (
	"log"
	"sync"

	"github.com/gofiber/websocket/v2"
)

type Client struct {
	ID   string
	Conn *websocket.Conn
	Mu   sync.Mutex
}

type Hub struct {
	clients    map[string]*Client
	register   chan *Client
	unregister chan *Client
	broadcast  chan []byte
	mu         sync.RWMutex
}

var DefaultHub *Hub

func init() {
	DefaultHub = &Hub{
		clients:    make(map[string]*Client),
		register:   make(chan *Client),
		unregister: make(chan *Client),
		broadcast:  make(chan []byte, 256),
	}
	go DefaultHub.Run()
}

func (h *Hub) Run() {
	for {
		select {
		case client := <-h.register:
			h.mu.Lock()
			h.clients[client.ID] = client
			h.mu.Unlock()
			log.Printf("🔌 WebSocket: Client connecté (%s)", client.ID)

		case client := <-h.unregister:
			h.mu.Lock()
			if _, ok := h.clients[client.ID]; ok {
				delete(h.clients, client.ID)
				client.Conn.Close()
			}
			h.mu.Unlock()
			log.Printf("🔌 WebSocket: Client déconnecté (%s)", client.ID)

		case message := <-h.broadcast:
			h.mu.RLock()
			for id, client := range h.clients {
				err := client.Conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("⚠️ Erreur envoi à %s: %v", id, err)
					client.Conn.Close()
					delete(h.clients, id)
				}
			}
			h.mu.RUnlock()
		}
	}
}

func (h *Hub) SendToUser(userID string, message []byte) {
	h.mu.RLock()
	client, ok := h.clients[userID]
	h.mu.RUnlock()
	if ok {
		client.Mu.Lock()
		client.Conn.WriteMessage(websocket.TextMessage, message)
		client.Mu.Unlock()
	}
}

func HandleWebSocket(c *websocket.Conn) {
	userID := c.Query("user_id", c.Params("user_id", "anonymous"))
	
	client := &Client{
		ID:   userID,
		Conn: c,
	}

	DefaultHub.register <- client
	log.Printf("✅ WebSocket connecté: %s", userID)

	// Lire les messages entrants
	for {
		messageType, msg, err := c.ReadMessage()
		if err != nil {
			log.Printf("❌ WebSocket erreur lecture: %v", err)
			break
		}
		
		log.Printf("📨 Message reçu de %s: %s", userID, string(msg))
		
		// Broadcast à tous les autres clients
		DefaultHub.mu.RLock()
		for id, client := range DefaultHub.clients {
			if id != userID {
				client.Mu.Lock()
				client.Conn.WriteMessage(messageType, msg)
				client.Mu.Unlock()
			}
		}
		DefaultHub.mu.RUnlock()
	}

	DefaultHub.unregister <- client
}
