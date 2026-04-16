using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace backend.Seeders
{
    public static class DataSeeder
    {
        public static async Task SeedAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var context = scope.ServiceProvider.GetRequiredService<DBContext>();

            // Проверяем, есть ли уже данные
            if (await context.Users.AnyAsync())
            {
                return; // Данные уже существуют
            }

            // Хешируем пароли
            var passwordHasher = new PasswordHasher<Users>();
            var seller1Password = passwordHasher.HashPassword(null, "seller123");
            var seller2Password = passwordHasher.HashPassword(null, "seller456");
            var buyer1Password = passwordHasher.HashPassword(null, "buyer789");
            var buyer2Password = passwordHasher.HashPassword(null, "buyer012");

            // Создаём пользователей
            var seller1 = new Users
            {
                nickname = "TechSeller",
                email = "techseller@marketplace.com",
                password = seller1Password,
                status = "Saller",
                registration_date = DateTime.UtcNow.AddDays(-30)
            };

            var seller2 = new Users
            {
                nickname = "GameDealer",
                email = "gamedealer@marketplace.com",
                password = seller2Password,
                status = "Saller",
                registration_date = DateTime.UtcNow.AddDays(-25)
            };

            var buyer1 = new Users
            {
                nickname = "PlayerOne",
                email = "playerone@marketplace.com",
                password = buyer1Password,
                status = "Buyer",
                registration_date = DateTime.UtcNow.AddDays(-20)
            };

            var buyer2 = new Users
            {
                nickname = "GamerPro",
                email = "gamerpro@marketplace.com",
                password = buyer2Password,
                status = "Buyer",
                registration_date = DateTime.UtcNow.AddDays(-15)
            };

            context.Users.AddRange(seller1, seller2, buyer1, buyer2);
            await context.SaveChangesAsync();

            // Создаём продукты
            var products = new List<Products>();

            // Продукты от seller1
            products.Add(new Products
            {
                name = "Steam VR",
                price = 15999.99f,
                quantity = 10,
                user_id = seller1.id,
                description = "Система виртуальной реальности Steam VR для погружения в мир игр",
                edited_at = DateTime.UtcNow.AddDays(-5)
            });

            products.Add(new Products
            {
                name = "Steam Deck",
                price = 49999.99f,
                quantity = 5,
                user_id = seller1.id,
                description = "Портативная игровая консоль Steam Deck от Valve",
                edited_at = DateTime.UtcNow.AddDays(-3)
            });

            products.Add(new Products
            {
                name = "PlayStation 5",
                price = 54999.99f,
                quantity = 8,
                user_id = seller1.id,
                description = "Игровая консоль нового поколения Sony PlayStation 5",
                edited_at = DateTime.UtcNow.AddDays(-2)
            });

            products.Add(new Products
            {
                name = "Xbox Series X",
                price = 49999.99f,
                quantity = 12,
                user_id = seller1.id,
                description = "Флагманская игровая консоль Microsoft Xbox Series X",
                edited_at = DateTime.UtcNow.AddDays(-1)
            });

            // Продукты от seller2
            products.Add(new Products
            {
                name = "PSP",
                price = 8999.99f,
                quantity = 15,
                user_id = seller2.id,
                description = "Портативная игровая консоль Sony PlayStation Portable",
                edited_at = DateTime.UtcNow.AddDays(-10)
            });

            products.Add(new Products
            {
                name = "Xbox One",
                price = 24999.99f,
                quantity = 7,
                user_id = seller2.id,
                description = "Игровая консоль Microsoft Xbox One",
                edited_at = DateTime.UtcNow.AddDays(-8)
            });

            products.Add(new Products
            {
                name = "Xbox 360",
                price = 12999.99f,
                quantity = 20,
                user_id = seller2.id,
                description = "Классическая игровая консоль Microsoft Xbox 360",
                edited_at = DateTime.UtcNow.AddDays(-7)
            });

            products.Add(new Products
            {
                name = "PlayStation One",
                price = 6999.99f,
                quantity = 10,
                user_id = seller2.id,
                description = "Легендарная игровая консоль Sony PlayStation классическая",
                edited_at = DateTime.UtcNow.AddDays(-6)
            });

            products.Add(new Products
            {
                name = "Game Boy",
                price = 4999.99f,
                quantity = 25,
                user_id = seller2.id,
                description = "Классическая портативная игровая консоль Nintendo Game Boy",
                edited_at = DateTime.UtcNow.AddDays(-4)
            });

            products.Add(new Products
            {
                name = "Nintendo Switch 2",
                price = 39999.99f,
                quantity = 6,
                user_id = seller2.id,
                description = "Новейшая гибридная игровая консоль Nintendo Switch 2",
                edited_at = DateTime.UtcNow.AddDays(-1)
            });

            context.Products.AddRange(products);
            await context.SaveChangesAsync();

            // Загружаем изображения и привязываем к продуктам
            var imagesFolder = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "..", "..", "..", "Images");
            var imageFiles = Directory.GetFiles(imagesFolder, "*.jpg");

            for (int i = 0; i < products.Count && i < imageFiles.Length; i++)
            {
                var product = products[i];
                var imagePath = imageFiles[i];
                var imageBytes = await File.ReadAllBytesAsync(imagePath);

                var productImage = new ProductImage
                {
                    product_id = product.id,
                    image_data = imageBytes,
                    content_type = "image/jpeg",
                    order = 1,
                    created_at = DateTime.UtcNow
                };

                context.ProductImages.Add(productImage);
            }

            await context.SaveChangesAsync();

            // Создаём скидки для некоторых продуктов
            var discounts = new List<Discount>();

            discounts.Add(new Discount
            {
                product_id = products[0].id, // Steam VR
                size = 15.00m,
                start_date = DateTime.UtcNow.AddDays(-10),
                end_date = DateTime.UtcNow.AddDays(20),
                created_at = DateTime.UtcNow.AddDays(-10)
            });

            discounts.Add(new Discount
            {
                product_id = products[1].id, // Steam Deck
                size = 10.00m,
                start_date = DateTime.UtcNow.AddDays(-5),
                end_date = DateTime.UtcNow.AddDays(25),
                created_at = DateTime.UtcNow.AddDays(-5)
            });

            discounts.Add(new Discount
            {
                product_id = products[2].id, // PlayStation 5
                size = 5.00m,
                start_date = DateTime.UtcNow.AddDays(-2),
                end_date = DateTime.UtcNow.AddDays(15),
                created_at = DateTime.UtcNow.AddDays(-2)
            });

            discounts.Add(new Discount
            {
                product_id = products[5].id, // Xbox One
                size = 20.00m,
                start_date = DateTime.UtcNow.AddDays(-8),
                end_date = DateTime.UtcNow.AddDays(10),
                created_at = DateTime.UtcNow.AddDays(-8)
            });

            discounts.Add(new Discount
            {
                product_id = products[9].id, // Nintendo Switch 2
                size = 8.00m,
                start_date = DateTime.UtcNow.AddDays(-1),
                end_date = DateTime.UtcNow.AddDays(30),
                created_at = DateTime.UtcNow.AddDays(-1)
            });

            context.Discounts.AddRange(discounts);
            await context.SaveChangesAsync();

            // Создаём историю изменения цен и скидок
            var priceHistories = new List<PriceDiscountHistory>();

            // Steam VR - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[0].id,
                old_price = 18999.99m,
                new_price = 17499.99m,
                old_discount = null,
                new_discount = 10.00m,
                changed_at = DateTime.UtcNow.AddDays(-20),
                changed_by = seller1.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[0].id,
                old_price = 17499.99m,
                new_price = 15999.99m,
                old_discount = 10.00m,
                new_discount = 15.00m,
                changed_at = DateTime.UtcNow.AddDays(-10),
                changed_by = seller1.id
            });

            // Steam Deck - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[1].id,
                old_price = 54999.99m,
                new_price = 52999.99m,
                old_discount = null,
                new_discount = 5.00m,
                changed_at = DateTime.UtcNow.AddDays(-15),
                changed_by = seller1.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[1].id,
                old_price = 52999.99m,
                new_price = 49999.99m,
                old_discount = 5.00m,
                new_discount = 10.00m,
                changed_at = DateTime.UtcNow.AddDays(-5),
                changed_by = seller1.id
            });

            // PlayStation 5 - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[2].id,
                old_price = 59999.99m,
                new_price = 57999.99m,
                old_discount = null,
                new_discount = 3.00m,
                changed_at = DateTime.UtcNow.AddDays(-12),
                changed_by = seller1.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[2].id,
                old_price = 57999.99m,
                new_price = 54999.99m,
                old_discount = 3.00m,
                new_discount = 5.00m,
                changed_at = DateTime.UtcNow.AddDays(-2),
                changed_by = seller1.id
            });

            // Xbox Series X - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[3].id,
                old_price = 54999.99m,
                new_price = 52499.99m,
                old_discount = null,
                new_discount = 5.00m,
                changed_at = DateTime.UtcNow.AddDays(-18),
                changed_by = seller1.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[3].id,
                old_price = 52499.99m,
                new_price = 49999.99m,
                old_discount = 5.00m,
                new_discount = null,
                changed_at = DateTime.UtcNow.AddDays(-1),
                changed_by = seller1.id
            });

            // PSP - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[4].id,
                old_price = 10999.99m,
                new_price = 9999.99m,
                old_discount = null,
                new_discount = null,
                changed_at = DateTime.UtcNow.AddDays(-25),
                changed_by = seller2.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[4].id,
                old_price = 9999.99m,
                new_price = 8999.99m,
                old_discount = null,
                new_discount = 8.00m,
                changed_at = DateTime.UtcNow.AddDays(-10),
                changed_by = seller2.id
            });

            // Xbox One - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[5].id,
                old_price = 29999.99m,
                new_price = 27999.99m,
                old_discount = 10.00m,
                new_discount = 15.00m,
                changed_at = DateTime.UtcNow.AddDays(-15),
                changed_by = seller2.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[5].id,
                old_price = 27999.99m,
                new_price = 24999.99m,
                old_discount = 15.00m,
                new_discount = 20.00m,
                changed_at = DateTime.UtcNow.AddDays(-8),
                changed_by = seller2.id
            });

            // Xbox 360 - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[6].id,
                old_price = 15999.99m,
                new_price = 14499.99m,
                old_discount = null,
                new_discount = null,
                changed_at = DateTime.UtcNow.AddDays(-20),
                changed_by = seller2.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[6].id,
                old_price = 14499.99m,
                new_price = 12999.99m,
                old_discount = null,
                new_discount = 12.00m,
                changed_at = DateTime.UtcNow.AddDays(-7),
                changed_by = seller2.id
            });

            // PlayStation One - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[7].id,
                old_price = 8499.99m,
                new_price = 7999.99m,
                old_discount = null,
                new_discount = null,
                changed_at = DateTime.UtcNow.AddDays(-22),
                changed_by = seller2.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[7].id,
                old_price = 7999.99m,
                new_price = 6999.99m,
                old_discount = null,
                new_discount = 10.00m,
                changed_at = DateTime.UtcNow.AddDays(-6),
                changed_by = seller2.id
            });

            // Game Boy - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[8].id,
                old_price = 6499.99m,
                new_price = 5999.99m,
                old_discount = 5.00m,
                new_discount = null,
                changed_at = DateTime.UtcNow.AddDays(-18),
                changed_by = seller2.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[8].id,
                old_price = 5999.99m,
                new_price = 4999.99m,
                old_discount = null,
                new_discount = 15.00m,
                changed_at = DateTime.UtcNow.AddDays(-4),
                changed_by = seller2.id
            });

            // Nintendo Switch 2 - история изменений
            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[9].id,
                old_price = 44999.99m,
                new_price = 42499.99m,
                old_discount = null,
                new_discount = 5.00m,
                changed_at = DateTime.UtcNow.AddDays(-8),
                changed_by = seller2.id
            });

            priceHistories.Add(new PriceDiscountHistory
            {
                product_id = products[9].id,
                old_price = 42499.99m,
                new_price = 39999.99m,
                old_discount = 5.00m,
                new_discount = 8.00m,
                changed_at = DateTime.UtcNow.AddDays(-1),
                changed_by = seller2.id
            });

            context.PriceDiscountHistories.AddRange(priceHistories);
            await context.SaveChangesAsync();

            var order1 = new Orders
            {
                user_id = buyer1.id,
                status = "Completed",
                total_sum = 59999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow.AddDays(-5)
            };
            context.Orders.Add(order1);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[0].id, // Steam VR
                    order_id = order1.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 15999.99m,
                    discount_at_buy = 15.00m,
                    final_price_at_buy = 13599.99m,
                    name_at_buy = "Steam VR"
                },
                new OrderItem
                {
                    product_id = products[1].id, // Steam Deck
                    order_id = order1.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 49999.99m,
                    discount_at_buy = 10.00m,
                    final_price_at_buy = 44999.99m,
                    name_at_buy = "Steam Deck"
                }
            );

            var order2 = new Orders
            {
                user_id = buyer2.id,
                status = "Shipped",
                total_sum = 12999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow.AddDays(-3)
            };
            context.Orders.Add(order2);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[4].id, // PSP
                    order_id = order2.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 8999.99m,
                    discount_at_buy = 8.00m,
                    final_price_at_buy = 8279.99m,
                    name_at_buy = "PSP"
                },
                new OrderItem
                {
                    product_id = products[8].id, // Game Boy
                    order_id = order2.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 4999.99m,
                    discount_at_buy = null,
                    final_price_at_buy = 4999.99m,
                    name_at_buy = "Game Boy"
                }
            );

            var order3 = new Orders
            {
                user_id = buyer1.id,
                status = "Pending",
                total_sum = 74999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow.AddDays(-1)
            };
            context.Orders.Add(order3);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[2].id, // PlayStation 5
                    order_id = order3.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 54999.99m,
                    discount_at_buy = 5.00m,
                    final_price_at_buy = 52249.99m,
                    name_at_buy = "PlayStation 5"
                },
                new OrderItem
                {
                    product_id = products[5].id, // Xbox One
                    order_id = order3.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 24999.99m,
                    discount_at_buy = 20.00m,
                    final_price_at_buy = 19999.99m,
                    name_at_buy = "Xbox One"
                }
            );

            var order4 = new Orders
            {
                user_id = buyer2.id,
                status = "Completed",
                total_sum = 46999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow.AddDays(-10)
            };
            context.Orders.Add(order4);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[9].id, // Nintendo Switch 2
                    order_id = order4.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 39999.99m,
                    discount_at_buy = 5.00m,
                    final_price_at_buy = 37999.99m,
                    name_at_buy = "Nintendo Switch 2"
                },
                new OrderItem
                {
                    product_id = products[6].id, // Xbox 360
                    order_id = order4.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 12999.99m,
                    discount_at_buy = 12.00m,
                    final_price_at_buy = 11439.99m,
                    name_at_buy = "Xbox 360"
                }
            );

            var order5 = new Orders
            {
                user_id = buyer1.id,
                status = "Completed",
                total_sum = 44999.99m,
                total_amount = 1,
                created_at = DateTime.UtcNow.AddDays(-15)
            };
            context.Orders.Add(order5);
            await context.SaveChangesAsync();

            context.OrderItems.Add(new OrderItem
            {
                product_id = products[3].id, // Xbox Series X
                order_id = order5.id,
                seller_id = seller1.id,
                quantity = 1,
                price_at_buy = 49999.99m,
                discount_at_buy = null,
                final_price_at_buy = 44999.99m,
                name_at_buy = "Xbox Series X"
            });

            var order6 = new Orders
            {
                user_id = buyer2.id,
                status = "Cancelled",
                total_sum = 6999.99m,
                total_amount = 1,
                created_at = DateTime.UtcNow.AddDays(-12)
            };
            context.Orders.Add(order6);
            await context.SaveChangesAsync();

            context.OrderItems.Add(new OrderItem
            {
                product_id = products[7].id, // PlayStation One
                order_id = order6.id,
                seller_id = seller2.id,
                quantity = 1,
                price_at_buy = 6999.99m,
                discount_at_buy = 10.00m,
                final_price_at_buy = 6299.99m,
                name_at_buy = "PlayStation One"
            });

            var order7 = new Orders
            {
                user_id = buyer1.id,
                status = "Shipped",
                total_sum = 93999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow.AddDays(-7)
            };
            context.Orders.Add(order7);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[1].id, // Steam Deck
                    order_id = order7.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 49999.99m,
                    discount_at_buy = 10.00m,
                    final_price_at_buy = 44999.99m,
                    name_at_buy = "Steam Deck"
                },
                new OrderItem
                {
                    product_id = products[3].id, // Xbox Series X
                    order_id = order7.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 49999.99m,
                    discount_at_buy = 5.00m,
                    final_price_at_buy = 47499.99m,
                    name_at_buy = "Xbox Series X"
                }
            );

            var order8 = new Orders
            {
                user_id = buyer2.id,
                status = "Completed",
                total_sum = 24999.97m,
                total_amount = 3,
                created_at = DateTime.UtcNow.AddDays(-20)
            };
            context.Orders.Add(order8);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[4].id, // PSP
                    order_id = order8.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 8999.99m,
                    discount_at_buy = null,
                    final_price_at_buy = 8999.99m,
                    name_at_buy = "PSP"
                },
                new OrderItem
                {
                    product_id = products[6].id, // Xbox 360
                    order_id = order8.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 12999.99m,
                    discount_at_buy = null,
                    final_price_at_buy = 12999.99m,
                    name_at_buy = "Xbox 360"
                },
                new OrderItem
                {
                    product_id = products[7].id, // PlayStation One
                    order_id = order8.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 6999.99m,
                    discount_at_buy = null,
                    final_price_at_buy = 6999.99m,
                    name_at_buy = "PlayStation One"
                }
            );

            var order9 = new Orders
            {
                user_id = buyer1.id,
                status = "Pending",
                total_sum = 67999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow
            };
            context.Orders.Add(order9);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[0].id, // Steam VR
                    order_id = order9.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 15999.99m,
                    discount_at_buy = 15.00m,
                    final_price_at_buy = 13599.99m,
                    name_at_buy = "Steam VR"
                },
                new OrderItem
                {
                    product_id = products[2].id, // PlayStation 5
                    order_id = order9.id,
                    seller_id = seller1.id,
                    quantity = 1,
                    price_at_buy = 54999.99m,
                    discount_at_buy = 5.00m,
                    final_price_at_buy = 52249.99m,
                    name_at_buy = "PlayStation 5"
                }
            );

            var order10 = new Orders
            {
                user_id = buyer2.id,
                status = "Shipped",
                total_sum = 43999.98m,
                total_amount = 2,
                created_at = DateTime.UtcNow.AddDays(-2)
            };
            context.Orders.Add(order10);
            await context.SaveChangesAsync();

            context.OrderItems.AddRange(
                new OrderItem
                {
                    product_id = products[8].id, // Game Boy
                    order_id = order10.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 4999.99m,
                    discount_at_buy = 15.00m,
                    final_price_at_buy = 4249.99m,
                    name_at_buy = "Game Boy"
                },
                new OrderItem
                {
                    product_id = products[9].id, // Nintendo Switch 2
                    order_id = order10.id,
                    seller_id = seller2.id,
                    quantity = 1,
                    price_at_buy = 39999.99m,
                    discount_at_buy = 8.00m,
                    final_price_at_buy = 36799.99m,
                    name_at_buy = "Nintendo Switch 2"
                }
            );

            await context.SaveChangesAsync();
        }
    }
}
