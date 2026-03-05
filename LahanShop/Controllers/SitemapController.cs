using LahanShop.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration; 
using System.Xml.Linq;
namespace LahanShop.Controllers
{       

    [ApiController]
    public class SitemapController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration; // Додаємо конфігурацію
        private readonly string _frontendUrl; // Змінили const на readonly

        // Передаємо IConfiguration у конструктор
        public SitemapController(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;

            // Витягуємо URL з appsettings.json
            _frontendUrl = _configuration["ApiConnection:Server"];

            // Маленький запобіжник: якщо в налаштуваннях забули вказати URL, щоб код не впав
            if (string.IsNullOrEmpty(_frontendUrl))
            {
                _frontendUrl = "https://lahan-shop.vercel.app";
            }
        }

        [HttpGet("/api/sitemap")]
        public async Task<IActionResult> GenerateSitemap()
        {
            XNamespace xmlns = "http://www.sitemaps.org/schemas/sitemap/0.9";
            var root = new XElement(xmlns + "urlset");

            // 1. Додаємо статичні сторінки (тепер використовуємо _frontendUrl)
            root.Add(CreateUrlElement(xmlns, $"{_frontendUrl}/", "1.0", "daily"));
            root.Add(CreateUrlElement(xmlns, $"{_frontendUrl}/cart", "0.5", "monthly"));

            var products = await _context.Products
                .Select(p => new { p.Id })
                .ToListAsync();

            foreach (var product in products)
            {
                // Формуємо посилання на товар
                var productUrl = $"{_frontendUrl}/product/{product.Id}";
                root.Add(CreateUrlElement(xmlns, productUrl, "0.8", "weekly"));
            }

            var document = new XDocument(new XDeclaration("1.0", "utf-8", "yes"), root);

            return Content(document.ToString(), "application/xml", System.Text.Encoding.UTF8);
        }

        private XElement CreateUrlElement(XNamespace xmlns, string url, string priority, string changeFreq)
        {
            return new XElement(xmlns + "url",
                new XElement(xmlns + "loc", url),
                new XElement(xmlns + "lastmod", DateTime.UtcNow.ToString("yyyy-MM-dd")),
                new XElement(xmlns + "changefreq", changeFreq),
                new XElement(xmlns + "priority", priority)
            );
        }
    }
}
