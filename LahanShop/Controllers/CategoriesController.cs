using LahanShop.Data;
using LahanShop.DTOs;
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

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategory(int id, UpdateCategoryDto dto)
        {
            var category = await _context.Categories.FindAsync(id);
            if (category == null) return NotFound("Категорію не знайдено");

            // Оновлюємо поля
            category.Name = dto.Name;
            category.ParentId = dto.ParentId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception ex)
            {
                // Це може статися, якщо вказати неіснуючий ParentId
                return BadRequest("Помилка при оновленні. Перевірте ParentId.");
            }

            return Ok(new { Message = "Категорію оновлено" });
        }

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
    }
}
