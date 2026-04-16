using backend.Data;
using backend.DTO;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CRUD
{
    public class DiscountsCrudService : IDiscountsCrudService
    {
        private readonly DBContext _context;
        private readonly ILogger<DiscountsCrudService> _logger;
        private readonly IPriceHistoryService _priceHistoryService;

        public DiscountsCrudService(DBContext context, ILogger<DiscountsCrudService> logger, IPriceHistoryService priceHistoryService)
        {
            _context = context;
            _logger = logger;
            _priceHistoryService = priceHistoryService;
        }

        public async Task<DiscountDto> CreateDiscountAsync(DiscountCreateDto dto, int userId)
        {
            // Проверка: только владелец товара может создать скидку
            await Methods.CheckProductOwnershipAsync(_context, dto.ProductId, userId, "создавать скидку");

            // Получаем старую скидку для истории
            var oldDiscount = await _context.Discounts
                .Where(d => d.product_id == dto.ProductId && !d.deleted)
                .OrderByDescending(d => d.created_at)
                .FirstOrDefaultAsync();

            var discount = new Discount
            {
                product_id = dto.ProductId,
                size = dto.Size,
                start_date = dto.StartDate?.UtcDateTime ?? DateTime.UtcNow,
                end_date = dto.EndDate?.UtcDateTime ?? DateTime.UtcNow.AddDays(30),
                created_at = DateTime.UtcNow
            };

            _context.Discounts.Add(discount);
            await _context.SaveChangesAsync();

            // Записываем изменение в историю
            await _priceHistoryService.RecordPriceChangeAsync(
                dto.ProductId,
                null, // цена не менялась
                null,
                oldDiscount?.size,
                dto.Size,
                userId
            );

            _logger.LogInformation("Скидка {DiscountId} создана для товара {ProductId}", discount.id, dto.ProductId);

            return MapToDto(discount);
        }

        public async Task<List<DiscountDto>> GetAllDiscountsAsync()
        {
            var discounts = await _context.Discounts
                .Where(d => !d.deleted)
                .OrderByDescending(d => d.created_at)
                .ToListAsync();

            return discounts.Select(MapToDto).ToList();
        }

        public async Task<DiscountDto?> GetDiscountByIdAsync(int id)
        {
            var discount = await _context.Discounts
                .FirstOrDefaultAsync(d => d.id == id && !d.deleted);

            if (discount == null) return null;

            return MapToDto(discount);
        }

        public async Task<List<DiscountDto>> GetDiscountsByProductIdAsync(int productId)
        {
            var discounts = await _context.Discounts
                .Where(d => d.product_id == productId && !d.deleted)
                .OrderByDescending(d => d.created_at)
                .ToListAsync();

            return discounts.Select(MapToDto).ToList();
        }

        public async Task<DiscountDto?> UpdateDiscountAsync(int id, DiscountUpdateDto dto, int userId)
        {
            var discount = await _context.Discounts
                .FirstOrDefaultAsync(d => d.id == id && !d.deleted);

            if (discount == null) return null;

            // Проверка: только владелец товара может обновить скидку
            await Methods.CheckProductOwnershipAsync(_context, discount.product_id, userId, "обновлять скидку");

            var oldDiscount = discount.size;

            if (dto.Size.HasValue) discount.size = dto.Size.Value;
            if (dto.StartDate.HasValue) discount.start_date = dto.StartDate.Value.UtcDateTime;
            if (dto.EndDate.HasValue) discount.end_date = dto.EndDate.Value.UtcDateTime;

            discount.edited_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Записываем изменение в историю
            await _priceHistoryService.RecordPriceChangeAsync(
                discount.product_id,
                null,
                null,
                oldDiscount,
                discount.size,
                userId
            );

            _logger.LogInformation("Скидка {DiscountId} обновлена", id);

            return MapToDto(discount);
        }

        public async Task<bool> DeleteDiscountAsync(int id, int userId)
        {
            var discount = await _context.Discounts
                .FirstOrDefaultAsync(d => d.id == id && !d.deleted);

            if (discount == null) return false;

            // Проверка: только владелец товара может удалить скидку
            await Methods.CheckProductOwnershipAsync(_context, discount.product_id, userId, "удалять скидку");

            var oldDiscount = discount.size;

            discount.deleted = true;
            discount.deleted_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Записываем изменение в историю
            await _priceHistoryService.RecordPriceChangeAsync(
                discount.product_id,
                null,
                null,
                oldDiscount,
                null,
                userId
            );

            _logger.LogInformation("Скидка {DiscountId} удалена", id);

            return true;
        }

        public async Task<Discount?> GetActiveDiscountForProductAsync(int productId)
        {
            return await _context.Discounts
                .Where(d => d.product_id == productId
                    && !d.deleted
                    && d.start_date <= DateTime.UtcNow
                    && d.end_date >= DateTime.UtcNow)
                .OrderByDescending(d => d.created_at)
                .FirstOrDefaultAsync();
        }

        private DiscountDto MapToDto(Discount discount)
        {
            return new DiscountDto
            {
                Id = discount.id,
                ProductId = discount.product_id,
                Size = discount.size,
                StartDate = discount.start_date.HasValue ? new DateTimeOffset(discount.start_date.Value) : null,
                EndDate = discount.end_date.HasValue ? new DateTimeOffset(discount.end_date.Value) : null
            };
        }
    }
}
