public class ProductToOrderDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int OrderId { get; set; }
    public int PTOQuanity { get; set; }
    
}
public class ProductToOrderFullInfo
{
    #region  Product
    public string Name { get; set; } = null!;
    public float Price { get; set; }
    public int ProductQuanity { get; set; }
    public int ProductUserId { get; set; }
    public string Description { get; set; }
    public byte[] FileData { get; set; }
    #endregion
    #region Order
    public int OrderUserId { get; set; }
    public string OrderStatus { get; set; } = null!;
    public float TotalSum { get; set; }
    public int TotalProducts { get; set; }
    #endregion
    #region Product User
    public string SellerNickName { get; set; }
    public string SellerEmail { get; set; }
    public string SellerUserStatus { get; set; } = "Seller";
    #endregion
    #region Order User
    public string BuyerNickName { get; set; }
    public string BuyerEmail { get; set; }
    public string BuyerUserStatus { get; set; } = "Buyer";
    #endregion
}
