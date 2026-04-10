using backend.Data;
using backend.DTO;
using backend.Models;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace backend.Services.CRUD
{
    public class OrdersCrudService : IOrdersCrudService
    {
        private readonly DBContext _context;
        private readonly ILogger<OrdersCrudService> _logger;

        public OrdersCrudService(DBContext context, ILogger<OrdersCrudService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<OrderDto> CreateOrderAsync(OrderCreateDto dto, int userId)
        {
            using var transaction = await _context.Database.BeginTransactionAsync();

            try
            {
                // Проверка: пользователь не может купить свой товар
                var productIds = dto.Items.Select(i => i.ProductId).ToList();
                var userProducts = await _context.Products
                    .Where(p => productIds.Contains(p.id) && p.user_id == userId && !p.deleted)
                    .ToListAsync();

                if (userProducts.Any())
                {
                    throw new InvalidOperationException("Нельзя купить собственный товар");
                }

                // Получаем товары для расчета
                var products = await _context.Products
                    .Where(p => productIds.Contains(p.id) && !p.deleted)
                    .ToListAsync();

                if (products.Count != productIds.Count)
                {
                    throw new InvalidOperationException("Некоторые товары не найдены или удалены");
                }

                // Проверяем количество и группируем по продавцу
                var orderItems = new List<OrderItem>();
                decimal totalSum = 0;
                int totalAmount = 0;

                foreach (var itemDto in dto.Items)
                {
                    var product = products.First(p => p.id == itemDto.ProductId);

                    if (product.quantity < itemDto.Quantity)
                    {
                        throw new InvalidOperationException($"Недостаточно товара '{product.name}'. Доступно: {product.quantity}");
                    }

                    // Получаем активную скидку
                    decimal? discount = null;
                    var activeDiscount = await _context.Discounts
                        .Where(d => d.product_id == product.id
                            && !d.deleted
                            && d.start_date <= DateTime.UtcNow
                            && d.end_date >= DateTime.UtcNow)
                        .OrderByDescending(d => d.created_at)
                        .FirstOrDefaultAsync();

                    decimal finalPrice = (decimal)product.price;
                    if (activeDiscount != null && activeDiscount.size.HasValue)
                    {
                        discount = activeDiscount.size.Value;
                        finalPrice = finalPrice * (1 - discount.Value / 100);
                    }

                    var orderItem = new OrderItem
                    {
                        product_id = product.id,
                        seller_id = product.user_id,
                        quantity = itemDto.Quantity,
                        price_at_buy = (decimal)product.price,
                        discount_at_buy = discount,
                        final_price_at_buy = finalPrice,
                        name_at_buy = product.name
                    };

                    orderItems.Add(orderItem);
                    totalSum += finalPrice * itemDto.Quantity;
                    totalAmount += itemDto.Quantity;

                    // Уменьшаем количество товара
                    product.quantity -= itemDto.Quantity;
                }

                // Создаем заказ
                var order = new Orders
                {
                    user_id = userId,
                    status = "Pending",
                    total_sum = totalSum,
                    total_amount = totalAmount,
                    created_at = DateTime.UtcNow,
                    OrderItems = orderItems
                };

                _context.Orders.Add(order);
                await _context.SaveChangesAsync();

                await transaction.CommitAsync();

                _logger.LogInformation("Заказ {OrderId} создан пользователем {UserId}", order.id, userId);

                return await MapToDtoAsync(order.id);
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        public async Task<List<OrderDto>> GetUserOrdersAsync(int userId)
        {
            var orders = await _context.Orders
                .Where(o => o.user_id == userId && !o.deleted)
                .OrderByDescending(o => o.created_at)
                .ToListAsync();

            return orders.Select(o => new OrderDto
            {
                Id = o.id,
                UserId = o.user_id,
                OrderStatus = o.status,
                TotalSum = o.total_sum,
                TotalProducts = o.total_amount,
                CreatedAt = o.created_at,
                EditedAt = o.edited_at
            }).ToList();
        }

        public async Task<OrderDto?> GetOrderByIdAsync(int orderId, int userId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstOrDefaultAsync(o => o.id == orderId && !o.deleted);

            if (order == null) return null;

            // Проверка прав: только покупатель или продавец из заказа может видеть
            var isBuyer = order.user_id == userId;
            var isSeller = order.OrderItems.Any(oi => oi.seller_id == userId);

            if (!isBuyer && !isSeller)
            {
                throw new UnauthorizedAccessException("Нет прав для просмотра этого заказа");
            }

            return await MapToDtoAsync(orderId);
        }

        public async Task<OrderDto> UpdateOrderStatusAsync(int orderId, string status, int userId)
        {
            var order = await _context.Orders
                .FirstOrDefaultAsync(o => o.id == orderId && !o.deleted);

            if (order == null)
            {
                throw new InvalidOperationException("Заказ не найден");
            }

            // Только покупатель может менять статус
            if (order.user_id != userId)
            {
                throw new UnauthorizedAccessException("Только покупатель может менять статус заказа");
            }

            var allowedStatuses = new[] { "Pending", "Processing", "Shipped", "Delivered", "Cancelled" };
            if (!allowedStatuses.Contains(status))
            {
                throw new InvalidOperationException("Недопустимый статус");
            }

            order.status = status;
            order.edited_at = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            _logger.LogInformation("Статус заказа {OrderId} изменен на {Status}", orderId, status);

            return await MapToDtoAsync(orderId);
        }

        public async Task<List<SellerOrderInfo>> GetSellerSalesAsync(int sellerId)
        {
            var orderItems = await _context.OrderItems
                .Include(oi => oi.Order)
                .ThenInclude(o => o.User)
                .Where(oi => oi.seller_id == sellerId)
                .OrderByDescending(oi => oi.Order.created_at)
                .ToListAsync();

            return orderItems.Select(oi => new SellerOrderInfo
            {
                OrderId = oi.order_id,
                OrderStatus = oi.Order.status,
                CreatedAt = oi.Order.created_at,
                BuyerId = oi.Order.user_id,
                BuyerNickName = oi.Order.User.nickname,
                BuyerEmail = oi.Order.User.email,
                OrderItemId = oi.id,
                ProductId = oi.product_id,
                ProductName = oi.name_at_buy,
                Quantity = oi.quantity,
                PriceAtBuy = oi.price_at_buy,
                DiscountAtBuy = oi.discount_at_buy,
                FinalPriceAtBuy = oi.final_price_at_buy
            }).ToList();
        }

        private async Task<OrderDto> MapToDtoAsync(int orderId)
        {
            var order = await _context.Orders
                .Include(o => o.OrderItems)
                .FirstAsync(o => o.id == orderId);

            return new OrderDto
            {
                Id = order.id,
                UserId = order.user_id,
                OrderStatus = order.status,
                TotalSum = order.total_sum,
                TotalProducts = order.total_amount,
                CreatedAt = order.created_at,
                EditedAt = order.edited_at,
                Items = order.OrderItems.Select(oi => new OrderItemDto
                {
                    Id = oi.id,
                    ProductId = oi.product_id,
                    OrderId = oi.order_id,
                    SellerId = oi.seller_id,
                    ProductName = oi.name_at_buy,
                    Quantity = oi.quantity,
                    PriceAtBuy = oi.price_at_buy,
                    DiscountAtBuy = oi.discount_at_buy,
                    FinalPriceAtBuy = oi.final_price_at_buy
                }).ToList()
            };
        }
    }
}
