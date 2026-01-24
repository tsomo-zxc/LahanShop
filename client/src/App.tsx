import { useEffect, useState } from 'react';
import axios from 'axios';
import Navbar from './components/Navbar';
import './App.css';

interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

interface CartItem extends Product {
  quantity: number;
}

// Інтерфейс для форми замовлення
interface OrderForm {
  name: string;
  phone: string;
  address: string;
}

function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // 1. Стан для модального вікна
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // 2. Стан для даних форми
  const [formData, setFormData] = useState<OrderForm>({
    name: '',
    phone: '',
    address: ''
  });

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

  // --- ЛОГІКА ВІДПРАВКИ ЗАМОВЛЕННЯ ---
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Щоб сторінка не перезавантажувалась

    // Підготовка даних для бекенда (Mapping)
    // Ми перетворюємо наш CartItem[] у формат, який чекає CreateOrderDto
    const orderData = {
      customerName: formData.name,
      customerPhone: formData.phone,
      customerAddress: formData.address,
      items: cart.map(item => ({
        productId: item.id,
        quantity: item.quantity
      }))
    };

    try {
      // Відправляємо на сервер
      await axios.post('https://localhost:5001/api/orders', orderData);
      
      // Якщо успішно:
      alert("Дякуємо! Ваше замовлення прийнято 🎉");
      setCart([]); // Очищаємо кошик
      setIsModalOpen(false); // Закриваємо вікно
      setFormData({ name: '', phone: '', address: '' }); // Очищаємо форму
    } catch (error) {
      console.error(error);
      alert("Сталася помилка при оформленні замовлення 😢");
    }
  };

  // Оновлення полів форми при введенні
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

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
                  <span className="product-category">{product.category}</span>
                </div>
                <div>
                  <div className="product-price">{product.price} ₴</div>
                  <button className="btn-add" onClick={() => addToCart(product)}>
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
            <div className="cart-empty">Пусто... Додайте щось смачненьке!</div>
          ) : (
            <>
              <div className="cart-items-list">
                {cart.map(item => (
                  <div key={item.id} className="cart-item">
                    <div>
                      <div style={{ fontWeight: "bold" }}>{item.name}</div>
                      <div className="cart-item-details">{item.quantity} шт. x {item.price} ₴</div>
                    </div>
                    <button className="btn-remove" onClick={() => removeFromCart(item.id)}>✕</button>
                  </div>
                ))}
              </div>
              
              <div className="cart-footer">
                <div className="cart-total">
                  <span>Всього:</span><span>{totalAmount} ₴</span>
                </div>
                {/* Кнопка тепер просто відкриває модалку */}
                <button className="btn-checkout" onClick={() => setIsModalOpen(true)}>
                  Оформити замовлення
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* --- МОДАЛЬНЕ ВІКНО --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 className="modal-title">Оформлення</h2>
            
            <form onSubmit={handleOrderSubmit}>
              <div className="form-group">
                <label>Ім'я</label>
                <input 
                  type="text" 
                  name="name" 
                  value={formData.name} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Ваше ім'я"
                />
              </div>
              
              <div className="form-group">
                <label>Телефон</label>
                <input 
                  type="tel" 
                  name="phone" 
                  value={formData.phone} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="+380..."
                />
              </div>

              <div className="form-group">
                <label>Адреса доставки</label>
                <input 
                  type="text" 
                  name="address" 
                  value={formData.address} 
                  onChange={handleInputChange} 
                  required 
                  placeholder="Місто, відділення НП..."
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-close" onClick={() => setIsModalOpen(false)}>
                  Скасувати
                </button>
                <button type="submit" className="btn-submit">
                  Купити ({totalAmount} ₴)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default App