namespace backend.DTO
{
    public class SalesAnalyticsDto
    {
        public int TotalSales { get; set; }
        public decimal TotalRevenue { get; set; }
        public decimal AverageCheck { get; set; }
        public int TotalOrders { get; set; }
        public List<TopProductDto> TopProducts { get; set; } = new();
    }

    public class TopProductDto
    {
        public int ProductId { get; set; }
        public string ProductName { get; set; } = null!;
        public int SoldQuantity { get; set; }
        public decimal TotalRevenue { get; set; }
    }

    public class PriceAnalyticsDto
    {
        public int TotalProducts { get; set; }
        public decimal AveragePrice { get; set; }
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public int ProductsWithDiscount { get; set; }
        public decimal AverageDiscount { get; set; }
    }
}
