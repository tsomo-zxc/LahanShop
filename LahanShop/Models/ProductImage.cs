using System.Text.Json.Serialization;

namespace LahanShop.Models
{
    public class ProductImage
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty; // Наприклад: "/images/laptop1.jpg"

        // Зв'язок з товаром
        public int ProductId { get; set; }

        [JsonIgnore] // Щоб не зациклило
        public Product? Product { get; set; }
    }
}
