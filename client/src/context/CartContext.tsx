import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react'; // <--- ВИПРАВЛЕННЯ 1: Окремий імпорт для типу
import type { CartItem, Product } from '../types';

// Інтерфейс контексту
interface CartContextType {
  cart: CartItem[];
  isOpen: boolean;
  totalAmount: number;
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  toggleCart: (open: boolean) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

// Провайдер
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      //setIsOpen(true); // Відкриваємо кошик при додаванні
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const removeFromCart = (id: number) => {
    setCart(prev => prev.filter(item => item.id !== id));
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ cart, isOpen, totalAmount, addToCart, removeFromCart, toggleCart: setIsOpen, clearCart }}>
      {children}
    </CartContext.Provider>
  );
};

// ВИПРАВЛЕННЯ 2: Додаємо цей коментар перед експортом хука
// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within a CartProvider");
  return context;
};