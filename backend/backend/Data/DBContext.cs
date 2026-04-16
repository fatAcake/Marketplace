﻿using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options)
            : base(options) { }
        public virtual DbSet<Users> Users { get; set; }
        public virtual DbSet<Products> Products { get; set; }
        public virtual DbSet<ProductImage> ProductImages { get; set; }
        public virtual DbSet<Orders> Orders { get; set; }
        public virtual DbSet<OrderItem> OrderItems { get; set; }
        public virtual DbSet<Discount> Discounts { get; set; }
        public virtual DbSet<PriceDiscountHistory> PriceDiscountHistories { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Users>()
                .ToTable(u => u.HasCheckConstraint("CK_users_status", "status in ('Buyer', 'Admin', 'Saller')"));

            modelBuilder.Entity<Products>()
                .HasOne(p => p.User)
                .WithMany(u => u.Products)
                .HasForeignKey(p => p.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<ProductImage>()
                .HasOne(pi => pi.Product)
                .WithMany(p => p.Images)
                .HasForeignKey(pi => pi.product_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Orders>()
                .HasOne(o => o.User)
                .WithMany()
                .HasForeignKey(o => o.user_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Product)
                .WithMany()
                .HasForeignKey(oi => oi.product_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Order)
                .WithMany(o => o.OrderItems)
                .HasForeignKey(oi => oi.order_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<OrderItem>()
                .HasOne(oi => oi.Seller)
                .WithMany()
                .HasForeignKey(oi => oi.seller_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Discount>()
                .HasOne(d => d.Product)
                .WithMany()
                .HasForeignKey(d => d.product_id)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PriceDiscountHistory>()
                .HasOne(ph => ph.Product)
                .WithMany()
                .HasForeignKey(ph => ph.product_id)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<PriceDiscountHistory>()
                .HasOne(ph => ph.ChangedByUser)
                .WithMany()
                .HasForeignKey(ph => ph.changed_by)
                .OnDelete(DeleteBehavior.SetNull);

            base.OnModelCreating(modelBuilder);
        }
    }
}