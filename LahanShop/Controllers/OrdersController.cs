using LahanShop.Data;
using LahanShop.DTOs;
using LahanShop.Models;
using LahanShop.Services.Email;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace LahanShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IEmailService _emailService;
        private readonly IConfiguration _config;

        public OrdersController(AppDbContext context, IConfiguration config, IEmailService emailService)
        {
            _context = context;
            _config = config;
            _emailService = emailService;
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

            // Дістаємо Email клієнта з його токена авторизації
            string userEmail = User.FindFirstValue(ClaimTypes.Email);

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

            // Створюємо список спеціально для таблиці в листі (щоб зберегти назви товарів)
            var emailItems = new List<(string ProductName, int Quantity, decimal Price)>();

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

                // Зберігаємо дані для поштового повідомлення
                emailItems.Add((product.Name, itemDto.Quantity, product.Price));
            }

            order.TotalAmount = total;

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            
            if (!string.IsNullOrEmpty(userEmail))
            {
                _ = SendOrderNotificationsAsync(order, emailItems, userEmail);
            }

            return Ok(new { Message = "Замовлення успішно створено!", OrderId = order.Id });
        }
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<IEnumerable<OrderDto>>> GetOrders()
        {
            string userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            var orders = await _context.Orders
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images.OrderBy(i => i.SortOrder))
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
                CustomerPhone=o.PhoneNumber,
                CustomerName=o.ContactName,

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
        public async Task<ActionResult<PagedResult<OrderDto>>> GetAllOrders(
            [FromQuery] int pageNumber = 1,
            [FromQuery] int pageSize = 10)
        {
            var query =  _context.Orders
                .Include(o => o.User) // 1. Обов'язково підтягуємо дані користувача з БД
                .Include(o => o.Items)
                    .ThenInclude(oi => oi.Product)
                        .ThenInclude(p => p.Images.OrderBy(i => i.SortOrder));            

            var totalCount = await query.CountAsync();
            
            var totalPages = (int)Math.Ceiling(totalCount / (double)pageSize);

            
            var orders = await query
                .OrderByDescending(o => o.OrderDate)
                .Skip((pageNumber - 1) * pageSize)
                .Take(pageSize)
                .ToListAsync();

            var ordersDtos = orders.Select(o => new OrderDto
            {
                Id = o.Id,
                OrderDate = o.OrderDate,
                TotalAmount = o.TotalAmount,
                Status = o.Status.ToString(),
                Address = o.Address,                
                // 2. Мапимо дані клієнта (з перевіркою на null)
                CustomerName = o.ContactName ?? "Невідомий клієнт",                
                CustomerPhone = o.PhoneNumber ?? "Не вказано",

                Items = o.Items.Select(i => new OrderItemDto
                {
                    ProductId = i.ProductId,
                    ProductName = i.Product?.Name ?? "Товар видалено",
                    Quantity = i.Quantity,
                    Price = i.Price,
                    ImageUrl = i.Product?.Images?.FirstOrDefault()?.Url
                }).ToList()
            }).ToList(); ;

            var result = new PagedResult<OrderDto>
            {
                Items = ordersDtos,
                TotalCount = totalCount,
                TotalPages = totalPages,
                CurrentPage = pageNumber,
                PageSize = pageSize
            };

            return Ok(result);
        }

        //[HttpGet("{id}")]
        //[Authorize(Roles = "Admin")]


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
        [HttpPut("{id}/cancel")]
        [Authorize]
        public async Task<IActionResult> CancelStatus(int id)
        {
            // 1. Обов'язково підтягуємо позиції замовлення (Items), щоб знати, ЩО повертати на склад
            var order = await _context.Orders
                .Include(o => o.Items)
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null) return NotFound("Замовлення не знайдено");

            // 2. Блокуємо нелогічні дії
            if (order.Status == OrderStatus.Cancelled)
                return BadRequest("Це замовлення вже було скасоване раніше");

            if (order.Status == OrderStatus.Shipped)
                return BadRequest("Не можна скасувати вже доставлене замовлення");
            
            foreach (var item in order.Items)
            {
                var product = await _context.Products.FindAsync(item.ProductId);
                if (product != null)
                {
                    product.StockQuantity += item.Quantity; 
                }
            }
           
            order.Status = OrderStatus.Cancelled;
           
            await _context.SaveChangesAsync();

            return Ok(new
            {
                Message = "Замовлення скасовано, залишки товарів відновлено на складі",
                Status = order.Status.ToString()
            });
        }

        private async Task SendOrderNotificationsAsync(Order order, List<(string ProductName, int Quantity, decimal Price)> emailItems, string customerEmail)
        {
            try
            {
                // 1. Генеруємо HTML-таблицю з купленими товарами
                var tableBuilder = new StringBuilder();
                tableBuilder.Append("<table style='width: 100%; max-width: 600px; border-collapse: collapse; font-family: Arial, sans-serif; margin-top: 20px;'>");
                tableBuilder.Append("<thead><tr style='background-color: #f3f4f6; text-align: left;'>");
                tableBuilder.Append("<th style='padding: 12px; border: 1px solid #e5e7eb;'>Назва товару</th>");
                tableBuilder.Append("<th style='padding: 12px; border: 1px solid #e5e7eb; text-align: center;'>К-сть</th>");
                tableBuilder.Append("<th style='padding: 12px; border: 1px solid #e5e7eb; text-align: right;'>Ціна</th>");
                tableBuilder.Append("<th style='padding: 12px; border: 1px solid #e5e7eb; text-align: right;'>Сума</th>");
                tableBuilder.Append("</tr></thead><tbody>");

                foreach (var item in emailItems)
                {
                    decimal itemTotal = item.Price * item.Quantity;
                    tableBuilder.Append("<tr>");
                    tableBuilder.Append($"<td style='padding: 12px; border: 1px solid #e5e7eb;'>{item.ProductName}</td>");
                    tableBuilder.Append($"<td style='padding: 12px; border: 1px solid #e5e7eb; text-align: center;'>{item.Quantity} шт.</td>");
                    tableBuilder.Append($"<td style='padding: 12px; border: 1px solid #e5e7eb; text-align: right;'>{item.Price} грн</td>");
                    tableBuilder.Append($"<td style='padding: 12px; border: 1px solid #e5e7eb; text-align: right;'><b>{itemTotal} грн</b></td>");
                    tableBuilder.Append("</tr>");
                }

                tableBuilder.Append("</tbody><tfoot><tr>");
                tableBuilder.Append($"<td colspan='3' style='padding: 12px; text-align: right; border: 1px solid #e5e7eb;'><b>Загальна сума до сплати:</b></td>");
                tableBuilder.Append($"<td style='padding: 12px; border: 1px solid #e5e7eb; text-align: right; color: #dc2626; font-size: 16px;'><b>{order.TotalAmount} грн</b></td>");
                tableBuilder.Append("</tr></tfoot></table>");

                string orderTableHtml = tableBuilder.ToString();

                // 2. Формуємо лист для КЛІЄНТА
                string clientSubject = $"Замовлення #{order.Id} прийнято | Авторозбірка Стадники";
                string clientMessage = $@"
                <div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
                    <h2 style='color: #1f2937;'>Дякуємо за ваше замовлення!</h2>
                    <p>Вітаємо, <b>{order.ContactName}</b>! Ваше замовлення <b>#{order.Id}</b> успішно оформлено і передано в обробку.</p>
                    <p>Наш менеджер зателефонує вам на номер <b>{order.PhoneNumber}</b> для підтвердження деталей відправки на адресу: <i>{order.Address}</i>.</p>
                    
                    <h3 style='margin-top: 30px; border-bottom: 2px solid #e5e7eb; padding-bottom: 5px;'>Ваше замовлення:</h3>
                    {orderTableHtml}

                    <p style='margin-top: 30px; font-size: 14px; color: #6b7280;'>
                        З повагою,<br>
                        Команда Авторозбірки Стадники
                    </p>
                </div>";

                // 3. Формуємо лист для АДМІНІСТРАТОРА
                string adminSubject = $"🚨 НОВЕ ЗАМОВЛЕННЯ #{order.Id} на суму {order.TotalAmount} грн";
                string adminMessage = $@"
                <div style='font-family: Arial, sans-serif; color: #333; line-height: 1.6;'>
                    <h2 style='color: #dc2626;'>🔥 Увага! Нове замовлення на сайті!</h2>
                    
                    <div style='background-color: #f9fafb; padding: 15px; border-left: 4px solid #3b82f6; margin-bottom: 20px;'>
                        <p style='margin: 0 0 10px 0;'><b>Номер замовлення:</b> #{order.Id}</p>
                        <p style='margin: 0 0 10px 0;'><b>Клієнт:</b> {order.ContactName}</p>
                        <p style='margin: 0 0 10px 0;'><b>Телефон:</b> <a href='tel:{order.PhoneNumber}'>{order.PhoneNumber}</a></p>
                        <p style='margin: 0 0 10px 0;'><b>Email:</b> <a href='mailto:{customerEmail}'>{customerEmail}</a></p>
                        <p style='margin: 0;'><b>Адреса доставки:</b> {order.Address}</p>
                    </div>

                    <h3>Що замовили:</h3>
                    {orderTableHtml}
                </div>";

                // 4. Відправляємо листи
                var adminEmail = _config["EmailConfiguration:SenderEmail"];

                await _emailService.SendEmailAsync(customerEmail, clientSubject, clientMessage);
                await _emailService.SendEmailAsync(adminEmail, adminSubject, adminMessage);
            }
            catch (Exception ex)
            {
                // Логуємо помилку відправки, щоб замовлення не "впало" через збій пошти
                Console.WriteLine($"[EMAIL ERROR]: Помилка відправки листів для замовлення #{order.Id}. Деталі: {ex.Message}");
            }
        }
    }


}