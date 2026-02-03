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
            // 1. Початковий запит
            var query = _context.Products
                .Include(p => p.Category)
                .Include(p => p.Images)
                .AsQueryable();

            // ---------------------------------------------------------
            // ФІЛЬТРАЦІЯ ПО КАТЕГОРІЇ (З рекурсією)
            // ---------------------------------------------------------
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

            // ---------------------------------------------------------
            // РІВЕНЬ 1: РОЗУМНА ФІЛЬТРАЦІЯ (SQL)
            // ---------------------------------------------------------
            string[]? searchTerms = null;

            if (!string.IsNullOrWhiteSpace(searchTerm))
            {
                // Розбиваємо "Asus Laptop" на ["asus", "laptop"]
                // Trim() і ToLower() робимо для чистоти
                var normalizedSearch = searchTerm.Trim().ToLower();
                searchTerms = normalizedSearch.Split(' ', StringSplitOptions.RemoveEmptyEntries);

                // Товар повинен містити КОЖНЕ слово із запиту (логіка AND)
                foreach (var term in searchTerms)
                {
                    query = query.Where(p =>
                        p.Name.ToLower().Contains(term) ||
                        p.Description.ToLower().Contains(term) ||
                        (p.Specifications != null && p.Specifications.ToLower().Contains(term))
                    );
                }
            }

            // Рахуємо загальну кількість знайдених товарів (для пагінації)
            var totalCount = await query.CountAsync();

            // ---------------------------------------------------------
            // РІВЕНЬ 2: РАНЖУВАННЯ (In-Memory)
            // ---------------------------------------------------------
            List<Product> products;

            if (!string.IsNullOrWhiteSpace(searchTerm) && searchTerms != null)
            {
                // Якщо є пошук — витягуємо знайдені товари в пам'ять для сортування
                // (Примітка: якщо товарів 100 тисяч, тут треба оптимізацію, але для магазину < 5000 це ок)
                var rawProducts = await query.ToListAsync();

                products = rawProducts
                    .Select(p => new
                    {
                        Product = p,
                        Score = CalculateRelevanceScore(p, searchTerms) // Нараховуємо бали
                    })
                    .OrderByDescending(x => x.Score) // Найкращі зверху
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .Select(x => x.Product)
                    .ToList();
            }
            else
            {
                // Якщо пошуку немає — звичайне сортування (швидше, бо на рівні бази)
                products = await query
                    .OrderByDescending(p => p.Id) // Спочатку нові
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();
            }

            // ---------------------------------------------------------
            // ФОРМУВАННЯ ВІДПОВІДІ (DTO)
            // ---------------------------------------------------------
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
        public async Task<ActionResult<ProductDto>> PostProduct([FromBody] CreateProductDto createDto)
        {
            var category = await _context.Categories.FindAsync(createDto.CategoryId);
            if (category == null) return BadRequest("Category not found");

            var product = new Product
            {
                Name = createDto.Name,
                Price = createDto.Price,
                Description = createDto.Description,
                CategoryId = createDto.CategoryId,
                Specifications = createDto.Specifications,
                StockQuantity = createDto.StockQuantity
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
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto dto)
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