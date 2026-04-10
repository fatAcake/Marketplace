using backend.Data;
using backend.DTO;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CRUD
{
    public class ProductsCrudService : IProductsCrudService
    {
        private readonly DBContext _db;
        private readonly IProductImagesService _productImagesService;
        private readonly IPriceHistoryService _priceHistoryService;
        private readonly ILogger<ProductsCrudService> _logger;

        public ProductsCrudService(DBContext db, IProductImagesService productImagesService, IPriceHistoryService priceHistoryService, ILogger<ProductsCrudService> logger)
        {
            _db = db;
            _productImagesService = productImagesService;
            _priceHistoryService = priceHistoryService;
            _logger = logger;
        }

        public async Task<List<ProductDto>> GetAllProductsAsync()
        {
            return await _db.Products
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => !p.deleted)
                .Select(p => new ProductDto
                {
                    Id = p.id,
                    Name = p.name,
                    Price = p.price,
                    Quantity = p.quantity,
                    Description = p.description,
                    UserId = p.user_id,
                    SellerNickName = p.User.nickname,
                    SellerEmail = p.User.email
                })
                .ToListAsync();
        }

        public async Task<ProductDto?> GetProductByIdAsync(int id)
        {
            var product = await _db.Products
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => !p.deleted)
                .FirstOrDefaultAsync(p => p.id == id);

            if (product == null) return null;

            // Проверяем активную скидку
            var now = DateTime.UtcNow;
            var activeDiscount = await _db.Discounts
                .AsNoTracking()
                .Where(d => d.product_id == product.id
                    && !d.deleted
                    && (d.start_date == null || d.start_date <= now)
                    && (d.end_date == null || d.end_date >= now))
                .FirstOrDefaultAsync();

            decimal? discountSize = activeDiscount?.size;
            float? discountedPrice = null;
            if (discountSize.HasValue && discountSize > 0)
            {
                discountedPrice = (float)(product.price * (1 - (double)discountSize.Value / 100));
            }

            return new ProductDto
            {
                Id = product.id,
                Name = product.name,
                Price = product.price,
                Quantity = product.quantity,
                Description = product.description,
                UserId = product.user_id,
                SellerNickName = product.User.nickname,
                SellerEmail = product.User.email,
                DiscountSize = discountSize,
                DiscountStartDate = activeDiscount?.start_date,
                DiscountEndDate = activeDiscount?.end_date,
                DiscountedPrice = discountedPrice
            };
        }

        public async Task<List<UserProductInfo>> GetProductsByUserIdAsync(int userId)
        {
            var products = await _db.Products
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => !p.deleted && p.user_id == userId)
                .ToListAsync();

            var now = DateTime.UtcNow;
            var result = new List<UserProductInfo>();

            foreach (var p in products)
            {
                var activeDiscount = await _db.Discounts
                    .AsNoTracking()
                    .Where(d => d.product_id == p.id
                        && !d.deleted
                        && (d.start_date == null || d.start_date <= now)
                        && (d.end_date == null || d.end_date >= now))
                    .FirstOrDefaultAsync();

                decimal? discountSize = activeDiscount?.size;
                float? discountedPrice = null;
                if (discountSize.HasValue && discountSize > 0)
                {
                    discountedPrice = (float)(p.price * (1 - (double)discountSize.Value / 100));
                }

                result.Add(new UserProductInfo
                {
                    ProductId = p.id,
                    Name = p.name,
                    Price = p.price,
                    Quantity = p.quantity,
                    Description = p.description,
                    DiscountSize = discountSize,
                    DiscountedPrice = discountedPrice,
                    SellerUserId = p.user_id,
                    NickName = p.User.nickname,
                    Email = p.User.email,
                    SellerStatus = p.User.status
                });
            }

            return result;
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto dto, int userId)
        {
            var user = await _db.Users.FindAsync(userId);
            if (user == null)
                throw new InvalidOperationException("Пользователь не найден");

            if (user.status != "Saller")
            {
                user.status = "Saller";
                user.edited_at = DateTime.UtcNow;
            }

            var product = new Products
            {
                name = dto.Name,
                price = dto.Price,
                quantity = dto.Quantity,
                description = dto.Description,
                user_id = userId,
                edited_at = null,
                deleted_at = null,
                deleted = false
            };

            _db.Products.Add(product);
            await _db.SaveChangesAsync();

            // Сохраняем все переданные картинки
            for (int i = 0; i < dto.Images.Length; i++)
            {
                var image = dto.Images[i];
                if (image != null && image.Length > 0)
                {
                    await _productImagesService.AddImageAsync(product.id, image, userId, i);
                }
            }

            _logger.LogInformation("Продукт создан: {ProductId}, пользователь: {UserId}, название: {Name}, картинок: {ImagesCount}",
                product.id, userId, product.name, dto.Images.Length);

            return new ProductDto
            {
                Id = product.id,
                Name = product.name,
                Price = product.price,
                Quantity = product.quantity,
                Description = product.description,
                UserId = product.user_id,
                SellerNickName = user.nickname,
                SellerEmail = user.email
            };
        }

        public async Task<ProductDto?> UpdateProductAsync(int id, UpdateProductDto dto, int userId)
        {
            var product = await _db.Products
                .Include(p => p.User)
                .FirstOrDefaultAsync(p => p.id == id && !p.deleted);

            if (product == null)
                return null;

            if (product.user_id != userId)
                throw new UnauthorizedAccessException("Вы не являетесь владельцем этого продукта");

            // Сохраняем старые значения для истории
            var oldPrice = dto.Price.HasValue ? (decimal?)product.price : null;
            var newPrice = dto.Price.HasValue ? (decimal?)dto.Price.Value : null;

            // Получаем текущую активную скидку
            var currentDiscount = await _db.Discounts
                .Where(d => d.product_id == product.id && !d.deleted)
                .OrderByDescending(d => d.created_at)
                .FirstOrDefaultAsync();

            var oldDiscount = currentDiscount?.size;

            // Определяем новый размер скидки
            decimal? newDiscount = null;
            bool discountChanged = false;

            if (dto.DiscountSize.HasValue || dto.DiscountStartDate.HasValue || dto.DiscountEndDate.HasValue)
            {
                discountChanged = true;
                newDiscount = dto.DiscountSize ?? currentDiscount?.size;

                // Обновляем или создаём скидку
                if (currentDiscount != null)
                {
                    currentDiscount.size = dto.DiscountSize ?? currentDiscount.size;
                    currentDiscount.start_date = dto.DiscountStartDate?.UtcDateTime ?? currentDiscount.start_date;
                    currentDiscount.end_date = dto.DiscountEndDate?.UtcDateTime ?? currentDiscount.end_date;
                    currentDiscount.edited_at = DateTime.UtcNow;
                }
                else
                {
                    // Создаём новую скидку
                    var newDiscountEntity = new Discount
                    {
                        product_id = product.id,
                        size = dto.DiscountSize ?? 0,
                        start_date = dto.DiscountStartDate?.UtcDateTime ?? DateTime.UtcNow,
                        end_date = dto.DiscountEndDate?.UtcDateTime ?? DateTime.UtcNow.AddDays(30),
                        created_at = DateTime.UtcNow
                    };
                    _db.Discounts.Add(newDiscountEntity);
                }
            }

            // Обновляем только переданные поля
            if (!string.IsNullOrEmpty(dto.Name))
                product.name = dto.Name;
            if (dto.Price.HasValue)
                product.price = dto.Price.Value;
            if (dto.Quantity.HasValue)
                product.quantity = dto.Quantity.Value;
            if (!string.IsNullOrEmpty(dto.Description))
                product.description = dto.Description;

            product.edited_at = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            // Записываем изменение цены и/или скидки в историю
            if (dto.Price.HasValue || discountChanged)
            {
                await _priceHistoryService.RecordPriceChangeAsync(
                    product.id,
                    oldPrice,
                    newPrice,
                    oldDiscount,
                    discountChanged ? newDiscount : oldDiscount,
                    userId
                );
            }

            _logger.LogInformation("Продукт обновлён: {ProductId}, пользователь: {UserId}", id, userId);

            return new ProductDto
            {
                Id = product.id,
                Name = product.name,
                Price = product.price,
                Quantity = product.quantity,
                Description = product.description,
                UserId = product.user_id,
                SellerNickName = product.User.nickname,
                SellerEmail = product.User.email
            };
        }

        public async Task<bool> DeleteProductAsync(int id, int userId)
        {
            var product = await _db.Products
                .FirstOrDefaultAsync(p => p.id == id && !p.deleted);

            if (product == null)
                return false;

            // Проверка владельца
            if (product.user_id != userId)
                throw new UnauthorizedAccessException("Вы не являетесь владельцем этого продукта");

            // Soft delete
            product.deleted = true;
            product.deleted_at = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation("Продукт удалён (soft delete): {ProductId}, пользователь: {UserId}", id, userId);

            return true;
        }
    }
}
