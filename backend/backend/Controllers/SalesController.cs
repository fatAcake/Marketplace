using System.Security.Claims;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SalesController : ControllerBase
    {
        private readonly IOrdersCrudService _ordersService;
        private readonly ILogger<SalesController> _logger;

        public SalesController(IOrdersCrudService ordersService, ILogger<SalesController> logger)
        {
            _ordersService = ordersService;
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
        [Authorize]
        public async Task<IActionResult> GetSellerSales()
        {
            try
            {
                var userId = GetCurrentUserId();
                var sales = await _ordersService.GetSellerSalesAsync(userId);
                return Ok(sales);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении продаж продавца");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }
    }
}
