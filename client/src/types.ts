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
  // Це поле ми заповнимо самі на фронтенді
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
  role: string; // "Admin" або "User"
}
export interface CartItem {
  productId: number;
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
  stockQuantity: number; // Щоб не дати замовити більше, ніж є
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
  orderDate: string; // Дати з JSON завжди приходять як стрічки
  status: string;    // "New", "Processing" тощо
  totalAmount: number;
  address: string;
  customerName: string;
  customerPhone: string;
  items: OrderItemDto[];
}
