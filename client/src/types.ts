export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  description: string;
  categoryName: string;
  specifications: string | null;
  images: ProductImage[];
  stockQuantity: number;
  isAvailable: boolean;
}


export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
  parentName: string | null;
  productsCount: number;
  children?: Category[];
}

export interface CategorySpecTemplate {
  id: number;
  name: string;
  categoryId: number;
}

export interface User {
  email: string;
  fullName: string;
  role: string;
}
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stockQuantity: number;
}

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
  imageUrl?: string;
}

export interface OrderDto {
  id: number;
  orderDate: string;
  status: string;
  totalAmount: number;
  address: string;
  customerName: string;
  customerPhone: string;
  items: OrderItemDto[];
}
