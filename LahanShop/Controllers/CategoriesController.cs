using LahanShop.Data;
using LahanShop.DTOs;
using LahanShop.Models; // Не забудьте додати модель
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LahanShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriesController : ControllerBase
    {
        private readonly AppDbContext _context;
        public CategoriesController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/categories (Ваш метод - залишаємо без змін)
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategoryDto>>> GetCategories()
        {
            var categories = await _context.Categories
                .Include(c => c.Products)
                .Include(c => c.Parent)
                .ToListAsync();

            var categoryDtos = categories.Select(c => new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                ProductsCount = c.Products != null ? c.Products.Count : 0,
                ParentId = c.ParentId,
                ParentName = c.Parent?.Name
            }).ToList();

            return Ok(categoryDtos);
        }

        // --- НОВИЙ МЕТОД: Отримання однієї категорії (для форми редагування) ---
        [HttpGet("{id}")]
        public async Task<ActionResult<CategoryDto>> GetCategory(int id)
        {
            var c = await _context.Categories
                .Include(x => x.Parent)
                .Include(x => x.Products)
                .FirstOrDefaultAsync(x => x.Id == id);

            if (c == null) return NotFound();

            return new CategoryDto
            {
                Id = c.Id,
                Name = c.Name,
                ParentId = c.ParentId,
                ParentName = c.Parent?.Name,
                ProductsCount = c.Products?.Count ?? 0
            };
        }

        
        [HttpPost]
        public async Task<ActionResult<Category>> CreateCategory([FromBody] UpdateCategoryDto dto)
        {
            var category = new Category
            {
                Name = dto.Name,
                ParentId = dto.ParentId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetCategory), new { id = category.Id }, category);
        }

        // PUT: api/categories/5
        [HttpPut("{id}")]
        // 👇 ВАЖЛИВО: Додано [FromBody], інакше дані не прийдуть!
        public async Task<IActionResult> UpdateCategory(int id, [FromBody] UpdateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Категорію не знайдено");

            // Захист: категорія не може бути батьком сама собі
            if (dto.ParentId == id)
            {
                return BadRequest("Категорія не може бути батьківською сама для себе.");
            }

            category.Name = dto.Name;
            category.ParentId = dto.ParentId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return BadRequest("Помилка при оновленні. Перевірте ParentId.");
            }

            return Ok(new { Message = "Категорію оновлено" });
        }

        // --- НОВИЙ МЕТОД: Видалення (DELETE) ---
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound();

            // Перевірка: чи є залежні товари або підкатегорії?
            bool hasChildren = await _context.Categories.AnyAsync(c => c.ParentId == id);
            bool hasProducts = await _context.Products.AnyAsync(p => p.CategoryId == id);

            if (hasChildren) return BadRequest("Неможливо видалити: ця категорія має підкатегорії.");
            if (hasProducts) return BadRequest("Неможливо видалити: у цій категорії є товари.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}