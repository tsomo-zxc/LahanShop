using Microsoft.AspNetCore.Identity;

namespace LahanShop.Models
{
    public class User : IdentityUser
    {
         // Можемо додати свої поля
            public string FullName { get; set; } = string.Empty;
        
    }
}
