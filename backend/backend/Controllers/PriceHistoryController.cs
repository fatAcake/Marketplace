using System.Security.Claims;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/products/{productId}/[controller]")]
    public class PriceHistoryController : ControllerBase
    {
        private readonly IPriceHistoryService _priceHistoryService;
        private readonly ILogger<PriceHistoryController> _logger;

        public PriceHistoryController(IPriceHistoryService priceHistoryService, ILogger<PriceHistoryController> logger)
        {
            _priceHistoryService = priceHistoryService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null || !int.TryParse(idClaim.Value, out int userId))
                throw new UnauthorizedAccessException("User ID not found in token");
            return userId;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetPriceHistory(int productId)
        {
            try
            {
                var history = await _priceHistoryService.GetPriceHistoryAsync(productId);
                return Ok(history);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении истории цен для товара {ProductId}", productId);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddPriceHistory(int productId, [FromBody] PriceHistoryCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetCurrentUserId();
                var historyEntry = await _priceHistoryService.AddPriceHistoryAsync(
                    productId,
                    dto.NewPrice,
                    dto.NewDiscount,
                    userId
                );

                return Ok(historyEntry);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении записи истории цен для товара {ProductId}", productId);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }
    }
}
