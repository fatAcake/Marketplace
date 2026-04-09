using System.Security.Claims;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscountsController : ControllerBase
    {
        private readonly IDiscountsCrudService _discountsService;
        private readonly ILogger<DiscountsController> _logger;

        public DiscountsController(IDiscountsCrudService discountsService, ILogger<DiscountsController> logger)
        {
            _discountsService = discountsService;
            _logger = logger;
        }

        private int GetCurrentUserId()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (idClaim == null || !int.TryParse(idClaim.Value, out int userId))
                throw new UnauthorizedAccessException("User ID not found in token");
            return userId;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateDiscount([FromBody] DiscountCreateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetCurrentUserId();
                var discount = await _discountsService.CreateDiscountAsync(dto, userId);
                return CreatedAtAction(nameof(GetDiscount), new { id = discount.Id }, discount);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании скидки для товара {ProductId}", dto.ProductId);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllDiscounts()
        {
            try
            {
                var discounts = await _discountsService.GetAllDiscountsAsync();
                return Ok(discounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении всех скидок");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDiscount(int id)
        {
            try
            {
                var discount = await _discountsService.GetDiscountByIdAsync(id);

                if (discount == null)
                    return NotFound(new { error = "Скидка не найдена" });

                return Ok(discount);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении скидки {DiscountId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpGet("products/{productId}/discounts")]
        [AllowAnonymous]
        public async Task<IActionResult> GetDiscountsByProductId(int productId)
        {
            try
            {
                var discounts = await _discountsService.GetDiscountsByProductIdAsync(productId);
                return Ok(discounts);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при получении скидок для товара {ProductId}", productId);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDiscount(int id, [FromBody] DiscountUpdateDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = GetCurrentUserId();
                var discount = await _discountsService.UpdateDiscountAsync(id, dto, userId);

                if (discount == null)
                    return NotFound(new { error = "Скидка не найдена" });

                return Ok(discount);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении скидки {DiscountId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDiscount(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _discountsService.DeleteDiscountAsync(id, userId);

                if (!result)
                    return NotFound(new { error = "Скидка не найдена" });

                return Ok(new { message = "Скидка удалена" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Unauthorized(new { error = ex.Message });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении скидки {DiscountId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }
    }
}
