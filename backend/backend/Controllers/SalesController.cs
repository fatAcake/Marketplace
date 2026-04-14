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

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetSellerSales()
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
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
