public class ProductImageDto
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string ContentType { get; set; } = null!;
    public int Order { get; set; }
    public DateTime CreatedAt { get; set; }
}
