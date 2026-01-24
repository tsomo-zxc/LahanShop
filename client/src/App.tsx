import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import './App.css'; // <--- НЕ ЗАБУДЬТЕ ПІДКЛЮЧИТИ CSS

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);

  useEffect(() => {
    axios.get('https://localhost:5001/api/products')
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error:", error));
  }, []);

  const addToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      if (existingItem) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return (
    <div className="app-container">
      
      <Navbar />

      <div className="main-layout">
        
        {/* ЛІВА ЧАСТИНА */}
        <div className="products-section">
          <h1>Каталог товарів</h1>
          
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                <div>
                  <h3>{product.name}</h3>
                  <span className="product-category">
                    {product.category}
                  </span>
                </div>

                <div>
                  <div className="product-price">
                    {product.price} ₴
                  </div>
                  <button 
                    className="btn-add"
                    onClick={() => addToCart(product)}
                  >
                    Додати в кошик
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРАВА ЧАСТИНА */}
        <div className="cart-section">
          <h2 className="cart-header">Ваш кошик 🛒</h2>
          
          {cart.length === 0 ? (
            <div className="cart-empty">
              Пусто... Додайте щось смачненьке! 
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <div style={{ fontWeight: "bold" }}>{item.name}</div>
                      <div className="cart-item-details">
                        {item.quantity} шт. x {item.price} ₴
                      </div>
                    </div>
                    <button 
                      className="btn-remove"
                      onClick={() => removeFromCart(item.id)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Всього:</span>
                  <span>{totalAmount} ₴</span>
                </div>
                <button className="btn-checkout">
                  Оформити замовлення
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </div>
  )
}

export default App