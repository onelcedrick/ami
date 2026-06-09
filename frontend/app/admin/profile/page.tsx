'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { IconUser, IconEdit, IconCheck, IconClose } from '@/components/ui/Icons';

export default function ProfilePage() {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [editingName, setEditingName] = useState(false);
  const [fullName, setFullName] = useState(`${user?.first_name || ''} ${user?.last_name || ''}`.trim());
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isAuthenticated) {
    router.push('/admin/login');
    return null;
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const uploadAvatar = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      // Simulation upload
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Photo mise à jour !');
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const saveName = async () => {
    if (!fullName.trim()) return;
    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      toast.success('Nom mis à jour !');
      setEditingName(false);
    } catch {
      toast.error('Erreur');
    } finally {
      setSaving(false);
    }
  };

  const getInitials = () => {
    const first = user?.first_name?.[0] || '';
    const last = user?.last_name?.[0] || '';
    return (first + last).toUpperCase() || 'A';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">👤 Mon Profil</h1>

      {/* Carte profil */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-24 md:h-32 bg-gradient-to-r from-blue-600 to-indigo-600" />
        
        <div className="px-4 md:px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              {preview ? (
                <img src={preview} alt="Aperçu" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-100 border-4 border-white shadow-md flex items-center justify-center">
                  <span className="text-2xl font-bold text-blue-600">{getInitials()}</span>
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition shadow">
                <IconEdit size={13} />
              </label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" id="avatar-upload" />
            </div>

            {/* Nom + email */}
            <div className="flex-1 pt-2 md:pt-0 md:pb-2">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    className="text-xl md:text-2xl font-bold bg-gray-50 border rounded-lg px-3 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                    autoFocus
                  />
                  <button onClick={saveName} disabled={saving} className="text-green-500 hover:text-green-600 p-1" title="Enregistrer">
                    <IconCheck size={20} />
                  </button>
                  <button onClick={() => { setEditingName(false); setFullName(`${user?.first_name} ${user?.last_name}`.trim()); }} className="text-gray-400 hover:text-gray-600 p-1" title="Annuler">
                    <IconClose size={20} />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                    {user?.first_name} {user?.last_name}
                  </h1>
                  <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-blue-500 transition p-1" title="Modifier le nom">
                    <IconEdit size={15} />
                  </button>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <span>📧</span>
                <span>{user?.email}</span>
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Preview upload */}
      {preview && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
          <p className="text-sm text-gray-500 mb-3">Aperçu de la nouvelle photo</p>
          <div className="flex items-center gap-4">
            <img src={preview} alt="" className="w-16 h-16 md:w-20 md:h-20 object-cover rounded-xl" />
            <div className="flex gap-2">
              <button onClick={uploadAvatar} disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition">
                {uploading ? 'Envoi...' : 'Enregistrer'}
              </button>
              <button onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="bg-gray-100 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}

      {/* Changer photo */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="font-bold text-sm md:text-base mb-3">📷 Photo de profil</h2>
        <label htmlFor="avatar-upload"
          className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 px-4 py-2.5 rounded-lg cursor-pointer transition text-sm">
          <span>🖼️</span>
          Choisir une photo
        </label>
        <p className="text-xs text-gray-400 mt-2">Formats acceptés : JPG, PNG. Taille max : 5 Mo</p>
      </div>

      {/* Infos compte */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <h2 className="font-bold text-sm md:text-base mb-3">ℹ️ Informations du compte</h2>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">ID</span>
            <span className="font-mono text-xs">{user?.id}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Email</span>
            <span>{user?.email}</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="text-gray-500">Rôle</span>
            <span className="font-semibold capitalize">{user?.role}</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-gray-500">Prénom / Nom</span>
            <span>{user?.first_name} {user?.last_name}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
