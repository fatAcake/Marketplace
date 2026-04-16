using System.Security.Claims;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class OrdersController : BaseApiController
    {
        private readonly IOrdersCrudService _ordersService;
        private readonly ILogger<OrdersController> _logger;

        public OrdersController(IOrdersCrudService ordersService, ILogger<OrdersController> logger)
        {
            _ordersService = ordersService;
            _logger = logger;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateOrder([FromBody] OrderCreateDto dto)
        {
            var validation = ValidateModelState();
            if (validation != null) return validation;

            if (dto.Items == null || dto.Items.Count == 0)
                return BadRequestError("Заказ должен содержать хотя бы один товар");

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var order = await _ordersService.CreateOrderAsync(dto, userId);
                return CreatedAtAction(nameof(GetOrder), new { id = order.Id }, order);
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
                return HandleException(ex, _logger, "Ошибка при создании заказа");
            }
        }

        [HttpGet]
        [Authorize]
        public async Task<IActionResult> GetUserOrders()
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var orders = await _ordersService.GetUserOrdersAsync(userId);
                return Ok(orders);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, "Ошибка при получении заказов пользователя");
            }
        }

        [HttpGet("{id}")]
        [Authorize]
        public async Task<IActionResult> GetOrder(int id)
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var order = await _ordersService.GetOrderByIdAsync(id, userId);

                if (order == null)
                    return NotFoundError("Заказ не найден");

                return Ok(order);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                return HandleException(ex, _logger, $"Ошибка при получении заказа {id}");
            }
        }

        [HttpPut("{id}/status")]
        [Authorize]
        public async Task<IActionResult> UpdateOrderStatus(int id, [FromBody] OrderStatusUpdateDto dto)
        {
            var validation = ValidateModelState();
            if (validation != null) return validation;

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var order = await _ordersService.UpdateOrderStatusAsync(id, dto.Status, userId);
                return Ok(order);
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
                return HandleException(ex, _logger, $"Ошибка при обновлении статуса заказа {id}");
            }
        }
    }
}
