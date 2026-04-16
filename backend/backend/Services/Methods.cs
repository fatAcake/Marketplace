using System.Security.Claims;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

public static class Methods
{
    public static int GetCurrentUserId(ClaimsPrincipal User)
    {
        var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (idClaim == null || !int.TryParse(idClaim.Value, out int userId))
            throw new UnauthorizedAccessException("User ID not found in token");
        return userId;
    }
    public static string GetHTMLMessage(Users user, string code)
    {
        return (
            $@"<html>
                <body style='font-family: Arial, sans-serif; background: #f5f7fb; margin: 0; padding: 0;'>
                    <table width='100%' cellpadding='0' cellspacing='0' role='presentation'>
                        <tr>
                            <td align='center' style='padding: 40px 16px;'>
                                <table width='100%' cellpadding='0' cellspacing='0' role='presentation' style='max-width: 600px; background: #ffffff; border-radius: 14px; box-shadow: 0 16px 35px rgba(15, 23, 42, 0.08); overflow: hidden;'>
                                    <tr>
                                        <td style='padding: 32px; color: #111827;'>
                                            <h2 style='margin: 0 0 16px; font-size: 24px;'>Привет, {user.nickname}!</h2>
                                            <p style='margin: 0 0 24px; color: #4b5563; font-size: 16px; line-height: 1.6;'>Вот ваш код подтверждения:</p>
                                            <div style='background: #f3f4f6; border-radius: 12px; padding: 24px; text-align: center;'>
                                                <p style='margin: 0 0 8px; color: #6b7280; font-size: 13px; letter-spacing: 0.18em;'>КОД ПОДТВЕРЖДЕНИЯ</p>
                                                <p style='margin: 0; font-size: 36px; font-weight: 700; letter-spacing: 0.25em; color: #111827;'>{code}</p>
                                            </div>
                                            <p style='margin: 24px 0 8px; color: #4b5563; font-size: 15px;'>Код действителен <strong>10 минут</strong>.</p>
                                            <p style='margin: 0; color: #6b7280; font-size: 14px;'>Если вы не делали этот запрос, просто проигнорируйте письмо.</p>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </table>
                </body>
            </html>"
        );
    }

    public static IActionResult BadRequestError(string error) => new BadRequestObjectResult(new { error });

    public static IActionResult NotFoundError(string error) => new NotFoundObjectResult(new { error });

    public static IActionResult OkMessage(string message) => new OkObjectResult(new { message });

    public static IActionResult InternalServerError(string error) => new ObjectResult(new { error }) { StatusCode = 500 };

    public static async Task<Products> CheckProductOwnershipAsync(DBContext db, int productId, int userId, string operation)
    {
        var product = await db.Products.FirstOrDefaultAsync(p => p.id == productId && !p.deleted);
        if (product == null)
            throw new InvalidOperationException("Товар не найден");
        if (product.user_id != userId)
            throw new UnauthorizedAccessException($"Только владелец товара может {operation}");
        return product;
    }

    public static async Task<(decimal? discountSize, float? discountedPrice)> GetActiveDiscountInfoAsync(DBContext db, int productId, float price)
    {
        var now = DateTime.UtcNow;
        var activeDiscount = await db.Discounts
            .AsNoTracking()
            .Where(d => d.product_id == productId
                && !d.deleted
                && (d.start_date == null || d.start_date <= now)
                && (d.end_date == null || d.end_date >= now))
            .FirstOrDefaultAsync();

        decimal? discountSize = activeDiscount?.size;
        float? discountedPrice = null;
        if (discountSize.HasValue && discountSize > 0)
        {
            discountedPrice = (float)((decimal)price * (1m - discountSize.Value / 100m));
        }
        return (discountSize, discountedPrice);
    }
}