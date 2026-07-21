'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import api from '@/src/api/axios';

export default function PartRequestsPage() {
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    api.get('/api/v1/tickets').then((r: any) => {
      const ticketsList = Array.isArray(r) ? r : [];
      const withPhotos = ticketsList.filter((t: any) =>
        t.messages?.some((m: any) => m.attachment_url)
      );
      setTickets(withPhotos);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold mb-6">Demandes de pieces</h1>
        <div className="grid grid-cols-2 gap-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="flex gap-2">{[...Array(3)].map((_, j) => <div key={j} className="w-24 h-24 bg-gray-200 rounded-lg" />)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Demandes de pieces</h1>
      {tickets.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-400">Aucune demande de piece</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {tickets.map(ticket => {
            const photos = ticket.messages?.filter((m: any) => m.attachment_url) || [];
            return (
              <div key={ticket.id} className="bg-white rounded-xl shadow p-4">
                <h3 className="font-bold mb-2">{ticket.subject}</h3>
                <p className="text-xs text-gray-500 mb-3">#{ticket.id.slice(0,8)}</p>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((photo: any, i: number) => (
                    <img key={i} src={photo.attachment_url} alt="Piece" onClick={() => setSelectedImage(photo.attachment_url)}
                      className="w-24 h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 border" />
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-2">{photos.length} photo(s)</p>
              </div>
            );
          })}
        </div>
      )}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 cursor-pointer" onClick={() => setSelectedImage(null)}>
          <img src={selectedImage} alt="" className="max-w-[90%] max-h-[90%] object-contain" />
          <button onClick={() => setSelectedImage(null)} className="absolute top-4 right-4 text-white text-3xl">&times;</button>
        </div>
      )}
    </div>
  );
}
