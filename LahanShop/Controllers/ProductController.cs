using LahanShop.Data;   
using LahanShop.DTOs;
using LahanShop.Models; 
using LahanShop.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LahanShop.Controllers
{
    // [Route] вказує адресу: api/products
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly IImageService _imageService;

        // Конструктор: тут ми отримуємо доступ до бази даних (Dependency Injection)
        public ProductsController(AppDbContext context, IWebHostEnvironment env, IImageService imageService)
        {
            _context = context;
            _env = env;
            _imageService = imageService;
        }
        private int CalculateRelevanceScore(Product p, string[] terms)
        {
            int score = 0;
            string nameLower = p.Name.ToLower();
            string descLower = p.Description?.ToLower() ?? "";
            string categoryLower = p.Category?.Name?.ToLower() ?? "";

            foreach (var term in terms)
            {
                // 1. Точне співпадіння в назві — ДЖЕКПОТ (наприклад, шукали "S24" і в назві є "S24")
                // Ми додаємо пробіли, щоб не плутати "apple" і "pineapple"
                if (nameLower.Contains(" " + term + " ") || nameLower.StartsWith(term + " ") || nameLower.EndsWith(" " + term) || nameLower == term)
                {
                    score += 50;
                }
                // 2. Часткове співпадіння в назві
                else if (nameLower.Contains(term))
                {
                    score += 20;
                }

                // 3. Співпадіння в категорії
                if (categoryLower.Contains(term))
                {
                    score += 15;
                }

                // 4. Співпадіння в описі (вага найменша)
                if (descLower.Contains(term))
                {
                    score += 5;
                }
            }

            return score;
        }

        // GET: api/products
        [HttpGet]
        public async Task<ActionResult<PagedResult<ProductDto>>> GetProducts(
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 10,
            [FromQuery] string? searchTerm = null,
            [FromQuery] int? categoryId = null)
        {
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .AsQueryable();

            // 1. Фільтрація по категорії
            if (categoryId.HasValue)
            {
                var allCategories = await _context.Categories
                    .Select(c => new { c.Id, c.ParentId })
                    .ToListAsync();

                var categoryIdsToSearch = new List<int>();

                void AddCategoryAndChildren(int parentId)
                {
                    categoryIdsToSearch.Add(parentId);
                    var children = allCategories.Where(c => c.ParentId == parentId);
                    foreach (var child in children) AddCategoryAndChildren(child.Id);
                }

                AddCategoryAndChildren(categoryId.Value);
                query = query.Where(p => categoryIdsToSearch.Contains(p.CategoryId));
            }

            // 2. Фільтрація по тексту (SQL частина)
            string[]? searchTerms = null;
            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                var normalizedSearch = searchTerm.Trim().ToLower();
                searchTerms = normalizedSearch.Split(' ', StringSplitOptions.RemoveEmptyEntries);

                foreach (var term in searchTerms)
                {
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(term) ||
                        p.Description.ToLower().Contains(term) ||
                        (p.Specifications != null && p.Specifications.ToLower().Contains(term))
                    );
                }
            }

            var totalCount = await query.CountAsync();
            List<Product> products;

            // 3. СОРТУВАННЯ
            if (!string.IsNullOrWhiteSpace(searchTerm) && searchTerms != null)
            {
                // --- ЯКЩО Є ПОШУК ---
                var rawProducts = await query.ToListAsync();

                products = rawProducts
                    .Select(p => new
                    {
                        Product = p,
                        Score = CalculateRelevanceScore(p, searchTerms)
                    })
                    // 👇 СПОЧАТКУ ТІ, ЩО В НАЯВНОСТІ
                    .OrderByDescending(x => x.Product.StockQuantity > 0)
                    // ПОТІМ НАЙБІЛЬШ РЕЛЕВАНТНІ
                    .ThenByDescending(x => x.Score)
                    // ПОТІМ НОВІШІ
                    .ThenByDescending(x => x.Product.Id)

                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => x.Product)
                    .ToList();
            }
            else
            {
                // --- ЯКЩО ПРОСТО ПЕРЕГЛЯД (БЕЗ ПОШУКУ) ---
                products = await query
                    // 👇 ГОЛОВНА ЗМІНА ТУТ:
                    .OrderByDescending(p => p.StockQuantity > 0) // Спочатку True (в наявності), потім False
                    .ThenByDescending(p => p.Id) // Всередині груп - спочатку нові

                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }

            // 4. Формування DTO (без змін)
            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                Description = p.Description,
                CategoryId = p.CategoryId,
                CategoryName = p.Category?.Name ?? "Без категорії",
                StockQuantity = p.StockQuantity,
                Specifications = p.Specifications,
                Images = p.Images.Select(img => new ProductImageDto
                {
                    Id = img.Id,
                    Url = img.Url
                }).ToList()
            }).ToList();

            var result = new PagedResult<ProductDto>
            {
                Items = productDtos,
                TotalCount = totalCount,
                PageSize = pageSize,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(result);
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
        // GET: api/categories/5/path        
        [HttpGet("path/{id}")]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategoryPath(int id)
        {
            var path = new List<CategoryDto>();
            var currentId = (int?)id;

            // Цикл: піднімаємось вгору, поки є ParentId
            while (currentId.HasValue)
            {
                var category = await _context.Categories
                    .Include(c => c.Parent) // Підтягуємо інфо про батька
                    .FirstOrDefaultAsync(c => c.Id == currentId);

                if (category == null) break;

                // Додаємо в ПОЧАТОК списку (бо ми йдемо з кінця)
                path.Insert(0, new CategoryDto
                {
                    Id = category.Id,
                    Name = category.Name,
                    ParentId = category.ParentId,
                    ParentName = category.Parent?.Name
                });

                // Переходимо на рівень вище
                currentId = category.ParentId;
            }

            return Ok(path);
        }

        // POST: api/products
        [HttpPost]
        public async Task<ActionResult<ProductDto>> PostProduct([FromForm] CreateProductDto createDto) // ЗМІНЕНО НА [FromForm]
        {
            var category = await _context.Categories.FindAsync(createDto.CategoryId);
            if (category == null) return BadRequest("Категорію не знайдено");

            var product = new Product
            {
                Name = createDto.Name,
                Price = createDto.Price,
                Description = createDto.Description,
                CategoryId = createDto.CategoryId,
                Specifications = createDto.Specifications,
                StockQuantity = createDto.StockQuantity,
                Images = new List<ProductImage>() // Ініціалізуємо список, щоб уникнути помилок
            };

            // --- ХМАРНА ЛОГІКА ЗБЕРЕЖЕННЯ ФАЙЛІВ ---
            if (createDto.Images != null && createDto.Images.Any())
            {
                foreach (var file in createDto.Images)
                {
                    if (file.Length > 0)
                    {
                        // Викликаємо наш новий сервіс. Він сам обріже фото, конвертує у WebP і закине в Azure
                        var imageUrl = await _imageService.UploadImageAsync(file);

                        // Якщо завантаження пройшло успішно і ми отримали посилання
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            // Додаємо пряме посилання з Azure в базу даних
                            product.Images.Add(new ProductImage { Url = imageUrl });
                        }
                    }
                }
            }
            // ---------------------------------------

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            // Формуємо відповідь для фронтенду
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

            return CreatedAtAction(nameof(PostProduct), new { id = product.Id }, resultDto);
        }

        // DELETE: api/products/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            // Обов'язково завантажуємо товар РАЗОМ із його картинками (.Include)
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null)
            {
                return NotFound();
            }

            // 1. Видаляємо всі фізичні файли з Azure
            foreach (var image in product.Images)
            {
                await _imageService.DeleteImageAsync(image.Url);
            }

            // 2. Видаляємо запис з бази даних (Entity Framework сам видалить записи з таблиці ProductImages завдяки каскадному видаленню)
            _context.Products.Remove(product);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // PUT: api/products/5
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] CreateProductDto dto) // ЗМІНЕНО НА [FromForm]
        {
            var product = await _context.Products
                .Include(p => p.Images)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product == null) return NotFound("Товар не знайдено");

            var category = await _context.Categories.FindAsync(dto.CategoryId);
            if (category == null) return BadRequest("Такої категорії не існує");

            product.Name = dto.Name;
            product.Price = dto.Price;
            product.Description = dto.Description;
            product.CategoryId = dto.CategoryId;
            product.StockQuantity = dto.StockQuantity;
            product.Specifications = dto.Specifications;

            // --- ХМАРНА ЛОГІКА ДОДАВАННЯ НОВИХ КАРТИНОК ---
            if (dto.Images != null && dto.Images.Any())
            {
                foreach (var file in dto.Images)
                {
                    if (file.Length > 0)
                    {
                        var imageUrl = await _imageService.UploadImageAsync(file);

                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            product.Images.Add(new ProductImage { Url = imageUrl });
                        }
                    }
                }
            }

            await _context.SaveChangesAsync();

            return Ok(new { Message = "Товар оновлено успішно!" });
        }

        // DELETE: api/products/images/5
        [HttpDelete("images/{imageId}")]
        public async Task<IActionResult> DeleteProductImage(int imageId)
        {
            var image = await _context.ProductImages.FindAsync(imageId);
            if (image == null) return NotFound("Картинку не знайдено");

            // 1. Видаляємо фізичний файл з Azure Blob Storage
            await _imageService.DeleteImageAsync(image.Url);

            // 2. Видаляємо запис з бази даних
            _context.ProductImages.Remove(image);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Фото успішно видалено" });
        }

        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<PagedResult<ProductDto>>> GetProductsByCategory(
            int categoryId,
            [FromQuery] int page = 1,
            [FromQuery] int pageSize = 24)
        {
            // --- КРОК 1: Отримуємо ВСІ категорії (це швидко, бо тягнемо тільки ID) ---
            // Нам треба знати структуру всього дерева, щоб знайти всіх "онуків"
            var allCategories = await _context.Categories
                .Select(c => new { c.Id, c.ParentId })
                .ToListAsync();

            // --- КРОК 2: Рекурсивно збираємо ID потрібних категорій ---
            var categoryIdsToSearch = new List<int>();

            // Локальна функція для рекурсії
            void AddCategoryAndChildren(int parentId)
            {
                // Додаємо саму категорію
                categoryIdsToSearch.Add(parentId);

                // Знаходимо дітей
                var children = allCategories.Where(c => c.ParentId == parentId);

                // Для кожної дитини запускаємо цю ж функцію (шукаємо її дітей)
                foreach (var child in children)
                {
                    AddCategoryAndChildren(child.Id);
                }
            }

            // Запускаємо процес з вибраної користувачем категорії
            AddCategoryAndChildren(categoryId);

            // Тепер у categoryIdsToSearch є ID: [Електроніка, Ноутбуки, Apple, MacBook...]

            // --- КРОК 3: Запит до товарів (без змін) ---
            var query = _context.Products
                .Include(p => p.Category)
                .Where(p => categoryIdsToSearch.Contains(p.CategoryId)); // <--- Шукаємо по повному списку

            // --- КРОК 4: Пагінація та Відповідь (без змін) ---
            var totalCount = await query.CountAsync();

            var products = await query
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var productDtos = products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Description = p.Description,
                Price = p.Price,
                StockQuantity = p.StockQuantity,
                CategoryName = p.Category?.Name,
                Images = p.Images.Select(i => new ProductImageDto { Id = i.Id, Url = i.Url }).ToList()
            }).ToList();

            var result = new PagedResult<ProductDto>
            {
                Items = productDtos,
                TotalCount = totalCount,
                PageSize = pageSize,
                CurrentPage = page,
                TotalPages = (int)Math.Ceiling(totalCount / (double)pageSize)
            };

            return Ok(result);
        }
    }
}