using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/products/{productId}/[controller]")]
    public class PriceHistoryController : BaseApiController
    {
        private readonly IPriceHistoryService _priceHistoryService;
        private readonly ILogger<PriceHistoryController> _logger;

        public PriceHistoryController(IPriceHistoryService priceHistoryService, ILogger<PriceHistoryController> logger)
        {
            _priceHistoryService = priceHistoryService;
            _logger = logger;
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
                return HandleException(ex, _logger, $"Ошибка при получении истории цен для товара {productId}");
            }
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> AddPriceHistory(int productId, [FromBody] PriceHistoryCreateDto dto)
        {
            var validation = ValidateModelState();
            if (validation != null) return validation;

            try
            {
                var userId = Methods.GetCurrentUserId(User);
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
                return BadRequestError(ex.Message);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, $"Ошибка при добавлении записи истории цен для товара {productId}");
            }
        }
    }
}
