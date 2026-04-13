using backend.DTO;

namespace backend.Services.Interfaces
{
    public interface IPriceHistoryService
    {
        Task<List<PriceHistoryDto>> GetPriceHistoryAsync(int productId);
        Task<PriceHistoryDto> AddPriceHistoryAsync(int productId, decimal? newPrice, decimal? newDiscount, int? changedBy);
        Task RecordPriceChangeAsync(int productId, decimal? oldPrice, decimal? newPrice, decimal? oldDiscount, decimal? newDiscount, int? changedBy);
    }
}
