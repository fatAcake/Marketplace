using System.Security.Claims;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DiscountsController : BaseApiController
    {
        private readonly IDiscountsCrudService _discountsService;
        private readonly ILogger<DiscountsController> _logger;

        public DiscountsController(IDiscountsCrudService discountsService, ILogger<DiscountsController> logger)
        {
            _discountsService = discountsService;
            _logger = logger;
        }


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateDiscount([FromBody] DiscountCreateDto dto)
        {
            var validation = ValidateModelState();
            if (validation != null) return validation;

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var discount = await _discountsService.CreateDiscountAsync(dto, userId);
                return CreatedAtAction(nameof(GetDiscount), new { id = discount.Id }, discount);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestError(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequestError(ex.Message);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, $"Ошибка при создании скидки для товара {dto.ProductId}");
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
                return HandleException(ex, _logger, "Ошибка при получении всех скидок");
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
                    return NotFoundError("Скидка не найдена");

                return Ok(discount);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, $"Ошибка при получении скидки {id}");
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
                return HandleException(ex, _logger, $"Ошибка при получении скидок для товара {productId}");
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateDiscount(int id, [FromBody] DiscountUpdateDto dto)
        {
            var validation = ValidateModelState();
            if (validation != null) return validation;

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var discount = await _discountsService.UpdateDiscountAsync(id, dto, userId);

                if (discount == null)
                    return NotFoundError("Скидка не найдена");

                return Ok(discount);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequestError(ex.Message);
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequestError(ex.Message);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, $"Ошибка при обновлении скидки {id}");
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteDiscount(int id)
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var result = await _discountsService.DeleteDiscountAsync(id, userId);

                if (!result)
                    return NotFoundError("Скидка не найдена");

                return OkMessage("Скидка удалена");
            }
            catch (UnauthorizedAccessException ex)
            {
                return BadRequestError(ex.Message);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, $"Ошибка при удалении скидки {id}");
            }
        }
    }
}
