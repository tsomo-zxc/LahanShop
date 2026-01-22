using LahanShop.Models;

namespace LahanShop.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            // Переконуємось, що база створена
            context.Database.EnsureCreated();

            // Перевірка: якщо є хоч один товар, то нічого не робимо
            if (context.Products.Any())
            {
                return;   // База вже заповнена
            }

            // Якщо товарів немає, створюємо масив
            var products = new Product[]
            {
                new Product { Name = "Ігровий Ноутбук Titan", Category = "Електроніка", Price = 45000, Description = "Потужний ноутбук для сучасних ігор" },
                new Product { Name = "Смартфон Galaxy S99", Category = "Електроніка", Price = 32000, Description = "Флагман з неймовірною камерою" },
                new Product { Name = "Навушники ProSound", Category = "Аксесуари", Price = 3500, Description = "Шумопоглинання та чіткий бас" },
                new Product { Name = "Рюкзак Urban", Category = "Одяг", Price = 1200, Description = "Стильний рюкзак для міста" },
                new Product { Name = "Механічна клавіатура RGB", Category = "Електроніка", Price = 4200, Description = "Червоні світчі, тихий хід" },
                new Product { Name = "Кавоварка SmartLife", Category = "Побут", Price = 8900, Description = "Керування зі смартфона" }
            };

            // Додаємо їх у контекст
            context.Products.AddRange(products);

            // Зберігаємо зміни в базу
            context.SaveChanges();
        }
    }
}