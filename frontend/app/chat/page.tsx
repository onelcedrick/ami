'use client';

import { useState } from 'react';
import { chatWithIA } from '@/lib/api';

export default function ChatPage() {
  const [messages, setMessages] = useState<Array<{role: string; text: string}>>([
    { role: 'bot', text: 'Bonjour ! Je suis votre assistant AM Info. Comment puis-je vous aider ?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const data = await chatWithIA(userMsg);
      setMessages(prev => [...prev, { role: 'bot', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'bot', text: 'Désolé, une erreur est survenue.' }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">🤖 Assistant IA</h1>

      <div className="card h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] px-4 py-2 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-900'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="text-gray-400 text-sm">🤔 Réflexion...</div>
          )}
        </div>

        <div className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Posez votre question..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button onClick={handleSend} disabled={loading} className="btn btn-primary">
            Envoyer
          </button>
        </div>
      </div>
    </div>
  );
}
