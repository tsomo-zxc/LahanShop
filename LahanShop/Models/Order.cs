using System.ComponentModel.DataAnnotations.Schema;

namespace LahanShop.Models
{
    public class Order
    {
        public int Id { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow; // Дата створення

        // Інформація про клієнта (поки що просто текстом)
        public string CustomerName { get; set; } = string.Empty;
        public string CustomerPhone { get; set; } = string.Empty;
        public string CustomerAddress { get; set; } = string.Empty;

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } // Загальна сума

        // Список рядків у цьому чеку
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}