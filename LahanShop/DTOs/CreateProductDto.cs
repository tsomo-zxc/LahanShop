using System.ComponentModel.DataAnnotations; 

namespace LahanShop.DTOs
{
    public class CreateProductDto
    {
        [Required(ErrorMessage = "Вкажіть назву товару")]
        [MaxLength(100)]
        public string Name { get; set; } = string.Empty;

        [Range(1, 1000000, ErrorMessage = "Ціна має бути від 1 до 1 млн")]
        public decimal Price { get; set; }

        public string Description { get; set; } = string.Empty;

        [Required]
        public int CategoryId { get; set; }

        // Поле для JSON (користувач пришле рядок: '{"Color": "Red"}')
        public string? Specifications { get; set; }

        // --- СЮДИ ПРИЛЕТЯТЬ ФАЙЛИ ---
        public List<IFormFile>? Images { get; set; }
    }
}