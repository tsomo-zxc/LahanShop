import { useEffect, useState } from 'react';
import axios from 'axios';

// 1. Створюємо інтерфейс (аналог DTO з C#)
interface Product {
  id: number;
  name: string;
  price: number;
  category: string;
}

function App() {
  // 2. Стан для збереження товарів
  const [products, setProducts] = useState<Product[]>([]);

  // 3. Цей код спрацює 1 раз при запуску сторінки
  useEffect(() => {
    // Вставте ТУТ свій порт від C# API ↓↓↓
    axios.get('https://localhost:5001/api/products')
      .then(response => {
        setProducts(response.data); // Записуємо дані в стан
      })
      .catch(error => {
        console.error("Помилка при завантаженні:", error);
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>Список товарів</h1>
      
      {/* 4. Виводимо список */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "20px" }}>
        {products.map(product => (
          <div key={product.id} style={{ border: "1px solid #ccc", padding: "10px", borderRadius: "8px" }}>
            <h3>{product.name}</h3>
            <p style={{ color: "gray" }}>{product.category}</p>
            <p style={{ fontWeight: "bold", color: "green" }}>{product.price} грн</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App