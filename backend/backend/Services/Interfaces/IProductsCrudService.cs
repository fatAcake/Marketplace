using backend.DTO;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IProductsCrudService
    {
        Task<List<ProductDto>> GetAllProductsAsync();
        Task<ProductDto?> GetProductByIdAsync(int id);
        Task<List<UserProductInfo>> GetProductsByUserIdAsync(int userId);
        Task<ProductDto> CreateProductAsync(CreateProductDto dto, int userId);
        Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto, int userId);
        Task<bool> DeleteProductAsync(int id, int userId);
    }
}
