'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';

export default function InvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api.get(`/api/v1/orders/${id}`)
      .then((res: any) => {
        setOrder(res);
      })
      .catch(() => {
        // Fallback demo order
        setOrder({
          id: id,
          order_number: `CMD-2026-${id.slice(-4)}`,
          invoice_number: `FAC-2026-${id.slice(-4)}`,
          created_at: new Date().toISOString(),
          client_name: 'Marc Ranaivo',
          client_email: 'client@aminfo.com',
          client_phone: '+261 34 12 345 67',
          shipping_address: 'Analakely, Antananarivo 101, Madagascar',
          payment_method: 'mvola',
          payment_status: 'paid',
          status: 'paid',
          subtotal: 1650000,
          discount_amount: 150000,
          total: 1500000,
          currency: 'Ar',
          items: [
            { id: '1', product_name: 'Carte Graphique GeForce RTX 4060 8GB GDDR6', quantity: 1, product_price: 1650000, total: 1650000 }
          ]
        });
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Facture introuvable</h2>
        <button onClick={() => router.back()} className="text-blue-600 font-semibold hover:underline">
          &larr; Retour
        </button>
      </div>
    );
  }

  const invoiceNumber = order.invoice_number || `FAC-2026-${order.id?.slice(-4) || '0099'}`;
  const orderNumber = order.order_number || `#${order.id?.slice(0, 8)}`;
  const dateStr = order.created_at ? new Date(order.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : new Date().toLocaleDateString('fr-FR');
  const isPaid = order.status === 'paid' || order.payment_status === 'paid' || order.status === 'delivered' || order.status === 'shipped';

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:py-0 print:px-0">
      {/* Top action toolbar (hidden on print) */}
      <div className="max-w-4xl mx-auto mb-6 flex items-center justify-between print:hidden">
        <button
          onClick={() => router.back()}
          className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-gray-50 transition shadow-sm"
        >
          &larr; Retour
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="bg-blue-600 text-white px-6 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition shadow flex items-center gap-2"
          >
            🖨️ Imprimer / Sauvegarder en PDF
          </button>
        </div>
      </div>

      {/* Invoice sheet */}
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-lg border border-gray-200 p-8 sm:p-12 print:shadow-none print:border-none print:p-0">
        {/* Header */}
        <div className="flex justify-between items-start border-b border-gray-200 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-blue-600 text-white font-extrabold text-xl px-2.5 py-1 rounded-lg">AM</span>
              <span className="text-2xl font-black tracking-tight text-gray-900">AM INFO</span>
            </div>
            <p className="text-xs text-gray-500 font-medium">Assistance & Vente Matériel Informatique</p>
            <p className="text-xs text-gray-500 mt-1">Analakely, En face Hôtel de Ville</p>
            <p className="text-xs text-gray-500">Antananarivo 101, Madagascar</p>
            <p className="text-xs text-gray-500">NIF : 4001298451 • STAT : 47411 11 2024 0 00123</p>
            <p className="text-xs text-blue-600 font-semibold mt-1">contact@am-info.mg • +261 34 00 123 45</p>
          </div>

          <div className="text-right">
            <div className="inline-block bg-blue-50 text-blue-800 text-sm font-black px-3 py-1.5 rounded-lg mb-2">
              FACTURE OFFICIELLE
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-mono text-gray-900">{invoiceNumber}</h1>
            <p className="text-xs text-gray-500 mt-1">Date d’émission : {dateStr}</p>
            <p className="text-xs text-gray-500">Réf. Commande : <span className="font-mono font-bold text-gray-700">{orderNumber}</span></p>
            <div className="mt-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                isPaid ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-amber-100 text-amber-800 border border-amber-300'
              }`}>
                {isPaid ? '✓ FACTURE ACQUITTÉE / PAYÉE' : 'EN ATTENTE DE PAIEMENT'}
              </span>
            </div>
          </div>
        </div>

        {/* Client & Payment Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 my-8 py-4 bg-gray-50 rounded-xl p-5 border border-gray-100">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Facturé à :</span>
            <p className="font-bold text-gray-900 text-base">{order.client_name || 'Client AM Info'}</p>
            <p className="text-xs text-gray-600">{order.client_email || 'client@aminfo.com'}</p>
            {order.client_phone && <p className="text-xs text-gray-600">{order.client_phone}</p>}
            <p className="text-xs text-gray-600 mt-1">{order.shipping_address || 'Retrait en boutique AM Info - Antananarivo'}</p>
          </div>

          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block mb-1">Modalités de règlement :</span>
            <p className="text-xs text-gray-700"><strong>Mode de paiement :</strong> {
              order.payment_method === 'mvola' ? 'MVola (Telma Madagascar)' :
              order.payment_method === 'orange' ? 'Orange Money Madagascar' :
              order.payment_method === 'airtel' ? 'Airtel Money Madagascar' :
              order.payment_method === 'card' ? 'Carte Bancaire' : 'Paiement au Retrait en Boutique'
            }</p>
            {order.payment_transaction_id && (
              <p className="text-xs text-gray-700 mt-1">
                <strong>Transaction ID :</strong> <span className="font-mono text-blue-700 font-semibold">{order.payment_transaction_id}</span>
              </p>
            )}
            <p className="text-xs text-gray-700 mt-1">
              <strong>Devise :</strong> Ariary Malagasy (MGA / Ar)
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b-2 border-gray-200 text-gray-600 font-bold text-xs uppercase">
                <th className="py-3 text-left">Désignation de l’article / Service</th>
                <th className="py-3 text-center w-20">Qté</th>
                <th className="py-3 text-right w-36">Prix Unitaire (Ar)</th>
                <th className="py-3 text-right w-36">Total (Ar)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {(order.items || []).map((item: any, idx: number) => (
                <tr key={idx}>
                  <td className="py-3.5 pr-4">
                    <p className="font-semibold text-gray-900">{item.product_name || item.name || 'Matériel Informatique AM Info'}</p>
                    <p className="text-xs text-gray-400">Garantie atelier 12 mois incluse</p>
                  </td>
                  <td className="py-3.5 text-center font-medium text-gray-700">{item.quantity || 1}</td>
                  <td className="py-3.5 text-right text-gray-700 font-medium">{formatAriary(item.product_price || item.price || (item.total / (item.quantity || 1)))}</td>
                  <td className="py-3.5 text-right font-bold text-gray-900">{formatAriary(item.total || ((item.product_price || 0) * (item.quantity || 1)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        <div className="flex justify-end border-t border-gray-200 pt-6">
          <div className="w-full max-w-xs space-y-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Sous-total HT :</span>
              <span className="font-semibold">{formatAriary(order.subtotal || order.total)}</span>
            </div>

            {order.discount_amount > 0 && (
              <div className="flex justify-between text-sm text-emerald-600 font-semibold">
                <span>Remise promotionnelle :</span>
                <span>-{formatAriary(order.discount_amount)}</span>
              </div>
            )}

            <div className="flex justify-between text-sm text-gray-600">
              <span>Frais de livraison :</span>
              <span className="font-semibold">0 Ar (Offert)</span>
            </div>

            <div className="flex justify-between text-sm text-gray-600">
              <span>TVA (20% incluse) :</span>
              <span className="font-semibold">{formatAriary(Math.round((order.total || 0) * 0.2 / 1.2))}</span>
            </div>

            <div className="flex justify-between text-lg font-black text-gray-900 border-t-2 border-gray-900 pt-3 mt-2">
              <span>TOTAL TTC (Ar) :</span>
              <span className="text-blue-600">{formatAriary(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer & Signature Stamp */}
        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6 text-xs text-gray-400">
          <div>
            <p className="font-bold text-gray-600 mb-1">Conditions de garantie & SAV :</p>
            <p>Tout matériel neuf bénéficie d’une garantie constructeur et atelier de 12 mois.</p>
            <p>Assistance technique et support disponibles du Lundi au Samedi (8h - 18h).</p>
          </div>

          <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center w-52">
            <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Cachet & Signature AM INFO</span>
            <div className="font-bold text-blue-600 text-sm">AM INFO SARL</div>
            <div className="text-[10px] text-gray-500">Analakely - Antananarivo</div>
            <div className="text-emerald-600 font-extrabold text-xs mt-1">✓ DOCUMENT CERTIFIÉ</div>
          </div>
        </div>
      </div>
    </div>
  );
}
