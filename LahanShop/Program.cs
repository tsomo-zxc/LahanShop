using LahanShop.Data;
using LahanShop.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ==============================
// 1. НАЛАШТУВАННЯ СЕРВІСІВ
// ==============================

builder.Services.AddControllers().AddJsonOptions(options =>
{
    options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "LahanShop API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Введіть токен у форматі: Bearer {ваш_токен}",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(connectionString));

// Налаштування Identity (паролі тощо)
builder.Services.AddIdentity<User, IdentityRole>(options =>
{
    options.Password.RequireDigit = false;
    options.Password.RequireLowercase = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequiredLength = 6;
})
.AddEntityFrameworkStores<AppDbContext>()
.AddDefaultTokenProviders();

// Налаштування JWT
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme; // Додано для надійності
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Налаштування CORS (Тут ми створюємо політику, але ще не застосовуємо)
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policyBuilder =>
    {
        policyBuilder.WithOrigins("https://lahan-shop.vercel.app/") // Vite порти
                     .AllowAnyHeader()                     
                     .AllowAnyMethod()
                     .AllowCredentials(); // Важливо, якщо будеш передавати куки або auth-заголовки
    });
});

var app = builder.Build();

// ==============================
// 2. ІНІЦІАЛІЗАЦІЯ ДАНИХ (SEEDING)
// ==============================
// Краще робити це тут, перед запуском пайплайну
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var context = services.GetRequiredService<AppDbContext>();
        // Спочатку ініціалізація структури/товарів
        LahanShop.Data.DbInitializer.Initialize(context);

        // Потім ролі та адмін (асинхронно)
        await LahanShop.Data.DbInitializer.SeedRolesAndAdminAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "Сталася помилка під час ініціалізації бази даних.");
    }
}

// ==============================
// 3. HTTP PIPELINE (ПОРЯДОК ВАЖЛИВИЙ!)
// ==============================

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LahanShop API v1");
        // c.EnablePersistAuthorization(); // Увімкни, якщо твоя версія Swagger це підтримує
    });
}

app.UseHttpsRedirection();

// Статичні файли (щоб картинки працювали) мають йти ДО авторизації
app.UseStaticFiles();

app.UseRouting();

// CORS має бути МІЖ UseRouting та UseAuthentication
app.UseCors("ReactApp");

app.UseAuthentication(); // Хто ти?
app.UseAuthorization();  // Що тобі можна?

app.MapControllers();

app.Run();