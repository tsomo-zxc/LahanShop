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
        private readonly IWebHostEnvironment _env;

        // Конструктор: тут ми отримуємо доступ до бази даних (Dependency Injection)
        public ProductsController(AppDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProducts()
        {
            // МИ НЕ ПОВЕРТАЄМО Products! Ми перетворюємо їх на ProductDto "на льоту".
            // Метод .Select() — це як конвеєр: бере Product, а видає ProductDto
            return await _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .Select(p => new ProductDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Price = p.Price,
                    Description = p.Description,
                    CategoryId = p.CategoryId,
                    CategoryName = p.Category.Name,
                    Specifications = p.Specifications,
                    ImageUrls = p.Images.Select(img => img.Url).ToList()
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
                .Include(x => x.Images)
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
                CategoryName = product.Category?.Name ?? "Без категорії",                
                Specifications = product.Specifications,
                ImageUrls = product.Images.Select(img => img.Url).ToList()
            };

            return productDto;
        }

        // POST: api/products
        [HttpPost]
        // [FromForm] обов'язково, бо ми шлемо файли!
        public async Task<ActionResult<ProductDto>> PostProduct([FromForm] CreateProductDto createDto)
        {
            var category = await _context.Categories.FindAsync(createDto.CategoryId);
            if (category == null) return BadRequest("Category not found");

            var product = new Product
            {
                Name = createDto.Name,
                Price = createDto.Price,
                Description = createDto.Description,
                CategoryId = createDto.CategoryId,
                Specifications = createDto.Specifications
            };

            // --- ЛОГІКА ЗБЕРЕЖЕННЯ ФАЙЛІВ ---
            if (createDto.Images != null)
            {
                foreach (var file in createDto.Images)
                {
                    // 1. Перевірка на розмір (наприклад, до 5МБ)
                    if (file.Length > 0)
                    {
                        // 2. Генеруємо унікальне ім'я (щоб не перезаписати існуючі файли)
                        // Було: "my-photo.jpg" -> Стало: "a1b2c3d4-my-photo.jpg"
                        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);

                        // 3. Шлях до папки wwwroot/images
                        var uploadsFolder = Path.Combine(_env.WebRootPath, "images");

                        // Якщо папки немає — створюємо
                        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                        var filePath = Path.Combine(uploadsFolder, fileName);

                        // 4. Зберігаємо файл на диск
                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // 5. Додаємо запис в базу даних (URL)
                        // /images/файл.jpg
                        product.Images.Add(new ProductImage { Url = $"/images/{fileName}" });
                    }
                }
            }
            // ---------------------------------

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Повертаємо результат
            var resultDto = new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                CategoryId = product.CategoryId,
                CategoryName = category.Name,
                ImageUrls = product.Images.Select(i => i.Url).ToList()
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