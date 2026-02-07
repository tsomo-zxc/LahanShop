using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace LahanShop.Models
{
    public class Order
    {
        public int Id { get; set; }

        public DateTime OrderDate { get; set; } = DateTime.UtcNow; // Дата створення

        // Інформація про клієнта (поки що просто текстом)
        public string UserId { get; set; }
        public User? User { get; set; }


        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; } // Загальна сума

        public OrderStatus Status { get; set; }

        [Required]
        [MaxLength(200)]
        public string Address { get; set; }
        [Required]
        [MaxLength(20)]
        public string PhoneNumber {  get; set; }
        [Required]
        [MaxLength(100)]

        public string ContactName {  get; set; }


        // Список рядків у цьому чеку
        public List<OrderItem> Items { get; set; } = new List<OrderItem>();
    }
}