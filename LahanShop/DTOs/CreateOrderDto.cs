using System.ComponentModel.DataAnnotations;

namespace LahanShop.DTOs
{
    // Головна коробка замовлення
    public class CreateOrderDto
    {
        [Required]
        public string ContactName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        public string CustomerAddress { get; set; } = string.Empty;

        [MinLength(1, ErrorMessage = "Кошик не може бути порожнім")]
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    }

    
    public class CartItemDto
    {
        public int ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "Кількість має бути більше 0")]
        public int Quantity { get; set; }
    }

    public class OrderDto
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public string Status { get; set; } = string.Empty; 
        public decimal TotalAmount { get; set; }
        public string Address { get; set; } = string.Empty;
        public string CustomerName { get; set; }        
        public string CustomerPhone { get; set; }
        public List<OrderItemDto> Items { get; set; } = new List<OrderItemDto>();
    }

    public class OrderItemDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = string.Empty; // Важливо зберегти назву
        public int Quantity { get; set; }
        public decimal Price { get; set; } // Ціна на момент покупки
        public string? ImageUrl { get; set; }
    }

    public class UpdateStatusDto
    {
        public string Status { get; set; } = string.Empty;
    }
}