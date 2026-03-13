using Bogus;
using LahanShop.Data;
using LahanShop.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
// Тут мають бути твої using для моделей (Product, Order, тощо)

[Route("api/[controller]")]
[ApiController]
public class SeedController : ControllerBase
{
    private readonly AppDbContext _context;


    public SeedController(AppDbContext context)
    {
        _context = context;
    }

    [HttpPost("generate")]
    public async Task<IActionResult> GenerateFakeData(
    [FromQuery] int productsCount = 20,
    [FromQuery] int ordersCount = 5)
    {
        // 1. Захист від від'ємних значень
        if (productsCount < 0 || ordersCount < 0)
        {
            return BadRequest("Кількість товарів або замовлень не може бути від'ємною.");
        }

        if (productsCount == 0 && ordersCount == 0)
        {
            return Ok(new { Message = "Ви передали нулі. Нічого не було згенеровано." });
        }

        // 2. Перевіряємо, чи є вже категорії (тільки якщо будемо генерувати товари)
        if (productsCount > 0)
        {
            var categories = await _context.Categories.ToListAsync();
            if (!categories.Any())
            {
                categories = new List<Category>
            {
                new Category { Name = "Електроніка" },
                new Category { Name = "Одяг"  },
                new Category { Name = "Автозапчастини" }
            };
                _context.Categories.AddRange(categories);
                await _context.SaveChangesAsync();
            }

            // Генерація ТОВАРІВ
            var productFaker = new Faker<Product>("uk")
                .RuleFor(p => p.Name, f => f.Commerce.ProductName())
                .RuleFor(p => p.Description, f => f.Commerce.ProductDescription())
                .RuleFor(p => p.Price, f => Math.Round(f.Random.Decimal(100, 5000), 2))
                .RuleFor(p => p.StockQuantity, f => f.Random.Int(0, 100))
                .RuleFor(p => p.CategoryId, f => f.PickRandom(categories).Id)
                .RuleFor(p => p.Specifications, f => "{\"Колір\":\"" + f.Commerce.Color() + "\"}")
                .RuleFor(p => p.Images, f => new List<ProductImage>
                {
                new ProductImage { Url = $"https://picsum.photos/seed/{f.Random.Guid()}/800/800", SortOrder = 0 }
                });

            var fakeProducts = productFaker.Generate(productsCount);
            _context.Products.AddRange(fakeProducts);
            await _context.SaveChangesAsync(); // Зберігаємо, щоб вони отримали ID
        }

        // 3. Генерація ЗАМОВЛЕНЬ
        if (ordersCount > 0)
        {
            // 🔥 ГОЛОВНА ЗМІНА: Дістаємо всі товари, які зараз є в базі 
            // (це будуть старі товари + ті, що ми щойно згенерували вище)
            var availableProducts = await _context.Products.ToListAsync();

            // Захист: якщо товарів у базі взагалі немає, ми не можемо створити замовлення
            if (!availableProducts.Any())
            {
                return BadRequest("У базі немає жодного товару! Неможливо створити замовлення. Згенеруйте спочатку товари.");
            }

            var firstUser = await _context.Users.FirstOrDefaultAsync();

            var orderFaker = new Faker<Order>("uk")
                .RuleFor(o => o.OrderDate, f => f.Date.Past(1))
                .RuleFor(o => o.Status, f => f.PickRandom<OrderStatus>())
                .RuleFor(o => o.Address, f => f.Address.FullAddress())
                .RuleFor(o => o.ContactName, f => f.Person.FullName)
                .RuleFor(o => o.PhoneNumber, f => f.Phone.PhoneNumber())
                .RuleFor(o => o.UserId, f => firstUser?.Id)
                .RuleFor(o => o.Items, f =>
                {
                    var orderItems = new List<OrderItem>();
                    var itemsCount = f.Random.Int(1, 3);
                    for (int i = 0; i < itemsCount; i++)
                    {
                        // 🔥 Тепер вибираємо випадковий товар із загального списку бази!
                        var randomProduct = f.PickRandom(availableProducts);
                        var qty = f.Random.Int(1, 5);
                        orderItems.Add(new OrderItem
                        {
                            ProductId = randomProduct.Id,
                            Quantity = qty,
                            Price = randomProduct.Price
                        });
                    }
                    return orderItems;
                });

            var fakeOrders = orderFaker.Generate(ordersCount);

            // Підраховуємо TotalAmount для кожного замовлення
            foreach (var order in fakeOrders)
            {
                order.TotalAmount = order.Items.Sum(i => i.Price * i.Quantity);
            }

            _context.Orders.AddRange(fakeOrders);
            await _context.SaveChangesAsync();
        }

        // Робимо повідомлення динамічним, щоб воно показувало реальні цифри
        return Ok(new { Message = $"Успішно згенеровано {productsCount} товарів та {ordersCount} замовлень!" });
    }
}