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
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Description = p.Description,
                    Category = p.Category
                })
                .ToListAsync();
        }

        // GET: api/products/id
        [HttpGet("{id}")]
        public async Task<ActionResult<ProductDto>> GetProduct(int id)
        {
            var product = await _context.Products.FindAsync(id);

            if (product == null)
            {
                return NotFound();
            }

            // Ручний мапінг одного об'єкта
            var productDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                Category = product.Category
            };

            return productDto;
        }

        // POST: api/products
        // Увага: Приймаємо CreateProductDto, а не Product!
        [HttpPost]
        public async Task<ActionResult<ProductDto>> PostProduct(CreateProductDto createDto)
        {
            // 1. Створюємо сутність для бази даних з DTO
            var product = new Product
            {
                Name = createDto.Name,
                Price = createDto.Price,
                Description = createDto.Description,
                Category = createDto.Category
                // Id ми не чіпаємо! База створить його сама. Це безпечно.
            };

            // 2. Зберігаємо в базу
            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // 3. Формуємо відповідь (Dto з новим ID)
            var resultDto = new ProductDto
            {
                Id = product.Id, // Тут Id вже з'явився після збереження
                Name = product.Name,
                Price = product.Price,
                Description = product.Description,
                Category = product.Category
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, resultDto);
        }

        // DELETE: api/products/id
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