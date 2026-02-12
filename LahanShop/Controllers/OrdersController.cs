using LahanShop.Data;
using LahanShop.DTOs;
using LahanShop.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;

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
        // GET: api/orders/count-new
        [HttpGet("count-new")]
        [Authorize(Roles = "Admin")] // Тільки для адміна
        public async Task<ActionResult<int>> GetNewOrdersCount()
        {
            // Рахуємо скільки замовлень мають статус 'New' (0)
            var count = await _context.Orders.CountAsync(o => o.Status == OrderStatus.New);
            return Ok(count);
        }
        // POST: api/orders
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder(CreateOrderDto dto)
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (userId == null) return Unauthorized("Користувача не знайдено");

            // 1. Створюємо "шапку" замовлення
            var order = new Order
            {
                UserId = userId,
                OrderDate = DateTime.UtcNow,
                TotalAmount = 0,
                Status = OrderStatus.New,
                Address = dto.CustomerAddress,
                PhoneNumber = dto.PhoneNumber,
                ContactName = dto.ContactName,
                Items = new List<OrderItem>()

            };

            decimal total = 0;

            foreach (var itemDto in dto.Items)
            {

                var product = await _context.Products.FindAsync(itemDto.ProductId);

                if (product == null)
                {
                    return BadRequest($"Товар з ID {itemDto.ProductId} не знайдено.");
                }

                if (product.StockQuantity < itemDto.Quantity)
                {
                    return BadRequest($"Товару '{product.Name}' недостатньо на складі. Доступно: {product.StockQuantity}");
                }
                product.StockQuantity -= itemDto.Quantity;

                // Створюємо рядок замовлення
                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Quantity = itemDto.Quantity,
                    Price = product.Price, // Беремо ціну з БАЗИ, а не від клієнта!                  
                };
                
                order.Items.Add(orderItem);              
                total += orderItem.Price * orderItem.Quantity;
            }

           
            order.TotalAmount = total;

            
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return Ok(new { Message = "Замовлення успішно створено!", OrderId = order.Id });
        }
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders(){
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var orders =await _context.Orders
                .Include(o => o.Items)          
                .ThenInclude(oi => oi.Product)  
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate) 
                .ToListAsync();

            var ordersDtos = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                Address = o.Address,

                Items = o.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "Товар видалено", // Захист від null
                    Quantity = i.Quantity,
                    Price = i.Price,
                    ImageUrl = i.Product?.Images?.FirstOrDefault()?.Url
                }).ToList()
            });


            return Ok(ordersDtos);
            }
        [HttpGet("all")]
        [Authorize(Roles = "Admin")]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetAllOrders()
        {
            var orders = await _context.Orders
                .Include(o => o.Items)
                .ThenInclude(oi => oi.Product)
                .OrderByDescending(o => o.OrderDate) // Спочатку нові
                .ToListAsync();

            // Мапимо в DTO (можна винести в окремий метод, щоб не дублювати код)
            var ordersDtos = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                Address = o.Address,
                Items = o.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "Товар видалено",
                    Quantity = i.Quantity,
                    Price = i.Price,
                    ImageUrl = i.Product?.Images?.FirstOrDefault()?.Url
                }).ToList()
            });

            return Ok(ordersDtos);
        }

        // 2. Змінити статус замовлення
        [HttpPut("{id}/status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] UpdateStatusDto dto)
        {
            var order = await _context.Orders.FindAsync(id);

            if (order == null) return NotFound("Замовлення не знайдено");

            // Спробуємо перетворити рядок (напр. "Shipped") в Enum
            if (Enum.TryParse(dto.Status, out OrderStatus newStatus))
            {
                order.Status = newStatus;
                await _context.SaveChangesAsync();
                return Ok(new { Message = "Статус оновлено", Status = order.Status.ToString() });
            }

            return BadRequest("Невірний статус");
        }
    }
}