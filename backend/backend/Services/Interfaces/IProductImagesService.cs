using backend.DTO;
using Microsoft.AspNetCore.Http;

namespace backend.Services.Interfaces
{
    public interface IProductImagesService
    {
        Task<List<ProductImageDto>> GetImagesAsync(int productId);
        Task<(byte[] data, string contentType)?> GetImageByIdAsync(int productId, int imageId);
        Task<ProductImageDto> AddImageAsync(int productId, IFormFile image, int userId, int order);
        Task<bool> DeleteImageAsync(int productId, int imageId, int userId);
        Task<bool> ReorderImagesAsync(int productId, List<int> imageIds, int userId);
    }
}
