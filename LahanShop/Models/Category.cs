using System.Text.Json.Serialization;

namespace LahanShop.Models
{
    public class Category
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
               
        public int? ParentId { get; set; }

        [JsonIgnore] 
        public Category? Parent { get; set; }
               
        public List<Category> SubCategories { get; set; } = new List<Category>();
                
        [JsonIgnore]
        public List<Product> Products { get; set; } = new List<Product>();
        public List<CategorySpecification> Specifications { get; set; } = new();
    }
}