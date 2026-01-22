using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LahanShop.Data;   // Підключаємо папку з базою даних
using LahanShop.Models; // Підключаємо папку з моделями

namespace LahanShop.Controllers
{
    // [Route] вказує адресу: api/products
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;

        // Конструктор: тут ми отримуємо доступ до бази даних (Dependency Injection)
        public ProductsController(AppDbContext context)
        {
            _context = context;
        }

        // 1. GET: api/products (Отримати всі товари)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            // async/await використовується, щоб сервер не зависав, поки база шукає дані
            return await _context.Products.ToListAsync();
        }

        // 2. GET: api/products/5 (Отримати один товар за ID)
        [HttpGet("{id}")]
        public async Task<ActionResult<Product>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound(); // Повертає код 404
            }

            return product; // Повертає код 200 і товар
        }

        // 3. POST: api/products (Створити новий товар)
        [HttpPost]
        public async Task<ActionResult<Product>> PostProduct(Product product)
        {
            // Додаємо в пам'ять
            _context.Products.Add(product);
            // Зберігаємо в базу (фізично)
            await _context.SaveChangesAsync();

            // Повертає код 201 Created і посилання на створений товар
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        // 4. DELETE: api/products/5 (Видалити товар)
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
            {
                return NotFound();
            }

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent(); // Повертає код 204 (Успіх, але вмісту немає)
        }
    }
}