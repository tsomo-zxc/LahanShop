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
        
        public string? Specifications { get; set; }
        public int StockQuantity { get; set; }
        
        public List<IFormFile>? Images { get; set; }
    }
}