using backend.DTO;
using backend.Models;

namespace backend.Services.Interfaces
{
    public interface IDiscountsCrudService
    {
        Task<DiscountDto> CreateDiscountAsync(DiscountCreateDto dto, int userId);
        Task<List<DiscountDto>> GetAllDiscountsAsync();
        Task<DiscountDto?> GetDiscountByIdAsync(int id);
        Task<List<DiscountDto>> GetDiscountsByProductIdAsync(int productId);
        Task<DiscountDto?> UpdateDiscountAsync(int id, DiscountUpdateDto dto, int userId);
        Task<bool> DeleteDiscountAsync(int id, int userId);
        Task<Discount?> GetActiveDiscountForProductAsync(int productId);
    }
}
