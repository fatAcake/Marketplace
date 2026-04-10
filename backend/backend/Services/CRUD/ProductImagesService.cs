using backend.Data;
using backend.DTO;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CRUD
{
    public class ProductImagesService : IProductImagesService
    {
        private readonly DBContext _db;
        private readonly ILogger<ProductImagesService> _logger;

        public ProductImagesService(DBContext db, ILogger<ProductImagesService> logger)
        {
            _db = db;
            _logger = logger;
        }

        public async Task<List<ProductImageDto>> GetImagesAsync(int productId)
        {
            var productExists = await _db.Products
                .AnyAsync(p => p.id == productId && !p.deleted);

            if (!productExists)
                throw new KeyNotFoundException("Продукт не найден");

            return await _db.ProductImages
                .AsNoTracking()
                .Where(pi => pi.product_id == productId)
                .OrderBy(pi => pi.order)
                .Select(pi => new ProductImageDto
                {
                    Id = pi.id,
                    ProductId = pi.product_id,
                    ContentType = pi.content_type,
                    Order = pi.order,
                    CreatedAt = pi.created_at
                })
                .ToListAsync();
        }

        public async Task<(byte[] data, string contentType)?> GetImageByIdAsync(int productId, int imageId)
        {
            var image = await _db.ProductImages
                .AsNoTracking()
                .FirstOrDefaultAsync(pi => pi.id == imageId && pi.product_id == productId);

            if (image == null)
                return null;

            return (image.image_data, image.content_type);
        }

        public async Task<ProductImageDto> AddImageAsync(int productId, IFormFile image, int userId, int order)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.id == productId && !p.deleted);

            if (product == null)
                throw new KeyNotFoundException("Продукт не найден");

            if (product.user_id != userId)
                throw new UnauthorizedAccessException("Вы не являетесь владельцем этого продукта");

            // Определяем content_type
            var contentType = image.ContentType;
            if (string.IsNullOrEmpty(contentType) || !contentType.StartsWith("image/"))
                contentType = "image/jpeg";

            using var ms = new MemoryStream();
            await image.CopyToAsync(ms);

            var productImage = new ProductImage
            {
                product_id = productId,
                image_data = ms.ToArray(),
                content_type = contentType,
                order = order,
                created_at = DateTime.UtcNow
            };

            _db.ProductImages.Add(productImage);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Картинка добавлена: ImageId={ImageId}, ProductId={ProductId}, пользователь: {UserId}, порядок: {Order}",
                productImage.id, productId, userId, order);

            return new ProductImageDto
            {
                Id = productImage.id,
                ProductId = productImage.product_id,
                ContentType = productImage.content_type,
                Order = productImage.order,
                CreatedAt = productImage.created_at
            };
        }

        public async Task<bool> DeleteImageAsync(int productId, int imageId, int userId)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.id == productId && !p.deleted);

            if (product == null)
                throw new KeyNotFoundException("Продукт не найден");

            if (product.user_id != userId)
                throw new UnauthorizedAccessException("Вы не являетесь владельцем этого продукта");

            var image = await _db.ProductImages
                .FirstOrDefaultAsync(pi => pi.id == imageId && pi.product_id == productId);

            if (image == null)
                return false;

            _db.ProductImages.Remove(image);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Картинка удалена: ImageId={ImageId}, ProductId={ProductId}, пользователь: {UserId}",
                imageId, productId, userId);

            return true;
        }

        public async Task<bool> ReorderImagesAsync(int productId, List<int> imageIds, int userId)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.id == productId && !p.deleted);

            if (product == null)
                throw new KeyNotFoundException("Продукт не найден");

            if (product.user_id != userId)
                throw new UnauthorizedAccessException("Вы не являетесь владельцем этого продукта");

            var images = await _db.ProductImages
                .Where(pi => pi.product_id == productId && imageIds.Contains(pi.id))
                .ToListAsync();

            if (images.Count != imageIds.Count)
                return false;

            for (int i = 0; i < imageIds.Count; i++)
            {
                var image = images.First(img => img.id == imageIds[i]);
                image.order = i;
            }

            await _db.SaveChangesAsync();

            _logger.LogInformation("Порядок картинок изменён: ProductId={ProductId}, пользователь: {UserId}",
                productId, userId);

            return true;
        }
    }
}
