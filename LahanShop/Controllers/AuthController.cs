using LahanShop.DTOs;
using LahanShop.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using System.Data;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace LahanShop.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;

        public AuthController(UserManager<User> userManager, IConfiguration configuration)
        {
            _userManager = userManager;
            _configuration = configuration;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var userExists = await _userManager.FindByEmailAsync(dto.Email);
            if (userExists != null)
                return BadRequest("Користувач з таким email вже існує");

            var user = new User
            {
                Email = dto.Email,
                UserName = dto.Email, // В якості логіна використовуємо пошту
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "User");

            return Ok(new { Message = "Користувача створено успішно!" });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            // 1. Шукаємо користувача
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null) return Unauthorized("Невірний email або пароль");

            // 2. Перевіряємо пароль
            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid) return Unauthorized("Невірний email або пароль");

            // 3. Генеруємо токен
            var token = await GenerateJwtToken(user);

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                Email = user.Email!,
                FullName = user.FullName,
                Role = roles.FirstOrDefault() ?? "User"
            });
        }

        private async Task<string> GenerateJwtToken(User user)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id),
                new Claim(JwtRegisteredClaimNames.Email, user.Email!),
                new Claim("FullName", user.FullName)
            };

            var roles = await _userManager.GetRolesAsync(user);

            // Записуємо кожну роль у токен
            foreach (var role in roles)
            {
                claims.Add(new Claim(ClaimTypes.Role, role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                issuer: _configuration["Jwt:Issuer"],
                audience: _configuration["Jwt:Audience"],
                claims: claims,
                expires: DateTime.Now.AddDays(7), // Токен живе 7 днів
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
