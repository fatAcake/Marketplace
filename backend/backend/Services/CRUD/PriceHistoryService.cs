using backend.Data;
using backend.DTO;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CRUD
{
    public class PriceHistoryService : IPriceHistoryService
    {
        private readonly DBContext _context;
        private readonly ILogger<PriceHistoryService> _logger;

        public PriceHistoryService(DBContext context, ILogger<PriceHistoryService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<PriceHistoryDto>> GetPriceHistoryAsync(int productId)
        {
            var history = await _context.PriceDiscountHistories
                .Where(ph => ph.product_id == productId)
                .Include(ph => ph.ChangedByUser)
                .OrderByDescending(ph => ph.changed_at)
                .ToListAsync();

            return history.Select(ph => new PriceHistoryDto
            {
                Id = ph.id,
                ProductId = ph.product_id,
                OldPrice = ph.old_price,
                NewPrice = ph.new_price,
                OldDiscount = ph.old_discount,
                NewDiscount = ph.new_discount,
                ChangedAt = ph.changed_at,
                ChangedBy = ph.changed_by,
                ChangedByNickname = ph.ChangedByUser?.nickname
            }).ToList();
        }

        public async Task<PriceHistoryDto> AddPriceHistoryAsync(int productId, decimal? newPrice, decimal? newDiscount, int? changedBy)
        {
            var product = await _context.Products
                .FirstOrDefaultAsync(p => p.id == productId && !p.deleted);

            if (product == null)
            {
                throw new InvalidOperationException("Товар не найден");
            }

            var historyEntry = new Models.PriceDiscountHistory
            {
                product_id = productId,
                old_price = null,
                new_price = newPrice,
                old_discount = null,
                new_discount = newDiscount,
                changed_at = DateTime.UtcNow,
                changed_by = changedBy
            };

            _context.PriceDiscountHistories.Add(historyEntry);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Запись истории цен добавлена для товара {ProductId}", productId);

            return new PriceHistoryDto
            {
                Id = historyEntry.id,
                ProductId = historyEntry.product_id,
                OldPrice = historyEntry.old_price,
                NewPrice = historyEntry.new_price,
                OldDiscount = historyEntry.old_discount,
                NewDiscount = historyEntry.new_discount,
                ChangedAt = historyEntry.changed_at,
                ChangedBy = historyEntry.changed_by
            };
        }

        public async Task RecordPriceChangeAsync(
            int productId,
            decimal? oldPrice,
            decimal? newPrice,
            decimal? oldDiscount,
            decimal? newDiscount,
            int? changedBy)
        {
            // Если ничего не изменилось, не записываем
            if (oldPrice == newPrice && oldDiscount == newDiscount)
            {
                return;
            }

            var historyEntry = new Models.PriceDiscountHistory
            {
                product_id = productId,
                old_price = oldPrice,
                new_price = newPrice,
                old_discount = oldDiscount,
                new_discount = newDiscount,
                changed_at = DateTime.UtcNow,
                changed_by = changedBy
            };

            _context.PriceDiscountHistories.Add(historyEntry);
            await _context.SaveChangesAsync();

            _logger.LogInformation(
                "Изменение цены записано: товар {ProductId}, цена {OldPrice}->{NewPrice}, скидка {OldDiscount}->{NewDiscount}",
                productId, oldPrice, newPrice, oldDiscount, newDiscount);
        }
    }
}
