using System.ComponentModel.DataAnnotations;

namespace LahanShop.DTOs
{
    public class UpdateCategoryDto
    {
        [Required]
        public string Name { get; set; } = string.Empty;

        // Ми можемо захотіти перемістити категорію в іншу гілку
        public int? ParentId { get; set; }
    }
}
