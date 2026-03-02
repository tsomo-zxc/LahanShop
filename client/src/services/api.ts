import axios from 'axios';
import type { Product } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
});


// Mock data for fallback (since localhost:5001 won't be reachable in this preview environment)
const MOCK_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Бездротові навушники Luxe",
    price: 11999,
    description: "Відчуйте чистий звук завдяки активному шумозаглушенню та 30 годинам автономної роботи. Створені для аудіофілів, які цінують стиль та якість.",
    categoryName: "Електроніка",
    specifications: "{\"Колір\": \"Сріблястий\", \"Вага\": \"250г\", \"Батарея\": \"30 Годин\", \"Зв'язок\": \"Bluetooth 5.2\"}",
    images: [{ id: 101, url: "https://picsum.photos/800/800?random=1" }, { id: 102, url: "https://picsum.photos/800/800?random=2" }],
    stockQuantity: 1,
    isAvailable: true
  },
  {
    id: 2,
    name: "Годинник Minimalist Series 5",
    price: 5999,
    description: "Вічний дизайн із сапфіровим склом та ремінцем з натуральної шкіри. Водонепроникність до 50 метрів.",
    categoryName: "Аксесуари",
    specifications: "{\"Матеріал\": \"Нержавіюча сталь\", \"Ремінець\": \"Шкіра\", \"Водостійкість\": \"5ATM\"}",
    images: [{ id: 201, url: "https://picsum.photos/800/800?random=3" }],
    stockQuantity: 1,
    isAvailable: true
  },
  {
    id: 3,
    name: "Ергономічне офісне крісло",
    price: 18000,
    description: "Працюйте з повним комфортом завдяки підтримці попереку та дихаючому сітчастому матеріалу.",
    categoryName: "Меблі",
    specifications: "{\"Матеріал\": \"Сітка\", \"Колір\": \"Чорний\", \"Макс. навантаження\": \"150кг\"}",
    images: [{ id: 301, url: "https://picsum.photos/800/800?random=4" }],
    stockQuantity: 1,
    isAvailable: true
  },
  {
    id: 4,
    name: "Хаб Розумного Будинку",
    price: 3599,
    description: "Керуйте всім будинком за допомогою голосових команд. Сумісний з усіма основними смарт-пристроями.",
    categoryName: "Smart Home",
    specifications: "{\"Голосовий асистент\": \"Інтегрований\", \"Живлення\": \"USB-C\", \"Wifi\": \"WiFi 6\"}",
    images: [],
    stockQuantity: 1,
    isAvailable: true
  }
];

export const productService = {
  getAll: async (): Promise<Product[]> => {
    try {
      const response = await api.get<Product[]>('/api/products');
      return response.data;
    } catch (error) {
      console.error(error);
      console.warn("API unreachable, returning mock data for demonstration.");
      return new Promise((resolve) => setTimeout(() => resolve(MOCK_PRODUCTS), 500));
    }
  },
  getById: async (id: number): Promise<Product | undefined> => {
    try {
      const response = await api.get<Product>(`/api/products/${id}`);
      return response.data;
    } catch (error) {
      console.warn("API unreachable, returning mock data for demonstration.");
      console.error(error);
      const product = MOCK_PRODUCTS.find(p => p.id === id);
      return new Promise((resolve) => setTimeout(() => resolve(product), 500));
    }
  }
};

export default api;