using System.ComponentModel.DataAnnotations.Schema;
namespace LahanShop.Models
{
    public class Product
    {
        public int Id { get; set; } 

        public string Name { get; set; } = string.Empty; 

        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")] 
        public decimal Price { get; set; }

        public string? Specifications { get; set; }

        public int CategoryId { get; set; }
        public Category? Category { get; set; }
        public List<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}
