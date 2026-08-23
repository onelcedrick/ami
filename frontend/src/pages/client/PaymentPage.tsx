'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('order_id');
  const [order, setOrder] = useState<any>(null);
  const [methods, setMethods] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [step, setStep] = useState('choose');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    api.get('/payments/methods').then((r: any) => {
      const data = r.data || r;
      setMethods(Array.isArray(data) ? data : []);
      if (Array.isArray(data) && data.length > 0) setSelected(data[0]);
    }).catch(() => {
      setMethods([
        { id: 'mvola', name: 'MVola (Telma)', prefix: '034', icon: '🟢', description: 'Paiement instantané Telma Madagascar' },
        { id: 'orange', name: 'Orange Money Madagascar', prefix: '032', icon: '🟠', description: 'Paiement direct Orange Madagascar' },
        { id: 'airtel', name: 'Airtel Money Madagascar', prefix: '033', icon: '🔴', description: 'Paiement sécurisé Airtel Madagascar' },
      ]);
    });

    if (orderId) {
      api.get(`/api/v1/orders/${orderId}`).then((res: any) => {
        setOrder(res);
      }).catch(() => {});
    }
  }, [orderId]);

  const handlePay = async () => {
    if (!phone.trim() || phone.length < 7) {
      toast.error('Numéro de téléphone invalide (7 chiffres)');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/payments/pay', {
        order_id: orderId,
        method: selected?.id || 'mvola',
        phone: (selected?.prefix || '034') + ' ' + phone,
        amount: order?.total || 150000
      });
      setResult(res.data || res);
      setStep('success');
      toast.success('Paiement en Ariary effectué avec succès !');
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  if (!orderId) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border p-8 max-w-lg mx-auto shadow-sm">
        <p className="text-gray-500 mb-4">Aucune commande spécifiée pour le règlement.</p>
        <Link href="/orders" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-blue-700 transition inline-block">
          Voir mes commandes
        </Link>
      </div>
    );
  }

  const totalAmount = order?.total || 150000;

  return (
    <div className="max-w-xl mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">Règlement en Ariary (MGA)</h1>
        <p className="text-sm text-gray-500">Paiement sécurisé par Mobile Money ou Retrait AM Info</p>
      </div>

      {step === 'choose' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 space-y-6">
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500">Commande #{orderId.slice(0, 8)}</p>
              <p className="text-xs text-gray-400 mt-0.5">{order?.items?.length || 1} article(s)</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-gray-500 block">Total à payer :</span>
              <span className="text-2xl font-black text-blue-600">{formatAriary(totalAmount)}</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-3">
              1. Choisissez votre méthode de paiement
            </label>
            <div className="space-y-3">
              {methods.map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => setSelected(m)}
                  className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition text-left ${
                    selected?.id === m.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200'
                  }`}
                >
                  <span className="text-3xl">{m.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-gray-900">{m.name}</p>
                    <p className="text-xs text-gray-400">{m.description}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                    selected?.id === m.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                  }`}>
                    {selected?.id === m.id && <span className="text-xs font-bold">&#10003;</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selected && (
            <div className="pt-2 border-t border-gray-100 space-y-4">
              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">
                2. Numéro de compte {selected.name}
              </label>
              <div className="flex items-center gap-2">
                <span className="bg-gray-100 text-gray-700 font-mono font-bold px-3.5 py-3 rounded-xl border">
                  {selected.prefix || '034'}
                </span>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 7))}
                  placeholder="XX XXX XX"
                  className="flex-1 px-4 py-3 border rounded-xl text-lg font-mono tracking-wider focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>
              <button
                onClick={() => setStep('confirm')}
                disabled={phone.length < 7}
                className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow-sm text-sm"
              >
                Continuer vers la confirmation
              </button>
            </div>
          )}
        </div>
      )}

      {step === 'confirm' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-5">
          <div className="text-5xl">{selected?.icon}</div>
          <h2 className="text-xl font-bold text-gray-900">Confirmer le paiement</h2>
          <p className="text-gray-500 text-sm">
            Règlement via <strong>{selected?.name}</strong> au <strong className="font-mono">{selected?.prefix} {phone}</strong>
          </p>
          <div className="bg-blue-50 py-3 px-6 rounded-2xl inline-block">
            <span className="text-3xl font-black text-blue-600">{formatAriary(totalAmount)}</span>
          </div>
          <p className="text-xs text-gray-400">
            Une demande d’autorisation de débit sera envoyée sur votre téléphone.
          </p>
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => setStep('choose')}
              className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50 text-sm text-gray-700"
            >
              Retour
            </button>
            <button
              onClick={handlePay}
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 text-sm transition shadow-sm"
            >
              {loading ? 'Validation...' : 'Confirmer et Payer'}
            </button>
          </div>
        </div>
      )}

      {/* SUCCESS WITH DIRECT PDF LINK */}
      {step === 'success' && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
            ✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Paiement Réussi !</h2>
          <p className="text-gray-500 text-sm">{result?.message || 'Votre commande a été réglée en Ariary.'}</p>

          <div className="bg-gray-50 rounded-2xl p-5 text-left text-xs space-y-2 border border-gray-100">
            <p><strong>N° Transaction :</strong> <span className="font-mono text-gray-700">{result?.transaction_id || 'MGA-TRX-99882'}</span></p>
            <p><strong>Facture N° :</strong> <span className="font-mono font-bold text-blue-700">{result?.invoice_number || `FAC-2026-${orderId.slice(-4)}`}</span></p>
            <p><strong>Montant réglé :</strong> <span className="font-bold text-emerald-700">{formatAriary(totalAmount)}</span></p>
            <p><strong>Mode :</strong> {selected?.name || 'MVola'}</p>
          </div>

          {/* DIRECT PDF FACTURE LINK */}
          <div className="space-y-3 pt-2">
            <Link
              href={`/invoices/${orderId}`}
              target="_blank"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3.5 rounded-xl font-bold text-sm transition shadow flex items-center justify-center gap-2"
            >
              📄 Télécharger / Imprimer la Facture PDF
            </Link>

            <div className="flex gap-3">
              <Link
                href="/orders"
                className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50 text-center text-xs text-gray-700"
              >
                Mes commandes
              </Link>
              <Link
                href="/products"
                className="flex-1 bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-black text-center text-xs"
              >
                Continuer mes achats
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
