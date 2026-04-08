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
        private readonly ILogger<ProductsCrudService> _logger;

        public ProductsCrudService(DBContext db, IProductImagesService productImagesService, ILogger<ProductsCrudService> logger)
        {
            _db = db;
            _productImagesService = productImagesService;
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
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<List<UserProductInfo>> GetProductsByUserIdAsync(int userId)
        {
            return await _db.Products
                .AsNoTracking()
                .Include(p => p.User)
                .Where(p => !p.deleted && p.user_id == userId)
                .Select(p => new UserProductInfo
                {
                    ProductId = p.id,
                    Name = p.name,
                    Price = p.price,
                    Quantity = p.quantity,
                    Description = p.description,
                    SellerUserId = p.user_id,
                    NickName = p.User.nickname,
                    Email = p.User.email,
                    SellerStatus = p.User.status
                })
                .ToListAsync();
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
