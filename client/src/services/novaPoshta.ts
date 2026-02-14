// Ваш ключ API (вставте свій, або використовуйте цей демо-ключ, якщо він ще живий)
const API_KEY = "2afbfef227ca90cc05e6bb49717bae18"; 
const API_URL = "https://api.novaposhta.ua/v2.0/json/";

export interface City {
  Ref: string;
  Present: string; // Назва міста (напр. "м. Київ")
}

export interface Warehouse {
  Ref: string;
  Description: string; // Назва відділення (напр. "Відділення №1: ...")
}

// 1. Пошук міста (SearchSettlements)
export const searchCities = async (cityName: string): Promise<City[]> => {
  const body = {
    apiKey: API_KEY,
    modelName: "Address",
    calledMethod: "searchSettlements",
    methodProperties: {
      CityName: cityName,
      Limit: "50",
      Page: "1"
    }
  };

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json();
  
  if (data.success && data.data[0]) {
    // API повертає масив адрес, нам треба саме масив міст з поля "Addresses"
    return data.data[0].Addresses.map((item: any) => ({
      Ref: item.DeliveryCity, // Це важливо! Це ID міста для пошуку відділень
      Present: item.Present
    }));
  }
  return [];
};

// 2. Отримання відділень (getWarehouses)
export const getWarehouses = async (cityRef: string): Promise<Warehouse[]> => {
  const body = {
    apiKey: API_KEY,
    modelName: "Address",
    calledMethod: "getWarehouses",
    methodProperties: {
      CityRef: cityRef, // Шукаємо по ID міста
      Limit: "500",     // Беремо максимум відділень
      Language: "UA"
    }
  };

  const response = await fetch(API_URL, {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" }
  });

  const data = await response.json();
  
  if (data.success) {
    return data.data.map((item: any) => ({
      Ref: item.Ref,
      Description: item.Description
    }));
  }
  return [];
};