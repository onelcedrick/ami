// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';

interface PaymentModalProps {
  orderId: string;
  orderTotal: number;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PaymentModal({ orderId, orderTotal, onClose, onSuccess }: PaymentModalProps) {
  const [methods, setMethods] = useState<any[]>([]);
  const [selected, setSelected] = useState<any>(null);
  const [phone, setPhone] = useState('');
  const [pin, setPin] = useState('');
  const [step, setStep] = useState('choose');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    api.get('/payments/methods')
      .then(r => setMethods(r.data || []))
      .catch(() => {
        setMethods([
          { id: 'mvola', name: 'MVola (Telma)', prefix: '034', icon: '🟢', description: 'Paiement instantané Telma' },
          { id: 'orange', name: 'Orange Money Madagascar', prefix: '032', icon: '🟠', description: 'Paiement Orange Madagascar' },
          { id: 'airtel', name: 'Airtel Money Madagascar', prefix: '033', icon: '🔴', description: 'Paiement Airtel Madagascar' },
        ]);
      });
  }, []);

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 7);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return digits.slice(0, 2) + ' ' + digits.slice(2);
    return digits.slice(0, 2) + ' ' + digits.slice(2, 5) + ' ' + digits.slice(5);
  };

  const getRawPhone = () => phone.replace(/\s/g, '');
  const formatPin = (value: string) => value.replace(/\D/g, '').slice(0, 4);

  const handlePay = async () => {
    if (pin.length < 4) { toast.error('Code PIN à 4 chiffres requis'); return; }
    setLoading(true);
    const fullPhone = (selected.prefix || '034') + ' ' + getRawPhone();
    try {
      const res = await api.post('/payments/pay', { order_id: orderId, method: selected.id, phone: fullPhone, pin, amount: orderTotal });
      setResult(res.data || res);
      setStep('success');
      toast.success('Paiement en Ariary validé avec succès !');
      if (onSuccess) onSuccess();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Erreur lors du paiement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 p-0 md:p-4">
      <div className="bg-white rounded-t-3xl md:rounded-3xl shadow-2xl w-full md:max-w-md max-h-[92vh] overflow-y-auto animate-slideUp border border-gray-100">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="font-bold text-lg text-gray-900">Paiement Mobile Money</h2>
            <p className="text-xs text-gray-400">Règlement direct en Ariary (MGA)</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
            &times;
          </button>
        </div>

        <div className="p-5">
          {step === 'choose' && (
            <>
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-5 text-center">
                <p className="text-xs text-gray-500 mb-1">Montant total de la commande</p>
                <p className="text-2xl font-black text-blue-600">{formatAriary(orderTotal)}</p>
                <p className="text-[11px] text-gray-400 mt-1 font-mono">Réf: #{orderId?.slice(0, 8)}</p>
              </div>

              <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                Choisissez votre opérateur :
              </label>

              <div className="space-y-2.5 mb-5">
                {methods.map(m => (
                  <button
                    key={m.id}
                    onClick={() => { setSelected(m); setPhone(''); }}
                    className={`w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition text-left ${
                      selected?.id === m.id ? 'border-blue-600 bg-blue-50/50 shadow-sm' : 'border-gray-100 hover:border-gray-200 bg-gray-50/50'
                    }`}
                  >
                    <span className="text-2xl">{m.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-900">{m.name}</p>
                      <p className="text-xs text-gray-400">{m.description || `Préfixe automatique : ${m.prefix}`}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selected?.id === m.id ? 'border-blue-600 bg-blue-600 text-white' : 'border-gray-300'
                    }`}>
                      {selected?.id === m.id && <span className="text-[10px] font-bold">&#10003;</span>}
                    </div>
                  </button>
                ))}
              </div>

              {selected && (
                <div className="border-t pt-4 space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5 block">
                      Numéro de téléphone {selected.name}
                    </label>
                    <div className="flex items-center gap-2">
                      <span className="bg-gray-100 text-gray-800 font-mono font-bold px-3.5 py-3 rounded-xl text-base border">
                        {selected.prefix || '034'}
                      </span>
                      <input
                        type="tel"
                        value={phone}
                        onChange={e => setPhone(formatPhone(e.target.value))}
                        placeholder="XX XXX XX"
                        className="flex-1 px-4 py-3 border rounded-xl text-lg tracking-wider text-center font-mono focus:ring-2 focus:ring-blue-500 outline-none"
                        autoFocus
                      />
                    </div>
                    <p className="text-[11px] text-gray-400 mt-1 text-center font-medium">
                      {getRawPhone().length}/7 chiffres (ex: {selected.prefix || '034'} 12 345 67)
                    </p>
                  </div>

                  <button
                    onClick={() => setStep('confirm')}
                    disabled={getRawPhone().length < 7}
                    className="w-full bg-blue-600 text-white py-3.5 rounded-xl font-bold hover:bg-blue-700 disabled:opacity-40 transition shadow-sm text-sm"
                  >
                    Continuer vers la confirmation
                  </button>
                </div>
              )}
            </>
          )}

          {step === 'confirm' && (
            <div className="text-center space-y-4">
              <div className="text-4xl">{selected?.icon}</div>
              <h3 className="text-lg font-bold text-gray-900">{selected?.name}</h3>
              <p className="text-gray-500 text-sm">
                Compte : <span className="font-mono font-bold text-gray-800">{selected?.prefix} {phone}</span>
              </p>
              <div className="bg-blue-50 py-2.5 px-4 rounded-xl inline-block">
                <span className="text-xl font-black text-blue-600">{formatAriary(orderTotal)}</span>
              </div>

              <div className="pt-2">
                <label className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2 block">
                  Entrez votre code secret PIN Mobile Money
                </label>
                <div className="flex justify-center gap-2.5 mb-3">
                  {[0, 1, 2, 3].map(i => (
                    <div key={i} className={`w-12 h-14 border-2 rounded-xl flex items-center justify-center text-2xl font-bold transition ${
                      pin.length > i ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-gray-200'
                    }`}>
                      {pin[i] ? '•' : ''}
                    </div>
                  ))}
                </div>
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin}
                  onChange={e => setPin(formatPin(e.target.value))}
                  placeholder="4 chiffres"
                  className="w-full px-4 py-2.5 border rounded-xl text-center text-lg tracking-widest font-mono outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                  maxLength={4}
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setStep('choose')}
                  className="flex-1 py-3 border rounded-xl font-semibold hover:bg-gray-50 text-sm text-gray-700"
                >
                  Retour
                </button>
                <button
                  onClick={handlePay}
                  disabled={loading || pin.length < 4}
                  className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 disabled:opacity-50 text-sm transition shadow-sm"
                >
                  {loading ? 'Validation...' : `Payer ${formatAriary(orderTotal)}`}
                </button>
              </div>
            </div>
          )}

          {/* SUCCESS STEP WITH DIRECT PDF FACTURE LINK */}
          {step === 'success' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto text-3xl font-bold">
                ✓
              </div>
              <h3 className="text-xl font-bold text-gray-900">Paiement Réussi !</h3>
              <p className="text-xs text-gray-500">Votre paiement en Ariary a été traité et acquitté par AM Info.</p>

              <div className="bg-gray-50 rounded-2xl p-4 text-xs space-y-1.5 text-left border border-gray-100">
                <p><strong>N° Transaction :</strong> <span className="font-mono text-gray-700">{result?.transaction_id || 'TRX-MGA-9921'}</span></p>
                <p><strong>Facture N° :</strong> <span className="font-mono font-bold text-blue-700">{result?.invoice_number || `FAC-2026-${orderId.slice(-4)}`}</span></p>
                <p><strong>Montant réglé :</strong> <span className="font-bold text-emerald-700">{formatAriary(orderTotal)}</span></p>
                <p><strong>Opérateur :</strong> {selected?.name || 'MVola Telma'}</p>
              </div>

              {/* DIRECT LINK TO PDF FACTURE */}
              <div className="pt-2 space-y-2">
                <Link
                  href={`/invoices/${orderId}`}
                  target="_blank"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold text-sm transition shadow flex items-center justify-center gap-2"
                >
                  📄 Télécharger / Imprimer la Facture PDF
                </Link>

                <button
                  onClick={onClose}
                  className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl font-semibold text-xs hover:bg-gray-200 transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
