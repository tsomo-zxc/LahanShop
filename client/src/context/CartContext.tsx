// eslint-disable-next-line react-refresh/only-export-components
import  { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode} from 'react';
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
  // 1. Завантажуємо кошик з LocalStorage при старті
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const stored = localStorage.getItem('cart');
      if (!stored) return [];

      const parsed = JSON.parse(stored);
      
      // 👇 ГОЛОВНЕ ВИПРАВЛЕННЯ:
      // Перевіряємо, чи це ДІЙСНО масив. Якщо ні — повертаємо пустий масив.
      return Array.isArray(parsed) ? parsed : [];
      
    } catch (error) {
      console.error("Помилка читання кошика", error);
      return [];
    }
  });

  // 2. Авто-збереження при будь-якій зміні
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(items));
  }, [items]);

  // --- ЛОГІКА ---

  const addToCart = (product: Product) => {
    setItems(currentItems => {
      const existingItem = currentItems.find(item => item.productId === product.id);

      if (existingItem) {
        // Якщо товар вже є, збільшуємо кількість (але не більше ніж на складі)
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
        // Якщо немає - додаємо новий
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
            // Перевіряємо, чи не перевищує ліміт складу
          ? { ...item, quantity: Math.min(quantity, item.stockQuantity) } 
          : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  // Підрахунки
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