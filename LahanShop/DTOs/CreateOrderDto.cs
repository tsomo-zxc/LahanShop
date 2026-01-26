using System.ComponentModel.DataAnnotations;

namespace LahanShop.DTOs
{
    // Головна коробка замовлення
    public class CreateOrderDto
    {
        [Required]
        public string CustomerName { get; set; } = string.Empty;

        [Required]
        [Phone]
        public string CustomerPhone { get; set; } = string.Empty;

        [Required]
        public string CustomerAddress { get; set; } = string.Empty;
                
        public List<CartItemDto> Items { get; set; } = new List<CartItemDto>();
    }

    
    public class CartItemDto
    {
        public int ProductId { get; set; }

        [Range(1, 100, ErrorMessage = "Кількість має бути більше 0")]
        public int Quantity { get; set; }
    }
}