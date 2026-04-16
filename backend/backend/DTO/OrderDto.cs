public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string OrderStatus { get; set; } = null!;
    public decimal TotalSum { get; set; }
    public int TotalProducts { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? EditedAt { get; set; }
    public List<OrderItemDto> Items { get; set; } = new();
}

public class OrderCreateDto
{
    public List<OrderItemCreateDto> Items { get; set; } = new();
}

public class OrderItemCreateDto
{
    public int ProductId { get; set; }
    public int Quantity { get; set; }
}

public class OrderItemDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int OrderId { get; set; }
    public int SellerId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal PriceAtBuy { get; set; }
    public decimal? DiscountAtBuy { get; set; }
    public decimal FinalPriceAtBuy { get; set; }
}

public class UserOrderInfo
{
    #region Order
    public int OrderId { get; set; }
    public string OrderStatus { get; set; } = null!;
    public decimal TotalSum { get; set; }
    public int TotalProducts { get; set; }
    public DateTime CreatedAt { get; set; }
    #endregion
    #region User
    public int UserId { get; set; }
    public string NickName { get; set; }
    public string Email { get; set; }
    public string UserStatus { get; set; } = "Buyer";
    #endregion
}

public class OrderStatusUpdateDto
{
    public string Status { get; set; } = null!;
}

public class SellerOrderInfo
{
    #region Order
    public int OrderId { get; set; }
    public string OrderStatus { get; set; } = null!;
    public DateTime CreatedAt { get; set; }
    #endregion
    #region Buyer
    public int BuyerId { get; set; }
    public string BuyerNickName { get; set; } = null!;
    public string BuyerEmail { get; set; } = null!;
    #endregion
    #region Item
    public int OrderItemId { get; set; }
    public int ProductId { get; set; }
    public string ProductName { get; set; } = null!;
    public int Quantity { get; set; }
    public decimal PriceAtBuy { get; set; }
    public decimal? DiscountAtBuy { get; set; }
    public decimal FinalPriceAtBuy { get; set; }
    #endregion
}