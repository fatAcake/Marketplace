using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;

public class ProductDto
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public float Price { get; set; }
    public int Quantity { get; set; }
    public string Description { get; set; } = string.Empty;
    public int UserId { get; set; }
    public string SellerNickName { get; set; } = null!;
    public string SellerEmail { get; set; } = null!;
}

public class CreateProductDto
{
    [Required]
    [StringLength(200, MinimumLength = 1)]
    public string Name { get; set; } = null!;

    [Required]
    [Range(0.01, float.MaxValue)]
    public float Price { get; set; }

    [Required]
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; }

    [StringLength(2000)]
    public string Description { get; set; } = string.Empty;

    public IFormFile[] Images { get; set; } = Array.Empty<IFormFile>();
}

public class UpdateProductDto
{
    [StringLength(200, MinimumLength = 1)]
    public string? Name { get; set; }

    [Range(0.01, float.MaxValue)]
    public float? Price { get; set; }

    [Range(1, int.MaxValue)]
    public int? Quantity { get; set; }

    [StringLength(2000)]
    public string? Description { get; set; }

    [Range(0, 100)]
    public decimal? DiscountSize { get; set; }

    public DateTimeOffset? DiscountStartDate { get; set; }

    public DateTimeOffset? DiscountEndDate { get; set; }
}

public class UserProductInfo
{
    #region Product
    public int ProductId { get; set; }
    public string Name { get; set; } = null!;
    public float Price { get; set; }
    public int Quantity { get; set; }
    public string Description { get; set; } = null!;
    #endregion
    #region Seller User
    public int SellerUserId { get; set; }
    public string NickName { get; set; } = null!;
    public string Email { get; set; } = null!;
    public string SellerStatus { get; set; } = "Seller";
    #endregion
}