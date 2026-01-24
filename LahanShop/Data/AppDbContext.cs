
using Microsoft.EntityFrameworkCore;
using LahanShop.Models;
namespace LahanShop.Data
{
    // Цей клас — головний пункт керування базою даних
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        // Тут ми пізніше додамо таблиці, наприклад:
        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
    }
}
