import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getMyOrders, cancelOrder } from '../services/orders';
import type { OrderDto } from '../types';
import { FaBoxOpen, FaCalendarAlt, FaMapMarkerAlt, FaMoneyBillWave, FaUser, FaPhone } from 'react-icons/fa';
import SEO from '../components/SEO';


const OrdersPage = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const handleCancelOrder = async (orderId: number) => {
    if (window.confirm('Ви впевнені, що хочете скасувати це замовлення?')) {
      try {
        await cancelOrder(orderId);
        loadOrders();
      } catch (err) {
        console.error(err);
        alert('Не вдалося скасувати замовлення.');
      }
    }
  };

  const loadOrders = async () => {
    try {
      const data = await getMyOrders();
      setOrders(data);
    } catch (err) {
      console.error(err);
      setError('Не вдалося завантажити історію замовлень.');
    } finally {
      setIsLoading(false);
    }
  };

  // Status badge colors
  const getStatusBadge = (status: string) => {
    const styles: { [key: string]: string } = {
      New: 'bg-blue-100 text-blue-800',
      Processing: 'bg-yellow-100 text-yellow-800',
      Shipped: 'bg-purple-100 text-purple-800',
      Completed: 'bg-green-100 text-green-800',
      Cancelled: 'bg-red-100 text-red-800',
    };

    const labels: { [key: string]: string } = {
      New: 'Нове',
      Processing: 'В обробці',
      Shipped: 'Відправлено',
      Completed: 'Виконано',
      Cancelled: 'Скасовано',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {labels[status] || status}
      </span>
    );
  };

  // Loading
  if (isLoading) {
    return (
      <div className="min-h-screen flex justify-center items-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Error or empty
  if (orders.length === 0 && !error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 text-center px-4">
        <FaBoxOpen className="text-gray-300 text-6xl mb-4" />
        <h2 className="text-2xl font-bold text-gray-700">У вас поки немає замовлень</h2>
        <p className="text-gray-500 mb-8 mt-2">Але це легко виправити!</p>
        <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-full hover:bg-blue-700 transition shadow-md">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 pt-36 min-h-screen max-w-5xl">
      <SEO
        title="Мої замовлення"
        robots="noindex, nofollow"
      />
      <h1 className="text-3xl font-bold mb-8 text-gray-900 border-b pb-4">Мої замовлення</h1>

      {error && <div className="bg-red-100 text-red-700 p-4 rounded mb-6">{error}</div>}

      <div className="space-y-6">
        {orders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">

            {/* Order header */}
            <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex flex-wrap justify-between items-center gap-4">
              <div>
                <p className="text-sm text-gray-500 flex items-center gap-2">
                  <FaCalendarAlt /> {new Date(order.orderDate).toLocaleDateString()} o {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
                <p className="font-bold text-lg text-gray-800 mt-1">
                  Замовлення №{order.id}
                </p>
              </div>

              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Сума:</p>
                    <p className="font-bold text-blue-600 text-lg flex items-center gap-1">
                      <FaMoneyBillWave size={14} /> {order.totalAmount} грн
                    </p>
                  </div>
                  {getStatusBadge(order.status)}
                </div>
                {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                  <button
                    onClick={() => handleCancelOrder(order.id)}
                    className="text-sm text-red-500 hover:text-red-700 transition underline mt-1"
                  >
                    Скасувати замовлення
                  </button>
                )}
              </div>
            </div>

            {/* Order body */}
            <div className="p-6">
              <div className="mb-4 flex flex-col gap-2 bg-blue-50 p-4 rounded text-sm text-gray-700">
                <div className="flex items-center gap-2">
                  <FaUser className="text-blue-500" />
                  <span><strong>Одержувач:</strong> {order.customerName}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaPhone className="text-blue-500" />
                  <span><strong>Телефон:</strong> {order.customerPhone}</span>
                </div>
                <div className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-blue-500 mt-0.5" />
                  <span><strong>Доставка:</strong> {order.address}</span>
                </div>
              </div>

              <div className="space-y-4">
                {order.items.map((item) => (
                  <div key={item.productId} className="flex items-center gap-4 border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    {/* Image */}
                    <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 border border-gray-200">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.productName} className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex items-center justify-center h-full text-xs text-gray-400">No img</div>
                      )}
                    </div>


                    {/* Info */}
                    <div className="flex-grow">
                      <Link to={`/product/${item.productId}`} className="font-medium text-gray-900 hover:text-blue-600 transition">
                        {item.productName}
                      </Link>
                      <p className="text-sm text-gray-500">
                        {item.price} грн × {item.quantity} шт.
                      </p>
                    </div>

                    <div className="font-semibold text-gray-700">
                      {(item.price * item.quantity).toFixed(0)} грн
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;