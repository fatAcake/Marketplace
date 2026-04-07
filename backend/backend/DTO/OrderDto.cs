public class OrderDto
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public string OrderStatus { get; set; } = null!;
    public float TotalSum { get; set; }
    public int TotalProducts { get; set; }
}
public class UserOrderInfo
{
    #region Order
    public int OrderId { get; set; }
    public string OrderStatus { get; set; } = null!;
    public float TotalSum { get; set; }
    public int TotalProducts { get; set; }
    #endregion
    #region User
    public int UserId { get; set; }
    public string NickName { get; set; }
    public string Email { get; set; }
    public string UserStatus { get; set; } = "Buyer";
    #endregion
}