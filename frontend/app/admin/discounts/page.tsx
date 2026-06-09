'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { EmptyState } from '@/components/ui/Skeleton';

export default function DiscountPage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [type, setType] = useState('percentage');
  const [value, setValue] = useState('');
  const [targetType, setTargetType] = useState('global');
  const [targetId, setTargetId] = useState('');
  const [targetName, setTargetName] = useState('');
  
  const [productSearch, setProductSearch] = useState('');
  const [productResults, setProductResults] = useState<any[]>([]);
  const [showProductSearch, setShowProductSearch] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  useEffect(() => {
    if (productSearch.length < 2) { setProductResults([]); return; }
    const timer = setTimeout(() => {
      apiClient.getProducts({ q: productSearch, limit: '10' })
        .then((r: any) => setProductResults(r.data || []));
    }, 200);
    return () => clearTimeout(timer);
  }, [productSearch]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowProductSearch(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const loadData = () => {
    setLoading(true);
    Promise.all([
      Promise.resolve([]), // API discounts à créer
      apiClient.getCategories().then((r: any) => setCategories(r || [])),
    ]).finally(() => setLoading(false));
  };

  const resetForm = () => {
    setName(''); setValue(''); setTargetId(''); setTargetName('');
    setProductSearch(''); setTargetType('global'); setShowForm(false);
  };

  const createDiscount = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Simulation - API discount à créer
      const newDiscount = {
        id: Date.now().toString(),
        name,
        discount_type: type,
        value: parseFloat(value),
        target_type: targetType,
        target_id: targetType !== 'global' ? targetId : null,
        is_active: true,
      };
      setDiscounts(prev => [...prev, newDiscount]);
      toast.success('Promotion créée !');
      resetForm();
    } catch (err) {
      toast.error('Erreur lors de la création');
    }
  };

  const selectProduct = (product: any) => {
    setTargetId(product.id);
    setTargetName(product.name);
    setProductSearch('');
    setShowProductSearch(false);
  };

  const toggleDiscount = (id: string) => {
    setDiscounts(prev => prev.map(d => 
      d.id === id ? { ...d, is_active: !d.is_active } : d
    ));
    toast.success('Statut modifié');
  };

  const deleteDiscount = (id: string) => {
    if (!confirm('Supprimer cette promotion ?')) return;
    setDiscounts(prev => prev.filter(d => d.id !== id));
    toast.success('Promotion supprimée');
  };

  const getTargetLabel = (d: any) => {
    if (d.target_type === 'global') return 'Tous les produits';
    if (d.target_type === 'category') return `Catégorie: ${d.target_id}`;
    return `Produit: ${d.target_id?.slice(0, 8)}`;
  };

  if (loading) return (
    <div className="text-center py-20">
      <div className="animate-spin text-4xl">⚙️</div>
      <p className="text-gray-400 mt-4">Chargement...</p>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">🏷️ Promotions ({discounts.length})</h1>
        <button onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition">
          {showForm ? 'Fermer' : '+ Nouvelle promotion'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={createDiscount} className="bg-white rounded-xl shadow p-6 mb-4">
          <h3 className="font-bold mb-4">Nouvelle promotion</h3>
          <div className="grid grid-cols-2 gap-4">
            <input
              placeholder="Nom de la promotion"
              value={name}
              onChange={e => setName(e.target.value)}
              required
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select value={type} onChange={e => setType(e.target.value)}
              className="px-4 py-2 border rounded-lg">
              <option value="percentage">Pourcentage (%)</option>
              <option value="fixed_amount">Montant fixe (€)</option>
            </select>
            <input
              placeholder={type === 'percentage' ? 'Valeur en % (ex: 15)' : 'Montant en € (ex: 50)'}
              type="number"
              value={value}
              onChange={e => setValue(e.target.value)}
              required
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select value={targetType} onChange={e => { setTargetType(e.target.value); setTargetId(''); setTargetName(''); }}
              className="px-4 py-2 border rounded-lg">
              <option value="global">Tous les produits</option>
              <option value="category">Par catégorie</option>
              <option value="product">Produit spécifique</option>
            </select>

            {targetType === 'category' && (
              <select value={targetId} onChange={e => setTargetId(e.target.value)} required
                className="px-4 py-2 border rounded-lg">
                <option value="">Choisir une catégorie</option>
                {categories.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
              </select>
            )}

            {targetType === 'product' && (
              <div ref={searchRef} className="relative">
                {targetId ? (
                  <div className="flex items-center gap-2 px-4 py-2 border rounded-lg bg-green-50 border-green-200">
                    <span className="text-green-600">✓</span>
                    <span className="text-sm text-green-700 flex-1">{targetName}</span>
                    <button type="button" onClick={() => { setTargetId(''); setTargetName(''); }}
                      className="text-green-500 hover:text-red-500">✕</button>
                  </div>
                ) : (
                  <>
                    <input
                      type="text"
                      placeholder="Rechercher un produit..."
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      onFocus={() => setShowProductSearch(true)}
                      className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {showProductSearch && productResults.length > 0 && (
                      <div className="absolute top-full mt-1 w-full bg-white rounded-xl shadow-lg border z-50 max-h-48 overflow-y-auto">
                        {productResults.map((p: any) => (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => selectProduct(p)}
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 transition text-sm border-b last:border-b-0 flex justify-between items-center"
                          >
                            <div>
                              <p className="font-medium">{p.name}</p>
                              <p className="text-xs text-gray-400">{p.brand} · {p.price?.toFixed(2)} €</p>
                            </div>
                            <span className="text-xs text-blue-500">Sélectionner</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">Créer</button>
            <button type="button" onClick={resetForm} className="bg-gray-300 px-6 py-2 rounded-lg text-sm hover:bg-gray-400">Annuler</button>
          </div>
        </form>
      )}

      {discounts.length === 0 ? (
        <EmptyState icon="🏷️" title="Aucune promotion" description="Créez votre première promotion." />
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="text-left p-3">Nom</th>
                <th className="text-center p-3">Type</th>
                <th className="text-center p-3">Valeur</th>
                <th className="text-center p-3">Cible</th>
                <th className="text-center p-3">Active</th>
                <th className="text-center p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {discounts.map(d => (
                <tr key={d.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-center">{d.discount_type === 'percentage' ? '%' : '€'}</td>
                  <td className="p-3 text-center font-bold">{d.value}{d.discount_type === 'percentage' ? '%' : ' €'}</td>
                  <td className="p-3 text-center text-gray-500">{getTargetLabel(d)}</td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleDiscount(d.id)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${d.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                      {d.is_active ? 'Oui' : 'Non'}
                    </button>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => deleteDiscount(d.id)} className="text-red-500 hover:text-red-700 text-sm">Supprimer</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
