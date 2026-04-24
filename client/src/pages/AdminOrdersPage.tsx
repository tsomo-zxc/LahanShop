import { useEffect, useState } from 'react';
import { getAllOrdersAdmin, updateOrderStatus, cancelOrder } from '../services/orders';
import type { OrderDto } from '../types';
import { FaSearch, FaUser, FaPhone, FaMapMarkerAlt } from 'react-icons/fa';
import SEO from '../components/SEO';

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<OrderDto[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<OrderDto[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Pagination states
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  // List of possible statuses (must match backend)
  const statusOptions = ['New', 'Processing', 'Shipped', 'Completed', 'Cancelled'];

  useEffect(() => {
    loadOrders();
  }, [page]);

  // Search by ID, Address, Name or Phone
  useEffect(() => {
    const results = orders.filter(order =>
      order.id.toString().includes(searchTerm) ||
      order.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerPhone && order.customerPhone.includes(searchTerm))
    );
    setFilteredOrders(results);
  }, [searchTerm, orders]);

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
    setIsLoading(true);
    try {
      const data = await getAllOrdersAdmin(page, pageSize);
      setOrders(data.items);
      setFilteredOrders(data.items);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Помилка завантаження", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (orderId: number, newStatus: string) => {
    const originalOrders = [...orders];

    setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));

    try {
      await updateOrderStatus(orderId, newStatus);
      // alert("Статус оновлено!"); 
    } catch (error) {
      alert("Помилка оновлення статусу");
      setOrders(originalOrders); // Rollback on error
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
      <SEO
        title="Замовлення"
        description="Замовлення"
        url="https://lahan-shop.vercel.app/admin/orders"
        robots="noindex, nofollow"
      />
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Управління замовленнями</h1>

        {/* Search */}
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
                {/* 1. ID and Date */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <p className="text-gray-900 font-bold whitespace-no-wrap">#{order.id}</p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </td>

                {/* 2. Delivery Data */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2 text-gray-900">
                      <FaUser className="text-blue-500" size={12} />
                      <span className="font-bold">{order.customerName}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600 text-xs">
                      <FaPhone className="text-blue-500" size={12} />
                      <span>{order.customerPhone}</span>
                    </div>
                    <div className="flex items-start gap-2 text-gray-700 mt-1">
                      <FaMapMarkerAlt className="text-blue-500 mt-0.5" size={12} />
                      <span className="whitespace-no-wrap font-medium">{order.address}</span>
                    </div>
                  </div>
                </td>

                {/* 3. Total Amount and Products */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm w-1/3">
                  <p className="text-gray-900 font-bold mb-2">Загалом: {order.totalAmount} грн</p>
                  <div className="text-xs text-gray-600 flex flex-col gap-1.5 border-t border-gray-100 pt-2">
                    {order.items.map(i => (
                      <div key={i.productId} className="flex justify-between items-start gap-4">
                        <span className="flex-1 font-medium">{i.productName}</span>
                        <span className="whitespace-nowrap text-gray-500 text-right">
                          {i.price} грн × {i.quantity} шт. <br />
                          <span className="font-semibold text-gray-800">={(i.price * i.quantity).toFixed(0)} грн</span>
                        </span>
                      </div>
                    ))}
                  </div>
                </td>

                {/* 4. Status Change */}
                <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                  <div className="flex flex-col gap-2">
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
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      </div>
                    </div>
                    {order.status !== 'Cancelled' && order.status !== 'Completed' && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="text-sm text-red-500 hover:text-red-700 transition underline self-start"
                      >
                        Скасувати
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center py-4 gap-4 bg-gray-50 border-t border-gray-200">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Попередня
            </button>
            <span className="text-gray-700 font-medium whitespace-nowrap">
              Сторінка {page} з {totalPages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-300 rounded shadow-sm hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Наступна
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminOrdersPage;