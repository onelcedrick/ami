'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { apiClient } from '@/api/client';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

export default function ProductManagePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [brand, setBrand] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('0');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/admin/login');
      return;
    }
    loadData();
  }, [isAuthenticated]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsData, categoriesData] = await Promise.all([
        apiClient.getProducts({ limit: '100' }),
        apiClient.getCategories(),
      ]);
      setProducts(productsData.data || []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      toast.error('Erreur chargement');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setName(''); setPrice(''); setBrand(''); setCategoryId('');
    setDescription(''); setStock('0'); setEditId(null); setShowForm(false);
  };

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setName(product.name);
    setPrice(product.price?.toString() || '');
    setBrand(product.brand || '');
    setCategoryId(product.category_id || '');
    setDescription(product.description || '');
    setStock(product.stock_quantity?.toString() || '0');
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await apiClient.deleteProduct(id);
      toast.success('Produit supprimé');
      loadData();
    } catch (err) {
      toast.error('Erreur suppression');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      const data = {
        name, price: parseFloat(price), brand,
        category_id: categoryId, description,
        stock_quantity: parseInt(stock),
      };

      if (editId) {
        await apiClient.updateProduct(editId, data);
        toast.success('Produit modifié !');
      } else {
        await apiClient.createProduct(data);
        toast.success('Produit créé !');
      }
      resetForm();
      loadData();
    } catch (err: any) {
      toast.error(err.message || 'Erreur');
    } finally {
      setUploading(false);
    }
  };

  const toggleActive = async (product: any) => {
    try {
      await apiClient.updateProduct(product.id, { is_active: !product.is_active });
      loadData();
      toast.success('Visibilité modifiée');
    } catch (err) {
      toast.error('Erreur');
    }
  };

  if (loading) return <div className="text-center py-20"><div className="animate-spin text-4xl">⚙️</div></div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">📦 Produits ({products.length})</h1>
        <button onClick={() => { resetForm(); setShowForm(!showForm); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700">
          {showForm ? 'Annuler' : '+ Ajouter'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow p-6 mb-4">
          <h3 className="font-bold mb-3">{editId ? '✏️ Modifier' : '➕ Nouveau produit'}</h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Nom" value={name} onChange={e => setName(e.target.value)} required
              className="px-4 py-2 border rounded-lg" />
            <input placeholder="Prix (€)" type="number" step="0.01" value={price} onChange={e => setPrice(e.target.value)} required
              className="px-4 py-2 border rounded-lg" />
            <input placeholder="Marque" value={brand} onChange={e => setBrand(e.target.value)}
              className="px-4 py-2 border rounded-lg" />
            <input placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)}
              className="px-4 py-2 border rounded-lg" />
            <select value={categoryId} onChange={e => setCategoryId(e.target.value)}
              className="px-4 py-2 border rounded-lg">
              <option value="">Catégorie</option>
              {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <textarea placeholder="Description" value={description} onChange={e => setDescription(e.target.value)}
              className="px-4 py-2 border rounded-lg col-span-2" rows={2} />
          </div>
          <div className="flex gap-2 mt-4">
            <button type="submit" disabled={uploading}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg text-sm hover:bg-blue-700">
              {uploading ? '⏳...' : editId ? 'Modifier' : 'Créer'}
            </button>
            <button type="button" onClick={resetForm} className="bg-gray-300 px-6 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow overflow-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left p-3">Produit</th>
              <th className="text-left p-3">Catégorie</th>
              <th className="text-right p-3">Prix</th>
              <th className="text-center p-3">Stock</th>
              <th className="text-center p-3">Visible</th>
              <th className="text-center p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p: any) => (
              <tr key={p.id} className="border-t hover:bg-gray-50">
                <td className="p-3 font-medium">{p.name}</td>
                <td className="p-3 text-gray-500">{p.category?.name || '-'}</td>
                <td className="p-3 text-right font-bold text-blue-600">{p.price?.toFixed(2)} €</td>
                <td className="p-3 text-center">{p.stock_quantity}</td>
                <td className="p-3 text-center">
                  <button onClick={() => toggleActive(p)}
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {p.is_active ? 'Oui' : 'Non'}
                  </button>
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => handleEdit(p)} className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs mr-1">✏️</button>
                  <button onClick={() => handleDelete(p.id)} className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs">🗑️</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
