'use client';

import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { formatAriary } from '@/src/lib/currency';
import { IconPackage, IconTrash, IconCheck } from '@/src/components/Icons';

const PRESET_IMAGES = [
  { label: 'PC Portable', url: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80' },
  { label: 'PC Fixe Gamer', url: 'https://images.unsplash.com/photo-1587831990711-23ca6441447b?w=600&q=80' },
  { label: 'Composant / GPU', url: 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=600&q=80' },
  { label: 'Écran QHD', url: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=600&q=80' },
  { label: 'SSD NVMe', url: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=600&q=80' },
  { label: 'Clavier & Souris', url: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&q=80' },
  { label: 'Atelier SAV', url: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&q=80' },
  { label: 'Réseau / Routeur', url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&q=80' },
];

export default function ProductManagePage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [comparePrice, setComparePrice] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [description, setDescription] = useState('');
  const [stock, setStock] = useState('10');
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    setName('');
    setPrice('');
    setComparePrice('');
    setCategory('');
    setBrand('');
    setDescription('');
    setStock('10');
    setImageUrl('');
    setEditId(null);
    setShowForm(false);
  };

  const handleEdit = (product: any) => {
    setEditId(product.id);
    setName(product.name || '');
    setPrice(product.price?.toString() || '');
    setComparePrice(product.compare_price ? product.compare_price.toString() : '');
    setCategory(product.category?.id || product.category_id || '');
    setBrand(product.brand || '');
    setDescription(product.description || '');
    setStock(product.stock_quantity?.toString() || '10');
    setImageUrl(product.image_url || product.thumbnail || product.images?.[0] || '');
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce produit ?')) return;
    try {
      await api.delete(`/api/v1/products/${id}`);
      toast.success('Produit supprimé');
      loadData();
    } catch { toast.error('Erreur lors de la suppression'); }
  };

  const handleRestock = async (id: string, qty: number) => {
    const newQty = prompt('Nouvelle quantité de stock :', qty.toString());
    if (newQty === null) return;
    try {
      await api.put(`/api/v1/products/${id}`, { stock_quantity: parseInt(newQty) || 0 });
      toast.success('Stock mis à jour');
      loadData();
    } catch { toast.error('Erreur mise à jour stock'); }
  };

  const toggleVisibility = async (product: any) => {
    try {
      await api.put(`/api/v1/products/${product.id}`, { is_active: !product.is_active });
      toast.success(product.is_active ? 'Produit masqué' : 'Produit activé');
      loadData();
    } catch { toast.error('Erreur'); }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageUrl(reader.result as string);
      toast.success('Image chargée !');
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);

    const priceNum = parseFloat(price);
    const compareNum = comparePrice ? parseFloat(comparePrice) : undefined;

    const data = {
      name,
      price: priceNum,
      compare_price: compareNum,
      brand,
      category_id: category,
      description,
      stock_quantity: parseInt(stock) || 0,
      image_url: imageUrl || 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=600&q=80',
    };

    try {
      if (editId) {
        await api.put(`/api/v1/products/${editId}`, data);
        toast.success('Produit modifié avec succès');
      } else {
        await api.post('/api/v1/products', data);
        toast.success('Produit créé avec succès');
      }
      resetForm();
      loadData();
    } catch {
      toast.error('Erreur lors de l’enregistrement');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Produits</h1>
        <div className="animate-pulse h-48 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Catalogue Produits ({products.length})</h1>
          <p className="text-sm text-gray-500">Gérez le catalogue AM Info en Ariary (MGA), stock et visuels</p>
        </div>
        <button
          onClick={() => {
            if (showForm) resetForm();
            else { resetForm(); setShowForm(true); }
          }}
          className="bg-blue-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm flex items-center gap-2"
        >
          {showForm ? 'Fermer le formulaire' : '+ Ajouter un produit'}
        </button>
      </div>

      {/* Form modal/card */}
      {showForm && (
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-md border border-blue-100 p-6 space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between border-b pb-4">
            <h3 className="text-lg font-bold text-gray-900">
              {editId ? '✏️ Modifier le produit' : '✨ Nouveau produit au catalogue'}
            </h3>
            <span className="text-xs bg-blue-50 text-blue-700 font-semibold px-3 py-1 rounded-full">
              Devise : Ariary (Ar)
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Nom */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Nom du produit *</label>
              <input
                placeholder="Ex: PC Portable Pro Stealth 15'' Core i7"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            {/* Marque */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Marque / Fabricant</label>
              <input
                placeholder="Ex: Asus, Lenovo, Dell, MSI, AM Tech"
                value={brand}
                onChange={e => setBrand(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            {/* Prix Ariary */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prix de vente (Ariary - Ar) *</label>
              <div className="relative">
                <input
                  placeholder="Ex: 1500000"
                  type="number"
                  step="100"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  required
                  className="w-full pl-4 pr-12 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-semibold text-sm"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">Ar</span>
              </div>
              {price && <p className="text-xs text-blue-600 mt-1 font-medium">{formatAriary(price)}</p>}
            </div>

            {/* Prix Promo (barré) */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Prix barré / Promo (Optionnel - Ar)</label>
              <div className="relative">
                <input
                  placeholder="Ex: 1800000 (Prix normal avant remise)"
                  type="number"
                  step="100"
                  value={comparePrice}
                  onChange={e => setComparePrice(e.target.value)}
                  className="w-full pl-4 pr-12 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
                <span className="absolute right-3 top-2.5 text-gray-400 font-bold text-xs">Ar</span>
              </div>
              {comparePrice && parseFloat(comparePrice) > parseFloat(price || '0') && (
                <p className="text-xs text-emerald-600 mt-1 font-medium">
                  Remise affichée : -{Math.round(((parseFloat(comparePrice) - parseFloat(price)) / parseFloat(comparePrice)) * 100)}%
                </p>
              )}
            </div>

            {/* Stock */}
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Quantité en stock *</label>
              <input
                placeholder="Ex: 10"
                type="number"
                value={stock}
                onChange={e => setStock(e.target.value)}
                required
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
              />
            </div>

            {/* Categorie */}
            <div className="lg:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Catégorie de matériel *</label>
              <select
                value={category}
                onChange={e => setCategory(e.target.value)}
                required
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            {/* Description */}
            <div className="lg:col-span-3">
              <label className="block text-xs font-semibold text-gray-700 mb-1">Description détaillée & caractéristiques</label>
              <textarea
                placeholder="Spécifications techniques, processeur, RAM, SSD, garantie atelier AM Info..."
                value={description}
                onChange={e => setDescription(e.target.value)}
                className="w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                rows={3}
              />
            </div>

            {/* IMAGE MANAGEMENT SECTION */}
            <div className="lg:col-span-3 bg-gray-50 p-5 rounded-2xl border border-gray-200 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    🖼️ Image du produit
                  </label>
                  <p className="text-xs text-gray-500">Ajoutez une URL directe, importez une photo locale ou choisissez un modèle rapide</p>
                </div>
                {imageUrl && (
                  <button
                    type="button"
                    onClick={() => setImageUrl('')}
                    className="text-xs text-red-600 hover:text-red-700 font-semibold"
                  >
                    Effacer l’image
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {/* Inputs: URL & File Upload */}
                <div className="md:col-span-2 space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">URL de l’image (Web / Unsplash / CDN)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/..."
                      value={imageUrl}
                      onChange={e => setImageUrl(e.target.value)}
                      className="w-full px-4 py-2 border rounded-xl bg-white text-sm outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-xl text-xs font-semibold hover:bg-gray-100 transition shadow-sm flex items-center gap-1.5"
                    >
                      📁 Importer une photo depuis l’ordinateur
                    </button>
                    <span className="text-xs text-gray-400">JPG, PNG, WebP (Max 5 Mo)</span>
                  </div>

                  {/* Presets */}
                  <div>
                    <span className="text-xs font-semibold text-gray-500 block mb-2">Ou sélectionnez un visuel rapide :</span>
                    <div className="flex flex-wrap gap-2">
                      {PRESET_IMAGES.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setImageUrl(preset.url)}
                          className={`text-xs px-2.5 py-1 rounded-lg border transition ${
                            imageUrl === preset.url
                              ? 'bg-blue-600 text-white border-blue-600'
                              : 'bg-white text-gray-700 hover:bg-gray-100 border-gray-200'
                          }`}
                        >
                          {preset.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Preview Box */}
                <div className="flex flex-col items-center justify-center p-3 bg-white border border-gray-200 rounded-xl aspect-video md:aspect-square overflow-hidden relative">
                  {imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imageUrl}
                      alt="Aperçu produit"
                      className="w-full h-full object-cover rounded-lg"
                      onError={() => toast.error("Impossible de charger l'aperçu de l'image")}
                    />
                  ) : (
                    <div className="text-center p-4 text-gray-400">
                      <IconPackage size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="text-xs">Aperçu visuel</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={uploading}
              className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-700 disabled:opacity-50 transition shadow-sm"
            >
              {uploading ? 'Enregistrement...' : editId ? 'Mettre à jour le produit' : 'Créer le produit'}
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

      {/* Table list */}
      {products.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border">
          <p className="text-gray-400">Aucun produit dans le catalogue.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b">
                <tr>
                  <th className="p-3.5 text-center w-16">Visuel</th>
                  <th className="p-3.5">Produit</th>
                  <th className="p-3.5">Catégorie</th>
                  <th className="p-3.5 text-right">Prix (Ariary)</th>
                  <th className="p-3.5 text-center">Stock</th>
                  <th className="p-3.5 text-center">Statut</th>
                  <th className="p-3.5 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map(p => {
                  const img = p.image_url || p.thumbnail || p.images?.[0];
                  return (
                    <tr key={p.id} className={`hover:bg-blue-50/40 transition ${p.stock_quantity === 0 ? 'bg-red-50/50' : ''}`}>
                      {/* Thumbnail */}
                      <td className="p-3 text-center">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 overflow-hidden mx-auto border flex items-center justify-center flex-shrink-0">
                          {img ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={img} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <IconPackage size={20} className="text-gray-300" />
                          )}
                        </div>
                      </td>

                      {/* Name & Brand */}
                      <td className="p-3">
                        <div className="font-semibold text-gray-900">{p.name}</div>
                        <div className="text-xs text-gray-400">{p.brand || 'AM Info'}</div>
                      </td>

                      {/* Category */}
                      <td className="p-3 text-gray-600">
                        <span className="text-xs bg-gray-100 text-gray-700 px-2.5 py-1 rounded-md font-medium">
                          {p.category?.name || 'Composants'}
                        </span>
                      </td>

                      {/* Price in Ariary */}
                      <td className="p-3 text-right font-bold text-blue-600 whitespace-nowrap">
                        <div>{formatAriary(p.price)}</div>
                        {p.compare_price && p.compare_price > p.price && (
                          <div className="text-xs text-gray-400 line-through font-normal">
                            {formatAriary(p.compare_price)}
                          </div>
                        )}
                      </td>

                      {/* Stock */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => handleRestock(p.id, p.stock_quantity)}
                          title="Cliquer pour modifier le stock"
                          className={`px-3 py-1 rounded-full text-xs font-bold transition hover:scale-105 ${
                            p.stock_quantity > 5
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.stock_quantity > 0
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {p.stock_quantity} en stock
                        </button>
                      </td>

                      {/* Visible */}
                      <td className="p-3 text-center">
                        <button
                          onClick={() => toggleVisibility(p)}
                          className={`px-3 py-1 rounded-full text-xs font-semibold transition ${
                            p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                          }`}
                        >
                          {p.is_active ? 'Actif' : 'Masqué'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-3 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleEdit(p)}
                          className="bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-lg text-xs font-semibold mr-1.5 transition"
                        >
                          Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(p.id)}
                          className="bg-red-50 text-red-700 hover:bg-red-100 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
