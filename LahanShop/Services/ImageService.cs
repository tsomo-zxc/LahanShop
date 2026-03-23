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
            _connectionString = configuration["AzureStorage:ConnectionString"];
            _containerName = configuration["AzureStorage:ContainerName"];
        }

        public async Task<string> UploadImageAsync(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return null;
                      
            var fileName = $"{Guid.NewGuid()}.webp";

            using var imageStream = new MemoryStream();
            
            using (var image = await Image.LoadAsync(file.OpenReadStream()))
            {               
                if (image.Width > 800)
                {
                    image.Mutate(x => x.Resize(new ResizeOptions
                    {
                        Size = new Size(800, 0),
                        Mode = ResizeMode.Max
                    }));
                }

                var encoder = new WebpEncoder { Quality = 80 };
                await image.SaveAsync(imageStream, encoder);
            }

            imageStream.Position = 0;

            var blobServiceClient = new BlobServiceClient(_connectionString);
            var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);
            
            var blobHttpHeader = new BlobHttpHeaders { ContentType = "image/webp" };
            await blobClient.UploadAsync(imageStream, new BlobUploadOptions { HttpHeaders = blobHttpHeader });

            return blobClient.Uri.ToString();
        }

        public async Task<bool> DeleteImageAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl)) return false;

            try
            {               
                var uri = new Uri(imageUrl);
                var blobName = Path.GetFileName(uri.LocalPath);

                var blobServiceClient = new BlobServiceClient(_connectionString);
                var containerClient = blobServiceClient.GetBlobContainerClient(_containerName);
                var blobClient = containerClient.GetBlobClient(blobName);

                return await blobClient.DeleteIfExistsAsync();
            }
            catch
            {
                return false; 
            }
        }
    }
}