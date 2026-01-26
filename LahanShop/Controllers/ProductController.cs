using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LahanShop.Data;   
using LahanShop.Models; 
using LahanShop.DTOs;

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

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            // МИ НЕ ПОВЕРТАЄМО Products! Ми перетворюємо їх на ProductDto "на льоту".
            // Метод .Select() — це як конвеєр: бере Product, а видає ProductDto
            return await _context.Products
                .Include(p => p.Category) // <--- ВАЖЛИВО: Підвантажуємо зв'язану таблицю
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Description = p.Description,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.Name // Беремо назву з об'єкта Category
                })
                .ToListAsync();

        }

        // GET: api/products/id
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            // Використовуємо Include, щоб підтягнути дані про категорію
            // FirstOrDefaultAsync шукає перший елемент, що відповідає умові
            var product = await _context.Products
                .Include(p => p.Category)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            // Мапимо в DTO
            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                CategoryId = product.CategoryId,
                // Перевірка на null (?.) потрібна, якщо раптом категорія була видалена
                CategoryName = product.Category?.Name ?? "Без категорії"
            };

            return productDto;
        }

        // 3. POST: api/products (Створити товар)
        [HttpPost]
        public async Task<ActionResult<ProductDto>> PostProduct(CreateProductDto createDto)
        {
            // ВАЖЛИВО: Спочатку перевіряємо, чи існує така категорія!
            // Якщо спробувати додати товар з неіснуючим CategoryId, база видасть помилку.
            var category = await _context.Categories.FindAsync(createDto.CategoryId);

            if (category == null)
            {
                return BadRequest($"Категорії з ID {createDto.CategoryId} не існує.");
            }

            var product = new Product
            {
                Name = createDto.Name,
                Price = createDto.Price,
                Description = createDto.Description,
                CategoryId = createDto.CategoryId
                // Category заповниться автоматично EF Core, або залишиться null до перезавантаження
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Формуємо відповідь. 
            // Ми беремо назву категорії зі змінної 'category', яку знайшли вище,
            // щоб не робити зайвий запит в базу.
            var resultDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                CategoryId = product.CategoryId,
                CategoryName = category.Name
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, resultDto);
        }

        // 4. DELETE: api/products/5
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

            return NoContent();
        }
    }
}