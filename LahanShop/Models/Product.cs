using System.ComponentModel.DataAnnotations.Schema;
namespace LahanShop.Models
{
    public class Product
    {
        public int Id { get; set; } // Унікальний номер (ключ)

        public string Name { get; set; } = string.Empty; // Назва товару

        public string Description { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")] // Вказуємо точність для ціни (важливо для грошей!)
        public decimal Price { get; set; }

        public string Category { get; set; } = string.Empty; // Поки просто текстом, пізніше зробимо зв'язок
    }
}
