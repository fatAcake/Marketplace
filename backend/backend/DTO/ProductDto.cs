public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public float Price { get; set; }
    public int Quanity { get; set; }
    public int UserId { get; set; }
    public string Description { get; set; }
    public byte[] FileData { get; set; }
}
public class UserProductInfo
{
    #region Product
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public float Price { get; set; }
    public int Quanity { get; set; }
    public string Description { get; set; }
    public byte[] FileData { get; set; }
    #endregion
    #region Seller User
    public int SellerUserId { get; set; }
    public string NickName { get; set; }
    public string Email { get; set; }
    public string SellerStatus { get; set; } = "Seller";
    #endregion
}