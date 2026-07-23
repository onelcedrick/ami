// -*- coding: utf-8 -*-
'use client';

import { useState, useCallback } from 'react';
import ConfirmModal from '@/src/components/ConfirmModal';

export default function useConfirm() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState<{
    title: string;
    message: string;
    variant: 'danger' | 'warning' | 'success' | 'info';
  }>({ title: '', message: '', variant: 'danger' });
  const [resolveRef, setResolveRef] = useState<((value: boolean) => void) | null>(null);

  const confirm = useCallback((title: string, message: string, variant: 'danger' | 'warning' | 'success' | 'info' = 'danger') => {
    return new Promise<boolean>((resolve) => {
      setConfig({ title, message, variant });
      setIsOpen(true);
      setResolveRef(() => resolve);
    });
  }, []);

  const handleConfirm = () => {
    setIsOpen(false);
    if (resolveRef) resolveRef(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    if (resolveRef) resolveRef(false);
  };

  const Modal = (
    <ConfirmModal
      open={isOpen}
      title={config.title}
      message={config.message}
      variant={config.variant}
      onConfirm={handleConfirm}
      onCancel={handleCancel}
    />
  );

  return { confirm, Modal };
}
