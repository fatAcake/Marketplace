using backend.DTO;

namespace backend.Services.Interfaces
{
    public interface IOrdersCrudService
    {
        Task<OrderDto> CreateOrderAsync(OrderCreateDto dto, int userId);
        Task<List<OrderDto>> GetUserOrdersAsync(int userId);
        Task<OrderDto?> GetOrderByIdAsync(int orderId, int userId);
        Task<OrderDto> UpdateOrderStatusAsync(int orderId, string status, int userId);
        Task<List<SellerOrderInfo>> GetSellerSalesAsync(int sellerId);
    }
}
