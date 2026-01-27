import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import type { Product } from '../types';
import { API_BASE_URL } from '../types';
import './ProductDetails.css'; // Стилі створимо нижче

const ProductDetails = () => {
  const { id } = useParams<{ id: string }>(); // Беремо ID з URL
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState<string>(''); // Яке фото зараз показуємо великим
  const [parsedSpecs, setParsedSpecs] = useState<Record<string, string>>({}); // Розпарсений JSON

  useEffect(() => {
    axios.get(`${API_BASE_URL}/api/products/${id}`)
      .then(response => {
        const data = response.data;
        setProduct(data);
        
        // 1. Ставимо перше фото як головне (або заглушку)
        if (data.images && data.images.length > 0) {
          setSelectedImage(data.images[0].url);
        }

        // 2. Парсимо JSON характеристик
        if (data.specifications) {
          try {
            setParsedSpecs(JSON.parse(data.specifications));
          } catch (e) {
            console.error("Невірний формат JSON у характеристиках", e);
          }
        }
      })
      .catch(error => console.error(error));
  }, [id]);

  if (!product) return <div className="loading">Завантаження...</div>;
  

  return (
    <div className="details-container">
      <button onClick={() => navigate(-1)} className="btn-back">← Назад</button>
      
      <div className="details-grid">
        {/* ЛІВА КОЛОНКА: Галерея */}
        <div className="gallery-section">
          {/* Головне велике фото */}
          <div className="main-image-container">
                <img 
                    src={selectedImage 
                    ? `${API_BASE_URL}${selectedImage}` 
                    : 'https://via.placeholder.com/400?text=No+Image'} 
                    alt={product.name} 
                    className="main-image"
                />
          </div>
          
          {/* Мініатюри */}
          <div className="thumbnails">
            {product.images && product.images.length > 0 && product.images.map(img => (
            <img 
                key={img.id}
                src={`${API_BASE_URL}${img.url}`}
                alt="thumb"
                className={`thumb ${selectedImage === img.url ? 'active' : ''}`}
                onClick={() => setSelectedImage(img.url)}
            />
            ))}
          </div>
        </div>

        {/* ПРАВА КОЛОНКА: Інфо */}
        <div className="info-section">
          <span className="category-tag">{product.categoryName}</span>
          <h1>{product.name}</h1>
          <p className="description">{product.description}</p>
          
          {/* Характеристики (з JSON) */}
          {Object.keys(parsedSpecs).length > 0 && (
            <div className="specs-container">
              <h3>Характеристики</h3>
              <table className="specs-table">
                <tbody>
                  {Object.entries(parsedSpecs).map(([key, value]) => (
                    <tr key={key}>
                      <td className="spec-key">{key}</td>
                      <td className="spec-value">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="price-block">
            <span className="price">{product.price} ₴</span>
            <button className="btn-buy-large">Додати в кошик</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;