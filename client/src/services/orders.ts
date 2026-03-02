import api from './axiosInstance';
import type { OrderDto } from '../types';

// Типи даних (мають співпадати з DTO на бекенді)
export interface CreateOrderDto {
  contactName: string;
  phoneNumber: string;
  customerAddress: string;
  items: {
    productId: number;
    quantity: number;
  }[];
}

export interface OrderResponse {
  message: string;
  orderId: number;
}

// Метод створення замовлення
export const createOrder = async (orderData: CreateOrderDto): Promise<OrderResponse> => {
  const response = await api.post<OrderResponse>('/api/orders', orderData);
  return response.data;
};

export const cancelOrder = async (orderId: number) => {
  const response = await api.put(`/api/orders/${orderId}/cancel`);
  return response.data;
};

export const getMyOrders = async (): Promise<OrderDto[]> => {
  const response = await api.get<OrderDto[]>('/api/orders');
  return response.data;
};

export const getAllOrdersAdmin = async (): Promise<OrderDto[]> => {
  const response = await api.get<OrderDto[]>('/api/orders/all');
  return response.data;
};

// Оновити статус
export const updateOrderStatus = async (orderId: number, status: string) => {
  const response = await api.put(`/api/orders/${orderId}/status`, { status });
  return response.data;
};

export const getNewOrdersCount = async (): Promise<number> => {
  const response = await api.get<number>('/api/orders/count-new');
  return response.data;
};