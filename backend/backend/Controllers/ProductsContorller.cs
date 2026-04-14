using System.Security.Claims;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductsCrudService _productsCrudService;
        private readonly IProductImagesService _productImagesService;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(IProductsCrudService productsCrudService, IProductImagesService productImagesService, ILogger<ProductsController> logger)
        {
            _productsCrudService = productsCrudService;
            _productImagesService = productImagesService;
            _logger = logger;
        }

        [HttpGet]
        [AllowAnonymous]
        public async Task<IActionResult> GetAllProducts()
        {
            var products = await _productsCrudService.GetAllProductsAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productsCrudService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound(new { error = "Продукт не найден" });

            return Ok(product);
        }

        [HttpGet("users/{userId}/products")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductsByUserId(int userId)
        {
            var products = await _productsCrudService.GetProductsByUserIdAsync(userId);
            return Ok(products);
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateProduct([FromForm] CreateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var product = await _productsCrudService.CreateProductAsync(dto, userId);
                return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при создании продукта");
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] UpdateProductDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var product = await _productsCrudService.UpdateProductAsync(id, dto, userId);

                if (product == null)
                    return NotFound(new { error = "Продукт не найден" });

                return Ok(product);
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при обновлении продукта {ProductId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteProduct(int id)
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var result = await _productsCrudService.DeleteProductAsync(id, userId);

                if (!result)
                    return NotFound(new { error = "Продукт не найден" });

                return Ok(new { message = "Продукт удалён" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении продукта {ProductId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        #region ENDPOINTS ДЛЯ ИЗОБРАЖЕНИЙ
        [HttpGet("{id}/images")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductImages(int id)
        {
            try
            {
                var images = await _productImagesService.GetImagesAsync(id);
                return Ok(images);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Продукт не найден" });
            }
        }

        [HttpGet("{id}/images/{imageId}")]
        [AllowAnonymous]
        public async Task<IActionResult> GetProductImage(int id, int imageId)
        {
            var result = await _productImagesService.GetImageByIdAsync(id, imageId);
            if (result == null)
                return NotFound(new { error = "Изображение не найдено" });

            var (data, contentType) = result.Value;
            return File(data, contentType);
        }

        [HttpPost("{id}/images")]
        [Authorize]
        public async Task<IActionResult> AddProductImage(int id, IFormFile image)
        {
            if (image == null || image.Length == 0)
                return BadRequest(new { error = "Файл не передан" });

            // Проверка размера (макс 5МБ)
            if (image.Length > 5 * 1024 * 1024)
                return BadRequest(new { error = "Размер файла не должен превышать 5МБ" });

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                // Берём следующий order после последнего
                var existingImages = await _productImagesService.GetImagesAsync(id);
                var order = existingImages.Any() ? existingImages.Max(i => i.Order) + 1 : 0;

                var result = await _productImagesService.AddImageAsync(id, image, userId, order);
                return CreatedAtAction(nameof(GetProductImages), new { id }, result);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Продукт не найден" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при добавлении картинки к продукту {ProductId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpDelete("{id}/images/{imageId}")]
        [Authorize]
        public async Task<IActionResult> DeleteProductImage(int id, int imageId)
        {
            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var result = await _productImagesService.DeleteImageAsync(id, imageId, userId);

                if (!result)
                    return NotFound(new { error = "Изображение не найдено" });

                return Ok(new { message = "Изображение удалено" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Продукт не найден" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при удалении картинки {ImageId} из продукта {ProductId}", imageId, id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }

        [HttpPut("{id}/images/reorder")]
        [Authorize]
        public async Task<IActionResult> ReorderProductImages(int id, [FromBody] List<int> imageIds)
        {
            if (imageIds == null || imageIds.Count == 0)
                return BadRequest(new { error = "Список ID изображений пуст" });

            try
            {
                var userId = Methods.GetCurrentUserId(User);
                var result = await _productImagesService.ReorderImagesAsync(id, imageIds, userId);

                if (!result)
                    return BadRequest(new { error = "Не все изображения найдены" });

                return Ok(new { message = "Порядок изображений обновлён" });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Forbid(ex.Message);
            }
            catch (KeyNotFoundException)
            {
                return NotFound(new { error = "Продукт не найден" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Ошибка при изменении порядка картинок продукта {ProductId}", id);
                return StatusCode(500, new { error = "Внутренняя ошибка сервера" });
            }
        }
        #endregion
    }
}
