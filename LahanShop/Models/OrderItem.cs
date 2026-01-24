using System.ComponentModel.DataAnnotations.Schema;

namespace LahanShop.Models
{
    public class OrderItem
    {
        public int Id { get; set; }

        // Зв'язок з Товаром
        public int ProductId { get; set; }
        public Product? Product { get; set; }

        public int Quantity { get; set; } // Кількість

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; } // Ціна на момент покупки!

        // Зв'язок з Замовленням (Зворотній зв'язок)
        public int OrderId { get; set; }
        public Order? Order { get; set; }
    }
}