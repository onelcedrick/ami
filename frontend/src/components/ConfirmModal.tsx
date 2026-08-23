'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { IconClose } from './Icons';

export interface ConfirmModalProps {
  open?: boolean;
  isOpen?: boolean;
  title?: string;
  message?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel?: () => void;
  onClose?: () => void;
  variant?: 'danger' | 'warning' | 'success' | 'info';
  type?: 'danger' | 'warning' | 'success' | 'info';
}

export default function ConfirmModal({
  open,
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  onConfirm,
  onCancel,
  onClose,
  variant,
  type = 'danger',
}: ConfirmModalProps) {
  const isVisible = open !== undefined ? open : isOpen;
  const handleClose = onCancel || onClose || (() => {});
  const activeVariant = variant || type;

  if (!isVisible) return null;

  const variants = {
    danger: {
      icon: (
        <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      ),
      confirmBg: 'bg-red-500 hover:bg-red-600',
      ringColor: 'ring-red-100 dark:ring-red-900/40'
    },
    warning: {
      icon: (
        <div className="w-14 h-14 bg-yellow-100 dark:bg-yellow-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      confirmBg: 'bg-yellow-500 hover:bg-yellow-600',
      ringColor: 'ring-yellow-100 dark:ring-yellow-900/40'
    },
    success: {
      icon: (
        <div className="w-14 h-14 bg-green-100 dark:bg-green-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      ),
      confirmBg: 'bg-green-500 hover:bg-green-600',
      ringColor: 'ring-green-100 dark:ring-green-900/40'
    },
    info: {
      icon: (
        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/30 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      ),
      confirmBg: 'bg-blue-500 hover:bg-blue-600',
      ringColor: 'ring-blue-100 dark:ring-blue-900/40'
    }
  };

  const v = variants[activeVariant] || variants.danger;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className={`relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-md ring-1 ${v.ringColor} border border-gray-100 dark:border-gray-700`}
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition"
          >
            <IconClose size={20} />
          </button>

          {v.icon}

          <h3 className="text-xl font-bold text-center mb-2 text-gray-900 dark:text-white">
            {title || 'Confirmation'}
          </h3>

          <p className="text-gray-500 dark:text-gray-400 text-sm text-center mb-6">
            {message || 'Êtes-vous sûr de vouloir continuer ?'}
          </p>

          <div className="flex gap-3">
            <button
              onClick={handleClose}
              className="flex-1 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition text-sm"
            >
              {cancelText || 'Annuler'}
            </button>
            <button
              onClick={onConfirm}
              className={`flex-1 py-2.5 rounded-xl text-white font-semibold transition text-sm ${v.confirmBg}`}
            >
              {confirmText || 'Confirmer'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
