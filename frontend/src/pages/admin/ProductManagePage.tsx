// -*- coding: utf-8 -*-
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';

export default function ProductManagePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('0');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [pRes, cRes] = await Promise.all([
        api.get('/api/v1/products?limit=100'),
        api.get('/api/v1/categories'),
      ]);
      setProducts(pRes.data || []);
      setCategories(Array.isArray(cRes) ? cRes : []);
    } catch { toast.error('Erreur chargement'); }
    finally { setLoading(false); }
  };

  const resetForm = () => {
    setName(''); setPrice(''); setCategory(''); setBrand(''); setDescription('');
    setStock('0'); setEditId(null); setShowForm(false);
  };

  const handleEdit = (product: any) => {
    setEditId(product.id); setName(product.name); setPrice(product.price?.toString() || '');
    setCategory(product.category?.id || product.category_id || '');
    setBrand(product.brand || ''); setDescription(product.description || '');
    setStock(product.stock_quantity?.toString() || '0'); setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try { await api.delete(`/api/v1/products/${id}`); toast.success('Produit supprime'); loadData(); }
    catch { toast.error('Erreur'); }
  };

  const handleRestock = async (id: string, qty: number) => {
    const newQty = prompt('Nouvelle quantite :', qty.toString());
    if (newQty === null) return;
    try { await api.put(`/api/v1/products/${id}`, { stock_quantity: parseInt(newQty) }); toast.success('Stock mis a jour'); loadData(); }
    catch { toast.error('Erreur'); }
  };

  const toggleVisibility = async (product: any) => {
    try { await api.put(`/api/v1/products/${product.id}`, { is_active: !product.is_active }); loadData(); }
    catch { toast.error('Erreur'); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    const data = { name, price: parseFloat(price), brand, category_id: category, description, stock_quantity: parseInt(stock) };
    try {
      if (editId) { await api.put(`/api/v1/products/${editId}`, data); toast.success('Modifie'); }
      else { await api.post('/api/v1/products', data); toast.success('Ajoute'); }
      resetForm(); loadData();
    } catch { toast.error('Erreur'); }
    finally { setUploading(false); }
  };

  if (loading) return <div><h1 className="text-2xl font-bold mb-4">Produits</h1><div className="animate-pulse h-40 bg-gray-200 rounded-xl" /></div>;

  return (
    <div className="h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Produits ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm">{showForm ? 'Annuler' : '+ Ajouter'}</button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-4">
          <h3 className="font-bold mb-3">{editId ? 'Modifier' : 'Nouveau'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required className="px-4 py-2 border rounded-lg" />
            <input placeholder="Prix (EUR)" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required className="px-4 py-2 border rounded-lg" />
            <input placeholder="Marque" value={brand} onChange={e => setBrand(e.target.value)} className="px-4 py-2 border rounded-lg" />
            <input placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} className="px-4 py-2 border rounded-lg" />
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-2 border rounded-lg">
              <option value="">Categorie</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)} className="px-4 py-2 border rounded-lg col-span-2" rows={2} />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={uploading} className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm disabled:opacity-50">{uploading ? '...' : editId ? 'Modifier' : 'Creer'}</button>
            <button type="button" onClick={resetForm} className="bg-gray-300 px-6 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </form>
      )}

      {products.length === 0 ? (
        <div className="text-center py-16"><p className="text-gray-400">Aucun produit</p></div>
      ) : (
        <div className="flex-1 bg-white rounded-xl shadow overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 sticky top-0"><tr><th className="p-3 text-left">Produit</th><th className="p-3 text-left">Categorie</th><th className="p-3 text-right">Prix</th><th className="p-3 text-center">Stock</th><th className="p-3 text-center">Visible</th><th className="p-3 text-center">Actions</th></tr></thead>
            <tbody>{products.map(p => (
              <tr key={p.id} className={`border-t hover:bg-gray-50 ${p.stock_quantity===0?'bg-red-50':''}`}>
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-gray-500">{p.category?.name || '-'}</td>
                <td className="p-3 text-right font-bold text-blue-600">{p.price?.toFixed(2)} EUR</td>
                <td className="p-3 text-center"><button onClick={()=>handleRestock(p.id,p.stock_quantity)} className="font-bold hover:underline">{p.stock_quantity}</button></td>
                <td className="p-3 text-center"><button onClick={()=>toggleVisibility(p)} className={`px-3 py-1 rounded-full text-xs font-semibold ${p.is_active?'bg-green-100 text-green-800':'bg-red-100 text-red-800'}`}>{p.is_active?'Oui':'Non'}</button></td>
                <td className="p-3 text-center"><button onClick={()=>handleEdit(p)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1">Modifier</button><button onClick={()=>handleDelete(p.id)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">Supprimer</button></td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
