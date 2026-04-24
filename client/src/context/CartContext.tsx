// eslint-disable-next-line react-refresh/only-export-components
import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { Product } from '../types';
import type { CartItem } from '../types';


interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  // 1. Load cart from LocalStorage at startup
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (!stored) return [];

      const parsed = JSON.parse(stored);

      return Array.isArray(parsed) ? parsed : [];

    } catch (error) {
      console.error("Помилка читання кошика", error);
      return [];
    }
  });

  // 2. Auto-save cart to LocalStorage on any change
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // --- LOGIC ---

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.id);

      if (existingItem) {
        // If the product is already in the cart, increase the quantity (but not more than the stock quantity)
        if (existingItem.quantity >= product.stockQuantity) {
          alert("Більше немає в наявності!");
          return currentItems;
        }
        return currentItems.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // If the product is not in the cart, add it
        return [...currentItems, {
          productId: product.id,
          name: product.name,
          price: product.price,
          imageUrl: product.images && product.images.length > 0 ? product.images[0].url : undefined,
          quantity: 1,
          stockQuantity: product.stockQuantity
        }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setItems(currentItems => currentItems.filter(item => item.productId !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }
    setItems(currentItems =>
      currentItems.map(item =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, item.stockQuantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Calculations
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice, totalItems }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};