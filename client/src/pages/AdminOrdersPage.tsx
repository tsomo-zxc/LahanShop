import { useEffect, useState } from 'react';
import { getAllOrdersAdmin, updateOrderStatus} from '../services/orders';
import type { OrderDto } from '../types';
import { FaBox, FaCheck, FaTruck, FaClock, FaTimes, FaSearch } from 'react-icons/fa';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Список можливих статусів (має співпадати з бекендом)
  const statusOptions = ['New', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  useEffect(() => {
    loadOrders();
  }, []);

  // Пошук по ID або Імені
  useEffect(() => {
    const results = orders.filter(order => 
        order.id.toString().includes(searchTerm) || 
        order.address.toLowerCase().includes(searchTerm.toLowerCase()) 
        // Тут можна додати пошук по імені клієнта, якщо воно є в DTO
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

  const loadOrders = async () => {
    try {
      const data = await getAllOrdersAdmin();
      setOrders(data);
      setFilteredOrders(data);
    } catch (error) {
      console.error("Помилка завантаження", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    // Оптимістичне оновлення інтерфейсу (миттєво міняємо в таблиці)
    const originalOrders = [...orders];
    
    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      await updateOrderStatus(orderId, newStatus);
      // alert("Статус оновлено!"); // Можна додати toast повідомлення
    } catch (error) {
      alert("Помилка оновлення статусу");
      setOrders(originalOrders); // Відкочуємо назад при помилці
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-purple-100 text-purple-800';
      case 'Completed': return 'bg-green-100 text-green-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100';
    }
  };

  if (isLoading) return <div className="text-center pt-20">Завантаження...</div>;

  return (
    <div className="container mx-auto px-4 py-8 pt-36 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Управління замовленнями</h1>
        
        {/* Пошук */}
        <div className="relative">
            <input 
                type="text" 
                placeholder="Пошук (ID, Адреса)..." 
                className="border rounded-full py-2 px-4 pl-10 focus:ring-2 focus:ring-blue-500 outline-none"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
            />
            <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden overflow-x-auto">
        <table className="min-w-full leading-normal">
          <thead>
            <tr>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                ID / Дата
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Клієнт / Адреса
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Сума / Товари
              </th>
              <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Статус
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id}>
                {/* 1. ID і Дата */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 font-bold whitespace-no-wrap">#{order.id}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.orderDate).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </td>

                {/* 2. Дані доставки */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                   <div className="flex items-center">
                        <div className="ml-3">
                            <p className="text-gray-900 whitespace-no-wrap font-medium">
                                {order.address}
                            </p>
                            {/* Тут можна додати ім'я та телефон, якщо ми розширимо DTO */}
                        </div>
                   </div>
                </td>

                {/* 3. Сума і товари */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                   <p className="text-gray-900 font-bold">{order.totalAmount} грн</p>
                   <div className="text-xs text-gray-500 mt-1">
                       {order.items.map(i => (
                           <div key={i.productId}>• {i.productName} (x{i.quantity})</div>
                       ))}
                   </div>
                </td>

                {/* 4. Зміна Статусу */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="relative">
                    <select
                        value={order.status}
                        onChange={(e) => handleStatusChange(order.id, e.target.value)}
                        className={`block w-full appearance-none border border-gray-300 hover:border-gray-400 px-4 py-2 pr-8 rounded shadow leading-tight focus:outline-none focus:shadow-outline font-semibold ${getStatusColor(order.status)}`}
                    >
                        {statusOptions.map(option => (
                            <option key={option} value={option} className="bg-white text-gray-800">
                                {option}
                            </option>
                        ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrdersPage;