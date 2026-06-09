import re
from typing import Tuple, List, Optional
import random

class EcommerceChatbot:
    """Chatbot simple pour le support e-commerce"""
    
    def __init__(self):
        self.intents = {
            "greeting": {
                "patterns": ["bonjour", "salut", "hello", "bonsoir", "hey"],
                "responses": [
                    "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
                    "Bienvenue sur AM Info ! Que recherchez-vous ?",
                    "Hello ! Je suis là pour vous assister."
                ]
            },
            "product_search": {
                "patterns": ["recherche", "trouver", "cherche", "produit", "ordinateur", "téléphone", "casque"],
                "responses": [
                    "Je peux vous aider à trouver des produits. Quelle catégorie vous intéresse ?",
                    "Nous avons un large catalogue. Dites-moi ce que vous cherchez.",
                    "Quel type de produit recherchez-vous ?"
                ]
            },
            "price": {
                "patterns": ["prix", "coûte", "tarif", "budget", "cher", "pas cher"],
                "responses": [
                    "Nos prix varient de 50€ à 2500€ selon les produits. Quel est votre budget ?",
                    "Nous avons des produits pour tous les budgets. Quelle fourchette de prix ?"
                ]
            },
            "order_status": {
                "patterns": ["commande", "suivi", "livraison", "colis", "où est", "statut"],
                "responses": [
                    "Pour suivre votre commande, allez dans 'Mes Commandes'. Vous avez votre numéro de commande ?",
                    "Je peux vous renseigner sur le suivi. Quel est votre numéro de commande ?"
                ]
            },
            "payment": {
                "patterns": ["paiement", "payer", "carte", "cb", "virement", "paypal"],
                "responses": [
                    "Nous acceptons les cartes bancaires, PayPal et les virements.",
                    "Le paiement est sécurisé. Vous pouvez payer par carte ou PayPal."
                ]
            },
            "return": {
                "patterns": ["retour", "rembourser", "remboursement", "défectueux", "garantie"],
                "responses": [
                    "Vous avez 30 jours pour retourner un produit. Créez un ticket SAV pour être assisté.",
                    "Pour un retour, allez dans votre compte et créez un ticket de support."
                ]
            },
            "goodbye": {
                "patterns": ["merci", "au revoir", "bye", "adieu", "bonne journée"],
                "responses": [
                    "Merci de votre visite ! Bonne journée !",
                    "Au revoir ! N'hésitez pas si vous avez d'autres questions.",
                    "Ravi de vous avoir aidé. À bientôt sur AM Info !"
                ]
            }
        }
        
        self.context = {}
    
    def detect_intent(self, message: str) -> Tuple[str, float]:
        """Détecte l'intention du message"""
        message_lower = message.lower()
        
        best_intent = "unknown"
        best_score = 0.0
        
        for intent, data in self.intents.items():
            score = 0
            for pattern in data["patterns"]:
                if pattern in message_lower:
                    score += 1
                # Recherche fuzzy simple
                if re.search(rf'\b{pattern}\b', message_lower):
                    score += 2
            
            if score > best_score:
                best_score = score
                best_intent = intent
        
        confidence = min(best_score / 5.0, 1.0)
        return best_intent, confidence
    
    def get_response(self, message: str, user_id: str = None) -> dict:
        """Génère une réponse au message"""
        intent, confidence = self.detect_intent(message)
        
        if intent != "unknown":
            response = random.choice(self.intents[intent]["responses"])
        else:
            response = "Je ne suis pas sûr de comprendre. Pouvez-vous reformuler ? Je peux vous aider sur les produits, commandes, prix ou retours."
            confidence = 0.3
        
        # Suggestions contextuelles
        suggestions = self.get_suggestions(intent)
        
        return {
            "response": response,
            "confidence": confidence,
            "intent": intent,
            "suggestions": suggestions
        }
    
    def get_suggestions(self, intent: str) -> List[str]:
        """Retourne des suggestions basées sur l'intention"""
        suggestion_map = {
            "product_search": ["Voir les ordinateurs", "Voir les smartphones", "Voir les promotions"],
            "price": ["Produits < 500€", "Produits < 1000€", "Meilleures ventes"],
            "order_status": ["Mes commandes", "Suivre un colis", "Contacter le SAV"],
            "greeting": ["Nouveautés", "Promotions", "Catégories"],
            "return": ["Créer un ticket SAV", "Politique de retour", "Mes commandes"],
        }
        return suggestion_map.get(intent, ["Voir le catalogue", "Aide", "Contacter le support"])
    
    def analyze_sentiment(self, text: str) -> dict:
        """Analyse simple du sentiment"""
        positive_words = ["super", "excellent", "parfait", "merci", "génial", "top", "bravo", "bien", "👍"]
        negative_words = ["nul", "horrible", "déçu", "problème", "casse", "défectueux", "rembourser", "plainte", "colère", "😡"]
        urgent_words = ["urgent", "immédiatement", "vite", "délai", "attends", "urgence"]
        
        text_lower = text.lower()
        
        pos_score = sum(1 for word in positive_words if word in text_lower)
        neg_score = sum(1 for word in negative_words if word in text_lower)
        urgent_score = sum(1 for word in urgent_words if word in text_lower)
        
        if pos_score > neg_score:
            sentiment = "positive"
            score = 0.5 + (pos_score * 0.1)
        elif neg_score > pos_score:
            sentiment = "negative"
            score = 0.5 + (neg_score * 0.1)
        else:
            sentiment = "neutral"
            score = 0.5
        
        urgency = "high" if urgent_score > 0 else ("medium" if neg_score > 2 else "low")
        
        return {
            "sentiment": sentiment,
            "score": min(score, 1.0),
            "urgency_level": urgency
        }
