'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import toast from 'react-hot-toast';
import api from '@/src/api/axios';
import { useAuth } from '@/src/hooks/useAuth';
import { IconUser, IconPhoto, IconTrash, IconEdit, IconEmail } from '@/src/components/Icons';

export default function ProfilePage() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/api/v1/auth/avatar', formData);
      setAvatarUrl(res.data.avatar_url);
      setPreview(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Photo mise à jour');
    } catch {
      toast.error('Erreur lors de l’envoi de la photo');
    } finally {
      setUploading(false);
    }
  };

  const deleteAccount = async () => {
    try {
      await api.delete('/api/v1/auth/account');
      toast.success('Compte supprimé');
      logout();
      router.push('/');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
    setShowDeleteConfirm(false);
  };

  const avatarDisplay = preview || avatarUrl;

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
        <div className="h-24 md:h-32 bg-gradient-to-r from-blue-600 to-indigo-700" />
        <div className="px-4 md:px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <div className="relative flex-shrink-0">
              {avatarDisplay ? (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-md relative">
                  <Image src={avatarDisplay} alt="Photo de profil" fill className="object-cover" />
                </div>
              ) : (
                <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-blue-100 dark:bg-blue-900 border-4 border-white dark:border-gray-800 shadow-md flex items-center justify-center">
                  <IconUser size={36} className="text-blue-500 dark:text-blue-400" />
                </div>
              )}
              <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-blue-600 text-white w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition shadow">
                <IconEdit size={13} />
              </label>
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" id="avatar-upload" />
            </div>

            <div className="flex-1 pt-2 md:pt-0 md:pb-2">
              <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white">{user?.first_name} {user?.last_name}</h1>
              <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm mt-0.5">
                <IconEmail size={14} />
                <span>{user?.email}</span>
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold capitalize">
                {user?.role}
              </span>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4">
          <p className="text-sm text-gray-500 mb-3">Aperçu de la nouvelle photo</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-xl overflow-hidden relative">
              <Image src={preview} alt="Aperçu" fill className="object-cover" />
            </div>
            <div className="flex gap-2">
              <button onClick={uploadAvatar} disabled={uploading}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50 transition">
                {uploading ? 'Envoi...' : 'Enregistrer'}
              </button>
              <button onClick={() => { setPreview(null); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                className="bg-gray-100 dark:bg-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200 transition">Annuler</button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
        <h2 className="font-bold text-sm md:text-base mb-3 text-gray-900 dark:text-white">Photo de profil</h2>
        <label htmlFor="avatar-upload"
          className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 px-4 py-2.5 rounded-lg cursor-pointer transition text-sm text-gray-800 dark:text-gray-200 font-medium">
          <IconPhoto size={18} />
          Choisir une photo
        </label>
        <p className="text-xs text-gray-400 mt-2">Formats acceptés : JPG, PNG, WEBP. Taille max : 5 Mo</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-4 md:p-6">
        <h2 className="font-bold text-sm md:text-base text-red-600 mb-3">Zone dangereuse</h2>
        {!showDeleteConfirm ? (
          <button onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-2.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition text-sm">
            <IconTrash size={18} />
            Supprimer mon compte
          </button>
        ) : (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-700 dark:text-red-300 text-sm mb-3 font-semibold">Cette action est irréversible. Toutes vos données seront supprimées.</p>
            <div className="flex gap-2">
              <button onClick={deleteAccount} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition">Confirmer la suppression</button>
              <button onClick={() => setShowDeleteConfirm(false)} className="bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 px-4 py-2 rounded-lg text-sm hover:bg-gray-50 transition">Annuler</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
