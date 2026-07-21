'use client';

// -*- coding: utf-8 -*-
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { IconCart, IconCheck } from './Icons';

interface AddToCartButtonProps {
  onClick: () => void;
  className?: string;
}

export default function AddToCartButton({ onClick, className = '' }: AddToCartButtonProps) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    setAdded(true);
    onClick?.();
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <button onClick={handleClick} className={className}>
      <AnimatePresence mode="wait">
        {added ? (
          <motion.span
            key="check"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center justify-center gap-1"
          >
            <IconCheck size={16} /> Ajoute !
          </motion.span>
        ) : (
          <motion.span
            key="cart"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="flex items-center justify-center gap-1"
          >
            <IconCart size={16} /> Ajouter
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
