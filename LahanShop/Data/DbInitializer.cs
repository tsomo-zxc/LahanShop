using LahanShop.Models;
using Microsoft.AspNetCore.Identity;

namespace LahanShop.Data
{
    public static class DbInitializer

    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            // Отримуємо менеджери для користувачів та ролей
            var roleManager = serviceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = serviceProvider.GetRequiredService<UserManager<User>>();

            // 1. Створюємо ролі, якщо їх немає
            string[] roleNames = { "Admin", "User" };
            foreach (var roleName in roleNames)
            {
                var roleExist = await roleManager.RoleExistsAsync(roleName);
                if (!roleExist)
                {
                    await roleManager.CreateAsync(new IdentityRole(roleName));
                }
            }

            // 2. (Опціонально) Створюємо дефолтного адміна
            // Це зручно, щоб одразу мати доступ до адмінки
            var adminEmail = "admin@lahan.com";
            var adminUser = await userManager.FindByEmailAsync(adminEmail);

            if (adminUser == null)
            {
                var newAdmin = new User
                {
                    UserName = adminEmail,
                    Email = adminEmail,
                    FullName = "Головний Адмін",
                    EmailConfirmed = true
                };

                // Пароль має бути складним (вимоги Identity)
                var result = await userManager.CreateAsync(newAdmin, "AdminPass123!");

                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(newAdmin, "Admin");
                }
            }
        }
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