'use client';

import React, { useState, useCallback } from 'react';
import ConfirmModal from '@/src/components/ConfirmModal';

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

export function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({});
  const [resolver, setResolver] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((opts: ConfirmOptions): Promise<boolean> => {
    setOptions(opts);
    setIsOpen(true);
    return new Promise((resolve) => {
      setResolver(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolver) resolver(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolver) resolver(false);
  };

  const ConfirmDialog = (
    <ConfirmModal
      isOpen={isOpen}
      onClose={handleCancel}
      onConfirm={handleConfirm}
      title={options.title || 'Confirmer l’action'}
      message={options.message || 'Êtes-vous sûr de vouloir continuer ?'}
      confirmText={options.confirmText || 'Confirmer'}
      cancelText={options.cancelText || 'Annuler'}
      type={options.type || 'danger'}
    />
  );

  return { confirm, ConfirmDialog };
}

export default useConfirm;
