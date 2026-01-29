import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import ProductCard from '../components/ProductCard';
import type { Product } from '../types';
import { API_BASE_URL } from '../constants';

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>(); // Беремо ID з URL
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState<string>("");

  useEffect(() => {
    const fetchProductsByCategory = async () => {
      try {
        setLoading(true);
        // Запит на наш новий ендпоінт
        const response = await axios.get(`${API_BASE_URL}/api/products/category/${id}`);
        setProducts(response.data);
        
        // Маленька хитрість: беремо назву категорії з першого товару (якщо товари є)
        if (response.data.length > 0) {
            setCategoryName(response.data[0].categoryName);
        } else {
            // Якщо товарів немає, назву категорії можна підтягнути окремим запитом, 
            // але поки напишемо просто "Категорія"
            setCategoryName("Категорія");
        }
      } catch (error) {
        console.error("Помилка завантаження товарів:", error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
        fetchProductsByCategory();
    }
  }, [id]); // Перезапускати, коли змінюється ID (клікнули іншу категорію)

  if (loading) {
    return (
        <div className="flex justify-center items-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-16"> 
      
      {/* Заголовок категорії */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          {categoryName}
        </h1>
        <p className="text-gray-500">
          Знайдено товарів: {products.length}
        </p>
      </div>

      {/* СІТКА ТОВАРІВ */}
      {products.length > 0 ? (        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            // Більше не треба складних обгорток з шириною, Grid сам все вирішує
            <div key={product.id} className="flex justify-center sm:justify-start">
                <ProductCard product={product} />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <p className="text-xl text-gray-500">У цій категорії поки немає товарів.</p>
        </div>
      )}
    </div>
  );
};

export default CategoryPage;