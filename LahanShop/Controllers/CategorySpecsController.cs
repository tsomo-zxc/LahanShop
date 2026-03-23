using LahanShop.Data;
using LahanShop.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace LahanShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategorySpecsController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategorySpecsController(AppDbContext context)
        {
            _context = context;
        }

        // GET: api/categoryspecs
        [HttpGet]
        public async Task<ActionResult<IEnumerable<CategorySpecificationDto>>> GetSpecifications()
        {
            var Spec = await _context.CategorySpecifications
                .Include(c => c.Category)
                .ToListAsync();
            var SpecDto = Spec.Select(c => new CategorySpecificationDto
            {
                Id=c.Id,
                Name=c.Name,
                CategoryId=c.CategoryId
            }).ToList();

            return Ok(SpecDto);

        }
        // GET: api/categoryspecs/category/id
        [HttpGet("category/{categoryId}")]
        public async Task<ActionResult<IEnumerable<CategorySpecificationDto>>> GetSpecsByCategory(int categoryId)
        {
            var specs = await _context.CategorySpecifications
                .Where(x => x.CategoryId == categoryId) 
                .ToListAsync();

            var specDtos = specs.Select(s => new CategorySpecificationDto
            {
                Id = s.Id,
                Name = s.Name,
                CategoryId = s.CategoryId
            }).ToList();

            return Ok(specDtos);
        }
        // GET: api/categoryspecs/id
        [HttpGet("{id}")]
        public async Task<ActionResult<CategorySpecificationDto>> GetSpecification (int id)
        {
            var Spec= await _context.CategorySpecifications
                .Include(c =>c.Category)
                .FirstOrDefaultAsync( c => c.Id == id );

            if (Spec == null) return NotFound();
            return new CategorySpecificationDto
            {
                Id = Spec.Id,
                Name = Spec.Name,
                CategoryId = Spec.CategoryId
            };

        }

        // POST: api/categoryspecs
        [HttpPost]
        public async Task<ActionResult<Models.CategorySpecification>> CreateCategorySpec([FromBody] UpdateCategorySpecDto spec)
        {
            var Spec = new Models.CategorySpecification
            {
                Name = spec.Name,
                CategoryId = spec.CategoryId
            };
            _context.CategorySpecifications.Add(Spec);
            await _context.SaveChangesAsync();
            return CreatedAtAction(nameof(GetSpecification), new { id = Spec.Id }, Spec);

        }

        // PUT: api/categoryspecs/id
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateCategorySpec(int id, [FromBody] UpdateCategorySpecDto spec)
        {
            var Spec = await _context.CategorySpecifications.FindAsync(id);
            if (Spec == null) return NotFound();

            Spec.Name = spec.Name;
            Spec.CategoryId = spec.CategoryId;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (Exception)
            {
                return BadRequest("Помилка при оновленні. Перевірте CategoryId.");
            }
            return Ok(new { Message = "Характеристику оновлено" });
        }

        // DELETE: api/categoryspecs/id
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCategorySpecification(int id)
        {
            var Spec= await _context.CategorySpecifications.FindAsync(id);

            if (Spec == null) return NotFound();

            _context.CategorySpecifications.Remove(Spec);
            await _context.SaveChangesAsync();

            return NoContent();

        }
    }
}
