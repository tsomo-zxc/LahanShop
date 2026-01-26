using LahanShop.Models;

namespace LahanShop.Data
{
    public static class DbInitializer
    {
        public static void Initialize(AppDbContext context)
        {
            context.Database.EnsureCreated();

            if (context.Categories.Any()) return; // Якщо категорії є — виходимо

            // 1. Створюємо Головні категорії
            var electronics = new Category { Name = "Електроніка" };
            var clothes = new Category { Name = "Одяг" };

            context.Categories.AddRange(electronics, clothes);
            context.SaveChanges(); // Зберігаємо, щоб отримати ID

            // 2. Створюємо Підкатегорії (для Електроніки)
            var laptops = new Category { Name = "Ноутбуки", Parent = electronics };
            var phones = new Category { Name = "Смартфони", Parent = electronics };

            context.Categories.AddRange(laptops, phones);
            context.SaveChanges();

            // 3. Створюємо Під-підкатегорії (для Ноутбуків)
            var asusLaptops = new Category { Name = "Ноутбуки Asus", Parent = laptops };
            var appleLaptops = new Category { Name = "MacBook", Parent = laptops };

            context.Categories.AddRange(asusLaptops, appleLaptops);
            context.SaveChanges();

            // 4. Додаємо товари вже в конкретні кінцеві категорії
            var products = new Product[]
            {
                new Product { Name = "Asus TUF Gaming", Price = 45000, Category = asusLaptops }, // Вкладеність 3 рівня!
                new Product { Name = "iPhone 15", Price = 32000, Category = phones },           // Вкладеність 2 рівня
                new Product { Name = "Футболка White", Price = 500, Category = clothes }        // Вкладеність 1 рівня
            };

            context.Products.AddRange(products);
            context.SaveChanges();
        }
    }
}