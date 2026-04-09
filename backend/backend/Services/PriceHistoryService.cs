using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

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