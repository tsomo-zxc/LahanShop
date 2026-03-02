namespace LahanShop.Services
{
    public interface IImageService
    {
        Task<string> UploadImageAsync(IFormFile file);
        Task<bool> DeleteImageAsync(string imageUrl);
    }
}
