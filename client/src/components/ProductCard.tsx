import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../types';
import { CURRENCY_FORMATTER, API_BASE_URL } from '../constants';
import { FaShoppingCart } from 'react-icons/fa';
import { useCart } from '../context/CartContext';

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const { addToCart } = useCart();

  // 1. Перевірка наявності (Тільки Є або Немає)
  const isOutOfStock = product.stockQuantity <= 0;

  // Handle image logic
  const hasImages = product.images && product.images.length > 0;

  // Construct image URL
  let imageUrl = "https://picsum.photos/400/400?grayscale";

  if (hasImages) {
    const rawUrl = product.images[0].url;
    if (rawUrl.startsWith('http')) {
      imageUrl = rawUrl;
    } else {
      imageUrl = `${API_BASE_URL}${rawUrl}`;
    }
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // 2. Блокуємо додавання, якщо немає в наявності
    if (!isOutOfStock) {
      addToCart(product);
    }
  };

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col h-full w-full border border-gray-100">
      <Link to={`/product/${product.id}`} className="block relative overflow-hidden aspect-square bg-gray-100">
        <img
          src={imageUrl}
          alt={product.name}
          className={`w-full h-full object-cover object-center transition-transform duration-500 ease-out 
            ${isOutOfStock ? 'grayscale opacity-80' : 'group-hover:scale-110'}`}
          loading="lazy"
        />

        {/* 3. Плашка на зображенні, якщо немає товару */}
        {isOutOfStock ? (
          <div className="absolute inset-0 bg-white/40 flex items-center justify-center z-10">
            <span className="bg-gray-800 text-white px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
              Немає в наявності
            </span>
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        )}
      </Link>

      <div className="p-5 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-1">
          <div className="text-xs font-semibold text-blue-600 uppercase tracking-wider">
            {product.categoryName}
          </div>

          {/* 4. Текстовий індикатор статусу */}
          <div className={`text-xs font-medium ${isOutOfStock ? 'text-red-500' : 'text-green-600'}`}>
            {isOutOfStock ? 'Немає в наявності' : 'Є в наявності'}
          </div>
        </div>

        <Link to={`/product/${product.id}`} className="block">
          <h3 className="text-lg font-bold text-gray-900 mb-2 truncate group-hover:text-blue-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        <p className="text-gray-500 text-sm line-clamp-2 mb-4 flex-grow">
          {product.description}
        </p>

        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <span className={`text-xl font-bold ${isOutOfStock ? 'text-gray-400' : 'text-gray-900'}`}>
            {CURRENCY_FORMATTER.format(product.price)}
          </span>




          {product.stockQuantity > 0 ? (
            <button
              onClick={handleAddToCart}
              className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-md"
              title="Додати в кошик"
            >
              <FaShoppingCart />
            </button>
          ) : (
            <span className="text-gray-600 p-2 rounded-full bg-gray-200 font-medium"><FaShoppingCart /></span>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductCard;