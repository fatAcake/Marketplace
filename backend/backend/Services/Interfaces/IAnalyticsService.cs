using backend.DTO;

namespace backend.Services.Interfaces
{
    public interface IAnalyticsService
    {
        Task<SalesAnalyticsDto> GetSalesAnalyticsAsync(int sellerId, DateTime? startDate = null, DateTime? endDate = null);
        Task<PriceAnalyticsDto> GetPriceAnalyticsAsync();
    }
}
