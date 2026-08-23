// -*- coding: utf-8 -*-
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { IconPackage, IconTrash } from '@/src/components/Icons';
import { formatAriary } from '@/src/lib/currency';

interface CartItemProps {
  item: {
    id: string;
    product_id: string;
    quantity: number;
    product?: {
      id: string;
      name: string;
      price: number;
      image_url?: string;
      stock_quantity?: number;
      category?: { name: string };
    };
  };
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  loading?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false,
}) => {
  const p = item.product;
  const price = p?.price || 0;
  const total = price * item.quantity;

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm transition hover:border-gray-200 dark:hover:border-gray-600">
      <div className="flex items-center gap-4 w-full sm:w-auto">
        <div className="w-20 h-20 bg-gray-50 dark:bg-gray-700 rounded-xl overflow-hidden relative shrink-0 flex items-center justify-center border border-gray-100 dark:border-gray-600">
          {p?.image_url ? (
            <Image
              src={p.image_url}
              alt={p.name || 'Produit'}
              fill
              sizes="80px"
              className="object-cover"
            />
          ) : (
            <IconPackage size={28} className="text-gray-300 dark:text-gray-500" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          {p?.category?.name && (
            <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400">
              {p.category.name}
            </span>
          )}
          <Link
            href={`/products/${p?.id || item.product_id}`}
            className="block text-sm font-bold text-gray-900 dark:text-white truncate hover:text-blue-600 dark:hover:text-blue-400 transition"
          >
            {p?.name || 'Article informatique'}
          </Link>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mt-0.5">
            {formatAriary(price)} / unité
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between sm:justify-end gap-6 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-gray-700">
        {/* Quantity Controls */}
        <div className="flex items-center border border-gray-200 dark:border-gray-600 rounded-xl overflow-hidden bg-gray-50 dark:bg-gray-700/50">
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, Math.max(1, item.quantity - 1))}
            disabled={item.quantity <= 1 || loading}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition"
          >
            -
          </button>
          <span className="w-9 text-center text-xs font-bold text-gray-900 dark:text-white">
            {item.quantity}
          </span>
          <button
            type="button"
            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
            disabled={loading || (p?.stock_quantity !== undefined && item.quantity >= p.stock_quantity)}
            className="w-8 h-8 flex items-center justify-center text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-30 transition"
          >
            +
          </button>
        </div>

        {/* Total Price in Ariary */}
        <div className="text-right min-w-[100px]">
          <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
            {formatAriary(total)}
          </span>
        </div>

        {/* Remove Button */}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          disabled={loading}
          className="p-2 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          title="Supprimer du panier"
        >
          <IconTrash size={16} />
        </button>
      </div>
    </div>
  );
};

export default CartItem;
