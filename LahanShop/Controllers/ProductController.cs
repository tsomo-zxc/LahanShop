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
                    StockQuantity = p.StockQuantity,
                    Images = p.Images.Select(img => new ProductImageDto
                    {
                        Id = img.Id,
                        Url = img.Url
                    }).ToList()
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
                StockQuantity = product.StockQuantity,
                Images = product.Images.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    Url = img.Url
                }).ToList()
            };

            return productDto;
        }

        // GET: api/products/category/5
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<ProductDto>>> GetProductsByCategory(int categoryId)
        {
            // Шукаємо товари, де CategoryId співпадає з переданим
            // АБО (якщо хочете показувати товари з підкатегорій) можна ускладнити логіку
            var products = await _context.Products
                .Include(p => p.Category) // Підтягуємо категорію, щоб знати її назву
                .Where(p => p.CategoryId == categoryId)
                .ToListAsync();

            // Перетворюємо в DTO
            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                CategoryName = p.Category?.Name, // Назва категорії
                StockQuantity = p.StockQuantity,
                Images = p.Images.Select(i => new ProductImageDto
                {
                    Id = i.Id,
                    Url = i.Url
                }).ToList()
            }).ToList();

            return Ok(productDtos);
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
                StockQuantity = product.StockQuantity,
                Images = product.Images.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    Url = img.Url
                }).ToList()
            };

            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, resultDto);
        }

        // DELETE: api/products/5
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

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] CreateProductDto dto)
        {
            // 1. Шукаємо товар разом з картинками
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Товар не знайдено");

            // 2. Перевіряємо нову категорію (якщо вона змінилась)
            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null) return BadRequest("Такої категорії не існує");

            // 3. Оновлюємо базові поля
            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.StockQuantity = dto.StockQuantity;
            product.Specifications = dto.Specifications; // Оновлюємо JSON

            // 4. Обробка НОВИХ картинок (додавання до існуючих)
            if (dto.Images != null && dto.Images.Count > 0)
            {
                var uploadsFolder = Path.Combine(_env.WebRootPath, "images");
                if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

                foreach (var file in dto.Images)
                {
                    if (file.Length > 0)
                    {
                        var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
                        var filePath = Path.Combine(uploadsFolder, fileName);

                        using (var stream = new FileStream(filePath, FileMode.Create))
                        {
                            await file.CopyToAsync(stream);
                        }

                        // Додаємо в колекцію
                        product.Images.Add(new ProductImage { Url = $"/images/{fileName}" });
                    }
                }
            }

            // 5. Зберігаємо зміни
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Товар оновлено успішно!" });
        }

        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteProductImage(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null) return NotFound("Картинку не знайдено");

            // 1. Видаляємо файл з диска (опціонально, але бажано для економії місця)
            var filePath = Path.Combine(_env.WebRootPath, image.Url.TrimStart('/'));
            if (System.IO.File.Exists(filePath))
            {
                System.IO.File.Delete(filePath);
            }

            // 2. Видаляємо запис з бази
            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Фото видалено" });
        }
    }
}