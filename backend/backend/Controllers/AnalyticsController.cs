using System.Security.Claims;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AnalyticsController : ControllerBase
    {
        private readonly IAnalyticsService _analyticsService;
        private readonly ILogger<AnalyticsController> _logger;

        public AnalyticsController(IAnalyticsService analyticsService, ILogger<AnalyticsController> logger)
        {
            _analyticsService = analyticsService;
            _logger = logger;
        }

        [HttpGet("sales")]
        [Authorize]
        public async Task<IActionResult> GetSalesAnalytics(
            [FromQuery] DateTime? startDate = null,
            [FromQuery] DateTime? endDate = null)
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var analytics = await _analyticsService.GetSalesAnalyticsAsync(userId, startDate, endDate);
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении аналитики продаж");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("prices")]
        [AllowAnonymous]
        public async Task<IActionResult> GetPriceAnalytics()
        {
            try
            {
                var analytics = await _analyticsService.GetPriceAnalyticsAsync();
                return Ok(analytics);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении аналитики цен");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }
    }
}
