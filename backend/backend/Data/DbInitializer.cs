using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data.Seed
{
    public static class DbInitializer
    {
        private static readonly string ImagesPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Data", "Seed", "Images");

        public static async Task InitializeAsync(DBContext context)
{
    await context.Database.EnsureCreatedAsync();
    
    Console.WriteLine("=== Начинаем заполнение БД ===");
    
    await SeedUsersAsync(context);
    Console.WriteLine($"Users: {await context.Users.CountAsync()}");
    
    await SeedProductsAsync(context);
    Console.WriteLine($"Products: {await context.Products.CountAsync()}");
    
    await SeedProductImagesAsync(context);
    Console.WriteLine($"ProductImages: {await context.ProductImages.CountAsync()}");
    
    await SeedDiscountsAsync(context);
    Console.WriteLine($"Discounts: {await context.Discounts.CountAsync()}");
    
    await SeedPriceHistoryAsync(context);
    Console.WriteLine($"PriceHistory: {await context.PriceDiscountHistories.CountAsync()}");
    
    await SeedOrdersAsync(context);
    Console.WriteLine($"Orders: {await context.Orders.CountAsync()}");
    
    Console.WriteLine("=== Заполнение БД завершено ===");
}
        private static async Task SeedUsersAsync(DBContext context)
        {
            if (await context.Users.AnyAsync())
                return;

            var users = new[]
            {
                new Users { nickname = "Seller_Ivan", email = "ivan.seller@mail.ru", password = "password123", status = "Saller", registration_date = DateTime.UtcNow },
                new Users { nickname = "Seller_Maria", email = "maria.shop@mail.ru", password = "password123", status = "Saller", registration_date = DateTime.UtcNow },
                new Users { nickname = "Buyer_Alex", email = "alex.buyer@mail.ru", password = "password123", status = "Buyer", registration_date = DateTime.UtcNow },
                new Users { nickname = "Buyer_Elena", email = "elena.customer@mail.ru", password = "password123", status = "Buyer", registration_date = DateTime.UtcNow }
            };

            await context.Users.AddRangeAsync(users);
            await context.SaveChangesAsync();
        }

        private static async Task SeedProductsAsync(DBContext context)
        {
            if (await context.Products.AnyAsync())
                return;

            // Получаем реальные ID продавцов
            var sellerIvan = await context.Users.FirstOrDefaultAsync(u => u.email == "ivan.seller@mail.ru");
            var sellerMaria = await context.Users.FirstOrDefaultAsync(u => u.email == "maria.shop@mail.ru");

            if (sellerIvan == null || sellerMaria == null)
                return;

            var products = new[]
            {
                new Products { name = "iPhone 15 Pro 256GB", price = 129990, quantity = 3, description = "Новый iPhone 15 Pro, черный титан, 256GB", user_id = sellerIvan.id },
                new Products { name = "MacBook Air M2", price = 89990, quantity = 2, description = "MacBook Air 13\" M2 8GB/256GB, серебристый", user_id = sellerIvan.id },
                new Products { name = "Sony WH-1000XM5", price = 24990, quantity = 5, description = "Наушники Sony с шумоподавлением, черные", user_id = sellerIvan.id },
                new Products { name = "Apple Watch Series 9", price = 44990, quantity = 4, description = "Apple Watch Series 9 GPS 45mm, алюминий", user_id = sellerIvan.id },
                new Products { name = "iPad Pro 11", price = 69990, quantity = 2, description = "iPad Pro 11\" M2 128GB WiFi, серый космос", user_id = sellerIvan.id },
                new Products { name = "Кроссовки Nike Air Max", price = 12990, quantity = 10, description = "Кроссовки Nike Air Max 270, размер 42-45", user_id = sellerMaria.id },
                new Products { name = "Куртка The North Face", price = 18990, quantity = 5, description = "Зимняя куртка The North Face, черная, размер M", user_id = sellerMaria.id },
                new Products { name = "Джинсы Levi's 501", price = 7990, quantity = 15, description = "Классические джинсы Levi's 501, синие", user_id = sellerMaria.id },
                new Products { name = "Футболка Adidas Originals", price = 3490, quantity = 20, description = "Футболка Adidas Trefoil, белая, размер S-XXL", user_id = sellerMaria.id },
                new Products { name = "Рюкзак Herschel Little America", price = 8990, quantity = 7, description = "Рюкзак Herschel 25л, серый", user_id = sellerMaria.id }
            };

            await context.Products.AddRangeAsync(products);
            await context.SaveChangesAsync();
        }

       private static async Task SeedProductImagesAsync(DBContext context)
{
    if (await context.ProductImages.AnyAsync())
        return;

    var products = await context.Products.ToListAsync();
    var imageNames = new[] { "iphone.jpg", "macbook.jpg", "sony.jpg", "watch.jpg", "ipad.jpg", "nike.jpg", "tnf.jpg", "levis.jpg", "adidas.jpg", "herschel.jpg" };

    // Логируем путь к папке
    Console.WriteLine($"=== ImagesPath: {ImagesPath} ===");
    Console.WriteLine($"=== Папка существует: {Directory.Exists(ImagesPath)} ===");
    
    if (Directory.Exists(ImagesPath))
    {
        var files = Directory.GetFiles(ImagesPath);
        Console.WriteLine($"=== Файлы в папке ({files.Length}): {string.Join(", ", files.Select(Path.GetFileName))} ===");
    }

    for (int i = 0; i < products.Count && i < imageNames.Length; i++)
    {
        var imagePath = Path.Combine(ImagesPath, imageNames[i]);
        
        Console.WriteLine($"Продукт {products[i].id} ({products[i].name}):");
        Console.WriteLine($"  Путь: {imagePath}");
        Console.WriteLine($"  Файл существует: {File.Exists(imagePath)}");
        
        byte[] imageData = Array.Empty<byte>();

        if (File.Exists(imagePath))
        {
            imageData = await File.ReadAllBytesAsync(imagePath);
            Console.WriteLine($"  Размер: {imageData.Length} байт");
        }
        else
        {
            Console.WriteLine($"  ❌ Файл не найден! Будет сохранён пустой массив");
        }

        var productImage = new ProductImage
        {
            product_id = products[i].id,
            image_data = imageData,
            content_type = "image/jpeg",
            order = 0,
            created_at = DateTime.UtcNow
        };

        await context.ProductImages.AddAsync(productImage);
    }

    await context.SaveChangesAsync();
    Console.WriteLine($"=== Сохранено изображений: {await context.ProductImages.CountAsync()} ===");
}

        private static async Task SeedDiscountsAsync(DBContext context)
        {
            if (await context.Discounts.AnyAsync())
                return;

            var products = await context.Products.ToListAsync();
            var now = DateTime.UtcNow;

            var discounts = new List<Discount>();

            if (products.Count >= 1)
                discounts.Add(new Discount { product_id = products[0].id, size = 10, start_date = now.AddDays(-5), end_date = now.AddDays(10) });
            if (products.Count >= 2)
                discounts.Add(new Discount { product_id = products[1].id, size = 15, start_date = now.AddDays(-2), end_date = now.AddDays(20) });
            if (products.Count >= 3)
                discounts.Add(new Discount { product_id = products[2].id, size = 5, start_date = now.AddDays(3), end_date = now.AddDays(15) });
            if (products.Count >= 6)
                discounts.Add(new Discount { product_id = products[5].id, size = 20, start_date = now.AddDays(-10), end_date = now.AddDays(5) });
            if (products.Count >= 7)
                discounts.Add(new Discount { product_id = products[6].id, size = 10, start_date = now.AddDays(-1), end_date = now.AddDays(14) });
            if (products.Count >= 9)
                discounts.Add(new Discount { product_id = products[8].id, size = 15, start_date = now.AddDays(7), end_date = now.AddDays(30) });

            await context.Discounts.AddRangeAsync(discounts);
            await context.SaveChangesAsync();
        }

        private static async Task SeedPriceHistoryAsync(DBContext context)
        {
            if (await context.PriceDiscountHistories.AnyAsync())
                return;

            var products = await context.Products.ToListAsync();
            var sellers = await context.Users.Where(u => u.status == "Saller").ToListAsync();
            var now = DateTime.UtcNow;

            var history = new List<PriceDiscountHistory>();

            if (products.Count >= 1 && sellers.Count >= 1)
            {
                history.Add(new PriceDiscountHistory { product_id = products[0].id, old_price = 139990, new_price = 129990, old_discount = 0, new_discount = 10, changed_at = now.AddDays(-5), changed_by = sellers[0].id });
                history.Add(new PriceDiscountHistory { product_id = products[0].id, old_price = 129990, new_price = 129990, old_discount = 10, new_discount = 10, changed_at = now.AddDays(-3), changed_by = sellers[0].id });
            }
            if (products.Count >= 2)
            {
                history.Add(new PriceDiscountHistory { product_id = products[1].id, old_price = 99990, new_price = 89990, old_discount = 0, new_discount = 15, changed_at = now.AddDays(-2), changed_by = sellers[0].id });
            }
            if (products.Count >= 6 && sellers.Count >= 2)
            {
                history.Add(new PriceDiscountHistory { product_id = products[5].id, old_price = 10990, new_price = 12990, old_discount = 0, new_discount = 20, changed_at = now.AddDays(-12), changed_by = sellers[1].id });
            }

            await context.PriceDiscountHistories.AddRangeAsync(history);
            await context.SaveChangesAsync();
        }

        private static async Task SeedOrdersAsync(DBContext context)
        {
            if (await context.Orders.AnyAsync())
                return;

            var buyerAlex = await context.Users.FirstOrDefaultAsync(u => u.email == "alex.buyer@mail.ru");
            var buyerElena = await context.Users.FirstOrDefaultAsync(u => u.email == "elena.customer@mail.ru");

            if (buyerAlex == null || buyerElena == null)
                return;

            var now = DateTime.UtcNow;

            var orders = new List<Orders>();

            // Заказы Alex
            for (int i = 0; i < 8; i++)
            {
                orders.Add(new Orders
                {
                    user_id = buyerAlex.id,
                    status = i == 3 ? "processing" : (i == 4 ? "pending" : (i == 6 ? "cancelled" : "delivered")),
                    total_sum = 0,
                    total_amount = 0,
                    created_at = now.AddDays(-30 + i * 3)
                });
            }

            // Заказы Elena
            for (int i = 0; i < 7; i++)
            {
                orders.Add(new Orders
                {
                    user_id = buyerElena.id,
                    status = i == 2 ? "processing" : (i == 3 ? "pending" : (i == 6 ? "shipped" : "delivered")),
                    total_sum = 0,
                    total_amount = 0,
                    created_at = now.AddDays(-28 + i * 4)
                });
            }

            await context.Orders.AddRangeAsync(orders);
            await context.SaveChangesAsync();
        }
    }
}