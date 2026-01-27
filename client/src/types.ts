export interface ProductImage {
  id: number;
  url: string;
}

export interface Product {
  id: number;
  name: string;
  price: number;
  categoryName: string;
  description: string;
  // Нові поля:
  specifications?: string; // Приходить як JSON-рядок
  images: ProductImage[];
}

export interface CartItem extends Product {
  quantity: number;
}

export const API_BASE_URL = "https://localhost:5001";