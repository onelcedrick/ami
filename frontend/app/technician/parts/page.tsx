'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { EmptyState } from '@/components/ui/Skeleton';

export default function PartRequestsPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'technician') {
      router.push('/technician/login');
      return;
    }
    loadTickets();
  }, [isAuthenticated]);

  const loadTickets = async () => {
    try {
      const data = await apiClient.getTickets();
      const ticketsList = Array.isArray(data) ? data : [];
      
      // Filtrer les tickets avec des pièces jointes
      const withAttachments = ticketsList.filter((t: any) => 
        t.messages?.some((m: any) => m.attachment_url)
      );
      
      setTickets(withAttachments);
    } catch (err) {
      console.error('Erreur chargement demandes:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">🔩 Demandes de pièces</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-24 h-24 bg-gray-200 rounded-lg" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">🔩 Demandes de pièces</h1>

      {tickets.length === 0 ? (
        <EmptyState 
          icon="🔩" 
          title="Aucune demande de pièce" 
          description="Les photos envoyées par les clients apparaîtront ici." 
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map((ticket: any) => {
            const photos = ticket.messages?.filter((m: any) => m.attachment_url) || [];
            if (photos.length === 0) return null;
            
            return (
              <div key={ticket.id} className="bg-white rounded-xl shadow p-4 hover:shadow-md transition">
                <h3 className="font-bold mb-1">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 mb-3">
                  Ticket #{ticket.id?.slice(0, 8)} · {ticket.status}
                </p>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((photo: any, i: number) => (
                    <img
                      key={i}
                      src={photo.attachment_url}
                      alt={`Pièce ${i + 1}`}
                      onClick={() => setSelectedImage(photo.attachment_url)}
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 border border-gray-200 transition"
                    />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{photos.length} photo(s)</p>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal image plein écran */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-pointer"
          onClick={() => setSelectedImage(null)}
        >
          <img 
            src={selectedImage} 
            alt="Vue agrandie" 
            className="max-w-[90%] max-h-[90%] object-contain rounded-lg"
          />
          <button 
            onClick={() => setSelectedImage(null)} 
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition"
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}
