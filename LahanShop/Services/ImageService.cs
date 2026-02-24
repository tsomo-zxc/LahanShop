using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Webp;
using SixLabors.ImageSharp.Processing;

namespace LahanShop.Services
{
    public class ImageService : IImageService
    {
        private readonly string _connectionString;
        private readonly string _containerName;

        public ImageService(IConfiguration configuration)
        {
            // Беремо налаштування з appsettings.json
            _connectionString = configuration["AzureStorage:ConnectionString"];
            _containerName = configuration["AzureStorage:ContainerName"];
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;

            // 1. Генеруємо унікальне ім'я для файлу, щоб вони не перезаписували один одного
            var fileName = $"{Guid.NewGuid()}.webp";

            using var imageStream = new MemoryStream();

            // 2. Магія ImageSharp: Читаємо, стискаємо і конвертуємо у WebP
            using (var image = await Image.LoadAsync(file.OpenReadStream()))
            {
                // Якщо картинка ширша за 800 пікселів - пропорційно зменшуємо її
                if (image.Width > 800)
                {
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(800, 0),
                        Mode = ResizeMode.Max
                    }));
                }

                // Зберігаємо в оперативну пам'ять у форматі WebP з якістю 80%
                var encoder = new WebpEncoder { Quality = 80 };
                await image.SaveAsync(imageStream, encoder);
            }

            // Повертаємо "курсор" потоку на початок перед відправкою
            imageStream.Position = 0;

            // 3. Підключаємося до Azure і завантажуємо файл
            var blobServiceClient = new BlobServiceClient(_connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            // Вказуємо браузерам, що це саме картинка формату webp
            var blobHttpHeader = new BlobHttpHeaders { ContentType = "image/webp" };
            await blobClient.UploadAsync(imageStream, new BlobUploadOptions { HttpHeaders = blobHttpHeader });

            // 4. Повертаємо готове пряме посилання на фото в хмарі
            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl)) return false;

            try
            {
                // Витягуємо ім'я файлу з повного URL (наприклад, "123.webp" з "https://.../123.webp")
                var uri = new Uri(imageUrl);
                var blobName = Path.GetFileName(uri.LocalPath);

                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);

                // Видаляємо файл з Azure, якщо він там існує
                return await blobClient.DeleteIfExistsAsync();
            }
            catch
            {
                return false; // Якщо сталася помилка (наприклад, невірний URL), просто ігноруємо
            }
        }
    }
}