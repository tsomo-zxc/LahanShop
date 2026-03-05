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
    // [Authorize(Roles = "Admin")] // Розкоментуй, якщо хочеш захистити
    public async Task<IActionResult> GenerateFakeData()
    {
        // 1. Перевіряємо, чи є вже категорії (якщо ні - створимо кілька базових)
        var categories = await _context.Categories.ToListAsync();
        if (!categories.Any())
        {
            categories = new List<Category>
            {
                new Category { Name = "Електроніка" },
                new Category { Name = "Одяг"  },
                new Category { Name = "Автозапчастини" } // Трохи твоєї тематики 😉
            };
            _context.Categories.AddRange(categories);
            await _context.SaveChangesAsync();
        }

        // 2. Генерація 50 ТОВАРІВ
        // "uk" означає, що назви та описи будуть українською!
        var productFaker = new Faker<Product>("uk")
            .RuleFor(p => p.Name, f => f.Commerce.ProductName())
            .RuleFor(p => p.Description, f => f.Commerce.ProductDescription())
            .RuleFor(p => p.Price, f => Math.Round(f.Random.Decimal(100, 5000), 2))
            .RuleFor(p => p.StockQuantity, f => f.Random.Int(0, 100))
            .RuleFor(p => p.CategoryId, f => f.PickRandom(categories).Id)
            .RuleFor(p => p.Specifications, f => "{\"Колір\":\"" + f.Commerce.Color() + "\"}")
            // Замість реального завантаження в Azure, даємо заглушки з випадковими картинками
            .RuleFor(p => p.Images, f => new List<ProductImage>
            {
                new ProductImage { Url = $"https://picsum.photos/seed/{f.Random.Guid()}/800/800", SortOrder = 0 }
            });

        var fakeProducts = productFaker.Generate(50);
        _context.Products.AddRange(fakeProducts);
        await _context.SaveChangesAsync();

        // 3. Генерація 30 ЗАМОВЛЕНЬ
        // Беремо існуючого користувача, якщо є (або можна залишити null для гостьових)
        var firstUser = await _context.Users.FirstOrDefaultAsync();

        var orderFaker = new Faker<Order>("uk")
            .RuleFor(o => o.OrderDate, f => f.Date.Past(1)) // Замовлення за останній рік
            .RuleFor(o => o.Status, f => f.PickRandom<OrderStatus>())
            .RuleFor(o => o.Address, f => f.Address.FullAddress())
            .RuleFor(o => o.ContactName, f => f.Person.FullName)
            .RuleFor(o => o.PhoneNumber, f => f.Phone.PhoneNumber())
            .RuleFor(o => o.UserId, f => firstUser?.Id)
            .RuleFor(o => o.Items, f =>
            {
                // Додаємо від 1 до 3 випадкових товарів у кожне замовлення
                var orderItems = new List<OrderItem>();
                var itemsCount = f.Random.Int(1, 3);
                for (int i = 0; i < itemsCount; i++)
                {
                    var randomProduct = f.PickRandom(fakeProducts);
                    var qty = f.Random.Int(1, 5);
                    orderItems.Add(new OrderItem
                    {
                        ProductId = randomProduct.Id,
                        Quantity = qty,
                        Price = randomProduct.Price // Фіксуємо ціну на момент покупки
                    });
                }
                return orderItems;
            });

        var fakeOrders = orderFaker.Generate(10);

        // Підраховуємо TotalAmount для кожного замовлення
        foreach (var order in fakeOrders)
        {
            order.TotalAmount = order.Items.Sum(i => i.Price * i.Quantity);
        }

        _context.Orders.AddRange(fakeOrders);
        await _context.SaveChangesAsync();

        return Ok(new { Message = "Успішно згенеровано 50 товарів та 10 замовлень!" });
    }
}