using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using backend.Services.Interfaces;

namespace backend.Services
{
    public class PriceHistoryService : IPriceHistoryService
    {
        private readonly DBContext _context;

        public PriceHistoryService(DBContext context)
        {
            _context = context;
        }

        public async Task<List<PriceDiscountHistory>> GetHistoryForProductAsync(int productId)
        {
            return await _context.PriceDiscountHistories
                .Where(h => h.product_id == productId)
                .OrderByDescending(h => h.changed_at)
                .ToListAsync();
        }

        public async Task<PriceDiscountHistory> AddHistoryAsync(int productId, decimal oldPrice, decimal newPrice,
            decimal oldDiscount, decimal newDiscount, int changedByUserId)
        {
            var history = new PriceDiscountHistory
            {
                product_id = productId,
                old_price = oldPrice,
                new_price = newPrice,
                old_discount = oldDiscount,
                new_discount = newDiscount,
                changed_at = DateTime.UtcNow,
                changed_by = changedByUserId
            };

            _context.PriceDiscountHistories.Add(history);
            await _context.SaveChangesAsync();
            return history;
        }

        public async Task<PriceDiscountHistory?> RecordPriceChangeAsync(
            int productId,
            decimal? oldPrice,
            decimal? newPrice,
            decimal? oldDiscount,
            decimal? newDiscount,
            int changedByUserId)
        {
            // Если ничего не изменилось — не пишем историю
            if (oldPrice == newPrice && oldDiscount == newDiscount)
                return null;

            // Получаем текущие значения из БД, если не переданы
            if (!oldPrice.HasValue || !oldDiscount.HasValue)
            {
                var product = await _context.Products
                    .FirstOrDefaultAsync(p => p.id == productId);
                
                if (product != null)
                {
                    oldPrice ??= (decimal)product.price;
                }

                var activeDiscount = await _context.Discounts
                    .Where(d => d.product_id == productId && !d.deleted)
                    .OrderByDescending(d => d.created_at)
                    .FirstOrDefaultAsync();
                
                oldDiscount ??= activeDiscount?.size ?? 0;
            }

            var history = new PriceDiscountHistory
            {
                product_id = productId,
                old_price = oldPrice ?? 0,
                new_price = newPrice ?? oldPrice ?? 0,
                old_discount = oldDiscount ?? 0,
                new_discount = newDiscount ?? oldDiscount ?? 0,
                changed_at = DateTime.UtcNow,
                changed_by = changedByUserId
            };

            _context.PriceDiscountHistories.Add(history);
            await _context.SaveChangesAsync();
            return history;
        }

        public async Task<bool> DeleteByIdAsync(int historyId)
        {
            var history = await _context.PriceDiscountHistories.FindAsync(historyId);
            if (history == null)
                return false;

            _context.PriceDiscountHistories.Remove(history);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}