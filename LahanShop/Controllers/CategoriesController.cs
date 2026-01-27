using LahanShop.Data;
using LahanShop.DTOs;
using Microsoft.AspNetCore.Mvc;

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
    }
}
