'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';
import { IconClose, IconCheck } from '@/src/components/Icons';

export default function DiscountPage() {
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [targetType, setTargetType] = useState('global');
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  const [minOrderAmount, setMinOrderAmount] = useState('');
  const [description, setDescription] = useState('');

  // Product search
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => { loadData(); }, []);

  useEffect(() => {
    if (productSearch.length < 2) { setProductResults([]); return; }
    const timer = setTimeout(() => {
      api.get(`/api/v1/products?q=${encodeURIComponent(productSearch)}`)
        .then((r: any) => setProductResults(r.data || []))
        .catch(() => {});
    }, 200);
    return () => clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowProductSearch(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [dRes, cRes] = await Promise.all([
        api.get('/api/v1/admin/discounts').catch(() => api.get('/api/v1/discounts')),
        api.get('/api/v1/categories'),
      ]);
      setDiscounts(Array.isArray(dRes) ? dRes : dRes.data || []);
      setCategories(Array.isArray(cRes) ? cRes : cRes.data || []);
    } catch {
      toast.error('Erreur chargement des promotions');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName('');
    setCode('');
    setValue('');
    setTargetId('');
    setTargetName('');
    setMinOrderAmount('');
    setDescription('');
    setProductSearch('');
    setTargetType('global');
    setShowForm(false);
  };

  const createDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      name,
      code: code.trim().toUpperCase(),
      discount_type: type,
      value: parseFloat(value),
      target_type: targetType,
      target_id: targetType !== 'global' ? targetId : null,
      min_order_amount: minOrderAmount ? parseFloat(minOrderAmount) : 0,
      description: description || `${name} - ${value}${type === 'percentage' ? '%' : ' Ar'}`,
      is_active: true
    };

    try {
      await api.post('/api/v1/admin/discounts', payload);
      toast.success(`Promotion "${payload.code}" créée avec succès !`);
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors de la création');
    }
  };

  const selectProduct = (product: any) => {
    setTargetId(product.id);
    setTargetName(product.name);
    setProductSearch('');
    setShowProductSearch(false);
  };

  const toggleDiscount = async (id: string) => {
    try {
      await api.patch(`/api/v1/admin/discounts/${id}/toggle`);
      setDiscounts(prev => prev.map(d => d.id === id ? { ...d, is_active: !d.is_active } : d));
      toast.success('Statut de la promotion mis à jour');
    } catch {
      toast.error('Erreur');
    }
  };

  const deleteDiscount = async (id: string) => {
    if (!confirm('Supprimer définitivement cette promotion ?')) return;
    try {
      await api.delete(`/api/v1/admin/discounts/${id}`);
      setDiscounts(prev => prev.filter(d => d.id !== id));
      toast.success('Promotion supprimée');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const getTargetLabel = (d: any) => {
    if (d.target_type === 'global') return '🌍 Tous les produits';
    if (d.target_type === 'category') {
      const cat = categories.find(c => c.id === d.target_id || c.name === d.target_id);
      return `📁 Catégorie: ${cat?.name || d.target_id}`;
    }
    return `📦 Produit ciblé (${d.target_id?.slice(0, 8)})`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Promotions & Codes Réduction</h1>
        <div className="animate-pulse h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Codes Promo & Réductions ({discounts.length})</h1>
          <p className="text-sm text-gray-500">Configurez les codes promotionnels appliqués au panier en Ariary (MGA)</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          {showForm ? 'Fermer' : '+ Nouvelle promotion'}
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <form onSubmit={createDiscount} className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 space-y-5 animate-fadeIn">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-bold text-lg text-gray-900">🏷️ Créer un nouveau code promotionnel</h3>
            <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-3 py-1 rounded-full">
              Actif immédiatement au panier
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Nom */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom de l’offre *</label>
              <input
                placeholder="Ex: Remise Spéciale Rentrée"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            {/* Code promo */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Code promo (à saisir au panier) *</label>
              <input
                placeholder="Ex: BIENVENUE10, AMINFO50K"
                value={code}
                onChange={e => setCode(e.target.value.toUpperCase())}
                required
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-mono font-bold text-sm uppercase text-blue-600"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Type de réduction *</label>
              <select
                value={type}
                onChange={e => setType(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="percentage">Pourcentage de remise (%)</option>
                <option value="fixed_amount">Montant fixe déduit (Ariary - Ar)</option>
              </select>
            </div>

            {/* Valeur */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                {type === 'percentage' ? 'Valeur en pourcentage (%) *' : 'Montant de la remise (Ar) *'}
              </label>
              <div className="relative">
                <input
                  placeholder={type === 'percentage' ? 'Ex: 10 pour -10%' : 'Ex: 50000'}
                  type="number"
                  step={type === 'percentage' ? '1' : '1000'}
                  value={value}
                  onChange={e => setValue(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-sm"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">
                  {type === 'percentage' ? '%' : 'Ar'}
                </span>
              </div>
            </div>

            {/* Montant minimum */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Montant minimum d’achat (Optionnel - Ar)</label>
              <div className="relative">
                <input
                  placeholder="Ex: 200000"
                  type="number"
                  step="1000"
                  value={minOrderAmount}
                  onChange={e => setMinOrderAmount(e.target.value)}
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">Ar</span>
              </div>
            </div>

            {/* Cible */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Application de la remise</label>
              <select
                value={targetType}
                onChange={e => { setTargetType(e.target.value); setTargetId(''); setTargetName(''); }}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="global">Tous les produits du catalogue</option>
                <option value="category">Une catégorie spécifique</option>
                <option value="product">Un produit spécifique</option>
              </select>
            </div>

            {/* Category Target */}
            {targetType === 'category' && (
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Choisir la catégorie cible *</label>
                <select
                  value={targetId}
                  onChange={e => setTargetId(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
                >
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map((c: any) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Product Target */}
            {targetType === 'product' && (
              <div ref={searchRef} className="relative md:col-span-2">
                <label className="block text-xs font-semibold text-gray-700 mb-1">Rechercher le produit cible *</label>
                {targetId ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 border rounded-xl bg-emerald-50 border-emerald-200">
                    <IconCheck size={16} className="text-emerald-600" />
                    <span className="text-sm font-medium text-emerald-800 flex-1">{targetName}</span>
                    <button
                      type="button"
                      onClick={() => { setTargetId(''); setTargetName(''); }}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <IconClose size={16} />
                    </button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Tapez un mot-clé pour chercher le produit..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      onFocus={() => setShowProductSearch(true)}
                      className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                    />
                    {showProductSearch && productResults.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-xl border z-50 max-h-48 overflow-y-auto">
                        {productResults.map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectProduct(p)}
                            className="w-full text-left px-4 py-2.5 hover:bg-blue-50 text-sm border-b flex items-center justify-between"
                          >
                            <div>
                              <p className="font-semibold text-gray-900">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.brand} - {formatAriary(p.price)}</p>
                            </div>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2.5 py-1 rounded-md font-semibold">Choisir</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm"
            >
              Enregistrer la promotion
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="bg-gray-100 text-gray-700 px-6 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-200 transition"
            >
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* List */}
      {discounts.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-gray-400">Aucune promotion active actuellement.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-3.5">Code Promo</th>
                  <th className="p-3.5">Intitulé</th>
                  <th className="p-3.5 text-center">Valeur Remise</th>
                  <th className="p-3.5">Cible & Conditions</th>
                  <th className="p-3.5 text-center">Statut</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {discounts.map(d => (
                  <tr key={d.id} className="hover:bg-blue-50/40 transition">
                    <td className="p-3.5">
                      <span className="font-mono font-bold text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-md border border-blue-200">
                        {d.code || d.name}
                      </span>
                    </td>
                    <td className="p-3.5 font-medium text-gray-900">{d.name}</td>
                    <td className="p-3.5 text-center font-bold text-emerald-600">
                      {d.discount_type === 'percentage' ? `-${d.value}%` : `-${formatAriary(d.value)}`}
                    </td>
                    <td className="p-3.5 text-gray-500 text-xs">
                      <div>{getTargetLabel(d)}</div>
                      {d.min_order_amount > 0 && (
                        <div className="text-amber-600 font-medium">Min. {formatAriary(d.min_order_amount)}</div>
                      )}
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => toggleDiscount(d.id)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                          d.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-500'
                        }`}
                      >
                        {d.is_active ? 'Actif' : 'Inactif'}
                      </button>
                    </td>
                    <td className="p-3.5 text-center">
                      <button
                        onClick={() => deleteDiscount(d.id)}
                        className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                      >
                        Supprimer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
