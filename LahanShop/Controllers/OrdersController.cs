using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using LahanShop.Data;
using LahanShop.Models;
using LahanShop.DTOs;

namespace LahanShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public OrdersController(AppDbContext context)
        {
            _context = context;
        }

        // POST: api/orders
        [HttpPost]
        public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
        {
            // 1. Створюємо "шапку" замовлення
            var order = new Order
            {
                CustomerName = dto.CustomerName,
                CustomerPhone = dto.CustomerPhone,
                CustomerAddress = dto.CustomerAddress,
                OrderDate = DateTime.UtcNow,
                TotalAmount = 0 // Порахуємо нижче
            };

            decimal total = 0;

            // 2. Проходимось по кожному товару, який замовив клієнт
            foreach (var itemDto in dto.Items)
            {
                // Шукаємо товар в базі, щоб дізнатися АКТУАЛЬНУ ціну
                var product = await _context.Products.FindAsync(itemDto.ProductId);

                if (product == null)
                {
                    return BadRequest($"Товар з ID {itemDto.ProductId} не знайдено.");
                }

                // Створюємо рядок замовлення
                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = itemDto.Quantity,
                    Price = product.Price, // Беремо ціну з БАЗИ, а не від клієнта!
                    Order = order // Прив'язуємо до головного замовлення
                };

                // Додаємо в список замовлення
                order.Items.Add(orderItem);

                // Додаємо до загальної суми
                total += orderItem.Price * orderItem.Quantity;
            }

            // 3. Записуємо фінальну суму
            order.TotalAmount = total;

            // 4. Зберігаємо все в базу одним махом
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Замовлення успішно створено!", OrderId = order.Id });
        }
    }
}