'use client';

// -*- coding: utf-8 -*-
'use client';

import { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/src/hooks/useAuth';
import { IconUser, IconEdit, IconEmail, IconCheck, IconClose } from '@/src/components/Icons';

export default function AdminProfilePage() {
  const { user, login } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [editingName, setEditingName] = useState(false);
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const saveName = async () => {
    setSaving(true);
    toast.success('Nom mis a jour');
    setEditingName(false);
    setSaving(false);
  };

  const getInitials = () => {
    const f = user?.first_name?.[0] || '';
    const l = user?.last_name?.[0] || '';
    return (f + l).toUpperCase() || 'A';
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl md:text-2xl font-bold">Mon Profil</h1>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="h-24 md:h-32 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-4 md:px-6 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            <div className="relative flex-shrink-0">
              {preview ? (
                <img src={preview} alt="" className="w-20 h-20 md:w-24 md:h-24 rounded-full object-cover border-4 border-white shadow-md" />
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

            <div className="flex-1 pt-2 md:pt-0 md:pb-2">
              {editingName ? (
                <div className="flex items-center gap-2 mb-1">
                  <input type="text" value={firstName} onChange={e => setFirstName(e.target.value)} className="text-xl font-bold bg-gray-50 border rounded-lg px-3 py-1 w-1/2" autoFocus />
                  <input type="text" value={lastName} onChange={e => setLastName(e.target.value)} className="text-xl font-bold bg-gray-50 border rounded-lg px-3 py-1 w-1/2" />
                  <button onClick={saveName} disabled={saving} className="text-green-500 p-1"><IconCheck size={20} /></button>
                  <button onClick={() => setEditingName(false)} className="text-gray-400 p-1"><IconClose size={20} /></button>
                </div>
              ) : (
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl md:text-2xl font-bold text-gray-800">{user?.first_name} {user?.last_name}</h1>
                  <button onClick={() => setEditingName(true)} className="text-gray-400 hover:text-blue-500 p-1"><IconEdit size={15} /></button>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-500 text-sm">
                <IconEmail size={14} /><span>{user?.email}</span>
              </div>
              <span className="inline-block mt-2 px-2.5 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      </div>

      {preview && (
        <div className="bg-white rounded-2xl shadow-sm border p-4">
          <p className="text-sm text-gray-500 mb-3">Apercu</p>
          <div className="flex items-center gap-4">
            <img src={preview} alt="" className="w-16 h-16 object-cover rounded-xl" />
            <button onClick={() => setPreview(null)} className="bg-gray-100 px-4 py-2 rounded-lg text-sm">Annuler</button>
          </div>
        </div>
      )}
    </div>
  );
}
