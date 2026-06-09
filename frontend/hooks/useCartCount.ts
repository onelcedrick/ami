import { useCart } from '@/contexts/CartContext';

export default function useCartCount(): number {
  const { cartCount } = useCart();
  return cartCount;
}
