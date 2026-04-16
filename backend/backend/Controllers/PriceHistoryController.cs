using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/products")]
    public class PriceHistoryController : ControllerBase
    {
        private readonly IPriceHistoryService _priceHistoryService;

        public PriceHistoryController(IPriceHistoryService priceHistoryService)
        {
            _priceHistoryService = priceHistoryService;
        }

        [HttpGet("{id}/price-history")]
        public async Task<IActionResult> GetPriceHistory(int id)
        {
            var history = await _priceHistoryService.GetHistoryForProductAsync(id);
            return Ok(history);
        }

        [HttpPost("{id}/price-history")]
        [Authorize]
        public async Task<IActionResult> AddPriceHistory(int id, [FromBody] AddPriceHistoryRequest request)
        {
            var currentUserId = GetCurrentUserId();
            if (currentUserId == null)
                return Unauthorized(new { message = "Не удалось определить пользователя" });

            var history = await _priceHistoryService.AddHistoryAsync(
                id,
                request.OldPrice,
                request.NewPrice,
                request.OldDiscount,
                request.NewDiscount,
                currentUserId.Value
            );

            return Ok(history);
        }

        [HttpDelete("{productId}/price-history/{historyId}")]
        [Authorize]
        public async Task<IActionResult> DeletePriceHistory(int productId, int historyId)
        {
            var result = await _priceHistoryService.DeleteByIdAsync(historyId);
            if (!result)
                return NotFound(new { message = "Запись истории не найдена" });

            return Ok(new { message = "Запись удалена" });
        }

        private int? GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
                           ?? User.FindFirst("sub")?.Value
                           ?? User.FindFirst("userId")?.Value;

            if (int.TryParse(userIdClaim, out int userId))
                return userId;
            return null;
        }
    }

    public class AddPriceHistoryRequest
    {
        public decimal OldPrice { get; set; }
        public decimal NewPrice { get; set; }
        public decimal OldDiscount { get; set; }
        public decimal NewDiscount { get; set; }
    }
}