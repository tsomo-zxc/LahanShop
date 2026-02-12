import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { createOrder } from '../services/orders';

const CheckoutPage = () => {
  const { items, totalPrice, clearCart } = useCart();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Стан форми
  const [formData, setFormData] = useState({
    contactName: user?.fullName || '', // Автозаповнення, якщо є
    phoneNumber: '',
    address: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Якщо кошик порожній — вертаємо на головну
  if (items.length === 0) {
      navigate('/');
      return null;
  }
  
  // Якщо не залогінений — на логін
  if (!isAuthenticated) {
      navigate('/login');
      return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // 1. Формуємо DTO
      const orderData = {
        contactName: formData.contactName,
        phoneNumber: formData.phoneNumber,
        customerAddress: formData.address,
        items: items.map(item => ({
            productId: item.productId,
            quantity: item.quantity
        }))
      };

      // 2. Відправляємо на сервер
      const response = await createOrder(orderData);

      // 3. Успіх!
      clearCart(); // Очищаємо кошик
      navigate(`/order-success/${response.orderId}`); // Переходимо на сторінку подяки

    } catch (err: any) {
      console.error(err);
      setError(err.response?.data || "Помилка при створенні замовлення");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-36 min-h-screen">
        <h1 className="text-3xl font-bold mb-8 text-center">Оформлення замовлення</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
            
            {/* ЛІВА ЧАСТИНА - ФОРМА */}
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4">Контактні дані</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && <div className="bg-red-100 text-red-700 p-3 rounded">{error}</div>}
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700">ПІБ Отримувача</label>
                        <input 
                            type="text" required
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={formData.contactName}
                            onChange={e => setFormData({...formData, contactName: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Телефон</label>
                        <input 
                            type="tel" required
                            placeholder="+380..."
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            value={formData.phoneNumber}
                            onChange={e => setFormData({...formData, phoneNumber: e.target.value})}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Адреса доставки</label>
                        <textarea 
                            required rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md p-2"
                            placeholder="Місто, відділення НП або вулиця"
                            value={formData.address}
                            onChange={e => setFormData({...formData, address: e.target.value})}
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={isLoading}
                        className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700 transition disabled:bg-gray-400"
                    >
                        {isLoading ? 'Обробка...' : `Підтвердити замовлення (${totalPrice} грн)`}
                    </button>
                </form>
            </div>

            {/* ПРАВА ЧАСТИНА - ПІДСУМОК */}
            <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 h-fit">
                <h2 className="text-xl font-semibold mb-4">Ваше замовлення</h2>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {items.map(item => (
                        <div key={item.productId} className="flex justify-between text-sm">
                            <span>{item.name} <span className="text-gray-500">x{item.quantity}</span></span>
                            <span className="font-medium">{(item.price * item.quantity).toFixed(0)} грн</span>
                        </div>
                    ))}
                </div>
                <div className="border-t border-gray-300 mt-4 pt-4 flex justify-between text-xl font-bold">
                    <span>Разом:</span>
                    <span className="text-blue-600">{totalPrice} грн</span>
                </div>
            </div>
        </div>
    </div>
  );
};

export default CheckoutPage;