
using Microsoft.EntityFrameworkCore;
using LahanShop.Models;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
namespace LahanShop.Data
{    
    public class AppDbContext : IdentityDbContext<User>
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<Product> Products { get; set; }
        public DbSet<Order> Orders { get; set; }
        public DbSet<OrderItem> OrderItems { get; set; }
        public DbSet<Category> Categories { get; set; }
        public DbSet<ProductImage> ProductImages { get; set; }
        public DbSet<CategorySpecification> CategorySpecifications { get; set; }        

    }
}
