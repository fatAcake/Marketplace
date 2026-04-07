public class DiscountDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public int? Size { get; set; } = null!;
    public DateTimeOffset? StartDate { get; set; } = null!;
    public DateTimeOffset? EndDate { get; set; } = null!;
}
public class DiscountFullInfo
{
    #region Discount
    public int DiscountId { get; set; }
    public int? Size { get; set; } = null!;
    public DateTimeOffset? StartDate { get; set; } = null!;
    public DateTimeOffset? EndDate { get; set; } = null!;
    #endregion
    #region Product
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public float Price { get; set; }
    public int Quanity { get; set; }
    public string Description { get; set; }
    public byte[] FileData { get; set; }
    #endregion
    #region User
    
    public int UserId { get; set; }
    public string NickName { get; set; }
    public string Email { get; set; }
    public string UserStatus { get; set; } = "Buyer";
    #endregion
}