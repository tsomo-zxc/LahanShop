using LahanShop.DTOs;
using LahanShop.Models;
using LahanShop.Services.Email;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace LahanShop.Controllers
{
        
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly IConfiguration _configuration;
        private readonly IEmailService _emailService;

        public AuthController(UserManager<User> userManager, IConfiguration configuration, IEmailService emailService)
        {
            _userManager = userManager;
            _emailService = emailService;
            _configuration = configuration;
        }

        // POST: api/auth/register
        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            var userExists = await _userManager.FindByEmailAsync(dto.Email);
            if (userExists != null)
                return BadRequest(new { Message = "Користувач з таким email вже існує" });

            var user = new User
            {
                Email = dto.Email,
                UserName = dto.Email,
                FullName = dto.FullName
            };

            var result = await _userManager.CreateAsync(user, dto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            await _userManager.AddToRoleAsync(user, "User");

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            
            var frontendUrl = _configuration["ApiConnection:Server"];
            if (!string.IsNullOrEmpty(frontendUrl) && !frontendUrl.EndsWith("/"))
            {
                frontendUrl += "/";
            }

            var callbackUrl = $"{frontendUrl}confirm-email?userId={user.Id}&token={encodedToken}";

            var message = $"<h1>Вітаємо в LahanShop!</h1>" +
                  $"<p>Будь ласка, підтвердіть вашу пошту, перейшовши за посиланням:</p>" +
                  $"<a href='{callbackUrl}'>Підтвердити пошту</a>";

            await _emailService.SendEmailAsync(user.Email, "Підтвердження реєстрації", message);

            return Ok(new { Message = "Реєстрація успішна. Перевірте вашу поштову скриньку для підтвердження." });
        }

        // POST: api/auth/confirm-email
        [HttpPost("confirm-email")]
        public async Task<IActionResult> ConfirmEmail([FromBody] ConfirmEmailDto dto)
        {
            if (string.IsNullOrEmpty(dto.UserId) || string.IsNullOrEmpty(dto.Token))
                return BadRequest(new { Message = "Невірне посилання підтвердження." });

            var user = await _userManager.FindByIdAsync(dto.UserId);
            if (user == null)
                return NotFound(new { Message = "Користувача не знайдено." });

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(dto.Token));

            var result = await _userManager.ConfirmEmailAsync(user, decodedToken);

            if (result.Succeeded)
            {
                return Ok(new { Message = "Пошту успішно підтверджено!" });
            }

            return BadRequest(new { Message = "Помилка підтвердження пошти. Можливо, посилання застаріло." });
        }
       
        // POST: api/auth/resend-confirmation-email
        [HttpPost("resend-confirmation-email")]
        public async Task<IActionResult> ResendConfirmationEmail([FromBody] ResendEmailDto dto)
        {
            if (string.IsNullOrEmpty(dto.Email))
                return BadRequest(new { Message = "Email є обов'язковим." });

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)                
                return Ok(new { Message = "Якщо акаунт існує та не підтверджений, ми відправили новий лист." });

            var isEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if (isEmailConfirmed)
                return BadRequest(new { Message = "Ця електронна адреса вже підтверджена." });

            var token = await _userManager.GenerateEmailConfirmationTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var frontendUrl = _configuration["ApiConnection:Server"];
            if (!string.IsNullOrEmpty(frontendUrl) && !frontendUrl.EndsWith("/"))
            {
                frontendUrl += "/";
            }

            var callbackUrl = $"{frontendUrl}confirm-email?userId={user.Id}&token={encodedToken}";

            var message = $"<h1>Вітаємо знову в LahanShop!</h1>" +
                  $"<p>Ви запросили новий лист для підтвердження. Будь ласка, перейдіть за посиланням:</p>" +
                  $"<a href='{callbackUrl}'>Підтвердити пошту</a>";

            await _emailService.SendEmailAsync(user.Email, "Повторне підтвердження реєстрації", message);

            return Ok(new { Message = "Якщо акаунт існує та не підтверджений, ми відправили новий лист." });
        }

        // POST: /api/auth/forgot-password
        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ResendEmailDto dto) 
        {
            if (string.IsNullOrEmpty(dto.Email))
                return BadRequest(new { Message = "Email є обов'язковим." });

            var user = await _userManager.FindByEmailAsync(dto.Email);
            
            if (user == null || !(await _userManager.IsEmailConfirmedAsync(user)))
            {
                return Ok(new { Message = "Якщо цей email зареєстрований і підтверджений, ми відправили інструкції для відновлення пароля." });
            }
            
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

            var frontendUrl = _configuration["ApiConnection:Server"];
            if (!string.IsNullOrEmpty(frontendUrl) && !frontendUrl.EndsWith("/"))
            {
                frontendUrl += "/";
            }
                        
            var callbackUrl = $"{frontendUrl}reset-password?email={user.Email}&token={encodedToken}";

            var message = $"<h1>Відновлення пароля в LahanShop!</h1>" +
                          $"<p>Ви запросили зміну пароля. Будь ласка, перейдіть за посиланням, щоб встановити новий пароль:</p>" +
                          $"<a href='{callbackUrl}'>Встановити новий пароль</a>";

            await _emailService.SendEmailAsync(user.Email, "Відновлення пароля", message);

            return Ok(new { Message = "Якщо цей email зареєстрований і підтверджений, ми відправили інструкції для відновлення пароля." });
        }


        // POST: /api/auth/reset-password
        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
        {            
            if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Token) || string.IsNullOrEmpty(dto.NewPassword))
                return BadRequest(new { Message = "Невірні дані для зміни пароля." });

            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return BadRequest(new { Message = "Невірний запит." }); 

            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(dto.Token));

            
            var result = await _userManager.ResetPasswordAsync(user, decodedToken, dto.NewPassword);

            
            if (result.Succeeded)
            {
                return Ok(new { Message = "Пароль успішно змінено!" });
            }
            
            return BadRequest(new { Message = "Помилка зміни пароля. Можливо, посилання застаріло або пароль занадто простий.", Errors = result.Errors });
        }

        // POST: api/auth/login
        [HttpPost("login")]
        public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
        {
            var user = await _userManager.FindByEmailAsync(dto.Email);
            if (user == null)
                return Unauthorized(new { ErrorCode = "InvalidCredentials", Message = "Невірний email або пароль" });
            
            if (await _userManager.IsLockedOutAsync(user))
            {
                return StatusCode(423, new { ErrorCode = "AccountLocked", Message = "Акаунт тимчасово заблоковано через велику кількість невдалих спроб входу. Спробуйте пізніше." });
            }

            var isPasswordValid = await _userManager.CheckPasswordAsync(user, dto.Password);
            if (!isPasswordValid)
            {
                
                await _userManager.AccessFailedAsync(user);

                if (await _userManager.IsLockedOutAsync(user))
                {
                    return StatusCode(423, new { ErrorCode = "AccountLocked", Message = "Акаунт щойно було заблоковано. Спробуйте пізніше." });
                }

                return Unauthorized(new { ErrorCode = "InvalidCredentials", Message = "Невірний email або пароль" });
            }
            
            await _userManager.ResetAccessFailedCountAsync(user);
            
            var isEmailConfirmed = await _userManager.IsEmailConfirmedAsync(user);
            if (!isEmailConfirmed)
            {
                return StatusCode(403, new { ErrorCode = "EmailNotConfirmed", Message = "Будь ласка, підтвердіть вашу пошту перед входом." });
            }

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
                expires: DateTime.Now.AddDays(7),
                signingCredentials: creds
            );

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}