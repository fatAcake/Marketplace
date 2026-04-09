using backend.Models;

namespace backend.Services
{
       public interface IPriceHistoryService
    {
        Task<List<PriceDiscountHistory>> GetHistoryForProductAsync(int productId);
        Task<PriceDiscountHistory> AddHistoryAsync(int productId, decimal oldPrice, decimal newPrice,
            decimal oldDiscount, decimal newDiscount, int changedByUserId);
        Task<bool> DeleteByIdAsync(int historyId);
    }

}