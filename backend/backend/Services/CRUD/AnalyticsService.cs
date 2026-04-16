using backend.Data;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CRUD
{
    public class AnalyticsService : IAnalyticsService
    {
        private readonly DBContext _context;
        private readonly ILogger<AnalyticsService> _logger;

        public AnalyticsService(DBContext context, ILogger<AnalyticsService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<SalesAnalyticsDto> GetSalesAnalyticsAsync(int sellerId, DateTime? startDate = null, DateTime? endDate = null)
        {
            var query = _context.OrderItems
                .Where(oi => oi.seller_id == sellerId)
                .AsQueryable();

            if (startDate.HasValue)
            {
                query = query.Where(oi => oi.Order.created_at >= startDate.Value);
            }

            if (endDate.HasValue)
            {
                query = query.Where(oi => oi.Order.created_at <= endDate.Value);
            }

            var orderItems = await query.ToListAsync();

            var totalSales = orderItems.Sum(oi => oi.quantity);
            var totalRevenue = orderItems.Sum(oi => oi.final_price_at_buy * oi.quantity);
            var totalOrders = orderItems.Select(oi => oi.order_id).Distinct().Count();
            var averageCheck = totalOrders > 0 ? totalRevenue / totalOrders : 0;

            // Топ товары
            var topProducts = await query
                .GroupBy(oi => new { oi.product_id, oi.name_at_buy })
                .Select(g => new
                {
                    ProductId = g.Key.product_id,
                    ProductName = g.Key.name_at_buy,
                    SoldQuantity = g.Sum(x => x.quantity),
                    TotalRevenue = g.Sum(x => x.final_price_at_buy * x.quantity)
                })
                .OrderByDescending(x => x.SoldQuantity)
                .Take(10)
                .ToListAsync();

            return new SalesAnalyticsDto
            {
                TotalSales = totalSales,
                TotalRevenue = totalRevenue,
                AverageCheck = averageCheck,
                TotalOrders = totalOrders,
                TopProducts = topProducts.Select(p => new TopProductDto
                {
                    ProductId = p.ProductId,
                    ProductName = p.ProductName,
                    SoldQuantity = p.SoldQuantity,
                    TotalRevenue = p.TotalRevenue
                }).ToList()
            };
        }

        public async Task<PriceAnalyticsDto> GetPriceAnalyticsAsync()
        {
            var products = await _context.Products
                .Where(p => !p.deleted)
                .ToListAsync();

            if (!products.Any())
            {
                return new PriceAnalyticsDto
                {
                    TotalProducts = 0,
                    AveragePrice = 0,
                    MinPrice = 0,
                    MaxPrice = 0,
                    ProductsWithDiscount = 0,
                    AverageDiscount = 0
                };
            }

            var prices = products.Select(p => (decimal)p.price).ToList();
            
            // Получаем активные скидки
            var productIds = products.Select(p => p.id).ToList();
            var activeDiscounts = await _context.Discounts
                .Where(d => productIds.Contains(d.product_id)
                    && !d.deleted
                    && d.start_date <= DateTime.UtcNow
                    && d.end_date >= DateTime.UtcNow)
                .ToListAsync();

            var productsWithDiscount = activeDiscounts.Count;
            var averageDiscount = activeDiscounts.Any() 
                ? activeDiscounts.Average(d => d.size ?? 0) 
                : 0;

            return new PriceAnalyticsDto
            {
                TotalProducts = products.Count,
                AveragePrice = prices.Average(),
                MinPrice = prices.Min(),
                MaxPrice = prices.Max(),
                ProductsWithDiscount = productsWithDiscount,
                AverageDiscount = averageDiscount
            };
        }
    }
}
