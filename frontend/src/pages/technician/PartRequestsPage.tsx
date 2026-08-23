'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
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
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Demandes de pièces & photos SAV</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3" />
              <div className="flex gap-2">
                {[...Array(3)].map((_, j) => (
                  <div key={j} className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Demandes de pièces & photos SAV</h1>
      {tickets.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
          <p className="text-gray-400">Aucune demande de pièce ou photo attachée.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tickets.map(ticket => {
            const photos = ticket.messages?.filter((m: any) => m.attachment_url) || [];
            return (
              <div key={ticket.id} className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5">
                <h3 className="font-bold text-gray-900 dark:text-white mb-1">{ticket.subject}</h3>
                <p className="text-xs text-gray-400 mb-3 font-mono">Ticket #{ticket.id}</p>
                <div className="flex gap-2 flex-wrap">
                  {photos.map((photo: any, i: number) => (
                    <div
                      key={i}
                      onClick={() => setSelectedImage(photo.attachment_url)}
                      className="w-24 h-24 relative rounded-xl overflow-hidden cursor-pointer hover:opacity-80 border border-gray-200 dark:border-gray-700"
                    >
                      <Image
                        src={photo.attachment_url}
                        alt="Pièce SAV"
                        fill
                        sizes="96px"
                        className="object-cover"
                      />
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mt-3 font-medium">{photos.length} photo(s) jointe(s)</p>
              </div>
            );
          })}
        </div>
      )}
      {selectedImage && (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50 p-4 cursor-pointer" onClick={() => setSelectedImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full h-full flex items-center justify-center">
            <Image
              src={selectedImage}
              alt="Vue agrandie"
              fill
              className="object-contain"
            />
          </div>
          <button onClick={() => setSelectedImage(null)} className="absolute top-6 right-6 text-white text-3xl font-bold">&times;</button>
        </div>
      )}
    </div>
  );
}
