import { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Імпорти компонентів
import Navbar from '../components/Navbar'; 
import '../App.css';

// Імпорти типів та констант
import type { Product } from '../types';
import { API_BASE_URL } from '../types'; // Переконайтеся, що додали це в types.ts
// Якщо ще не додали змінну, замініть на 'https://localhost:5001'

// Імпорт хука кошика
import { useCart } from '../context/CartContext';

function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  
  // Беремо функцію додавання з нашого "глобального мозку"
  const { addToCart } = useCart();

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products`)
      .then(response => setProducts(response.data))
      .catch(error => console.error("Error loading products:", error));
  }, []);

  return (
    <div className="app-container">
      <Navbar />

      <div className="main-layout">
        
        {/* Тепер тут тільки сітка товарів на всю ширину */}
        <div className="products-section" style={{ flex: 'none', width: '100%' }}>
          <h1>Каталог товарів</h1>
          
          <div className="products-grid">
            {products.map(product => (
              <div key={product.id} className="product-card">
                
                {/* Клікабельне зображення */}
                <Link to={`/product/${product.id}`} style={{textDecoration: 'none', color: 'inherit'}}>
                    <div style={{height: '150px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '10px'}}>
                        <img 
                            src={product.images && product.images.length > 0 
                                ? `${API_BASE_URL}${product.images[0].url}` 
                                : 'https://via.placeholder.com/200?text=No+Image'} 
                            alt={product.name}
                            style={{maxWidth: '100%', maxHeight: '100%', objectFit: 'contain'}} 
                        />
                    </div>
                    <h3>{product.name}</h3>
                </Link>

                <div>
                  <span className="product-category">
                    {product.categoryName || "Без категорії"}
                  </span>
                </div>
                
                <div>
                  <div className="product-price">{product.price} ₴</div>
                  
                  {/* Кнопка тепер використовує глобальний контекст */}
                  <button className="btn-add" onClick={() => addToCart(product)}>
                    Додати в кошик
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}

export default Home;