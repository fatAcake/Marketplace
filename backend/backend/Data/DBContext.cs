using backend.Models;
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
                
             modelBuilder.Entity<PriceDiscountHistory>()
                .HasOne(h => h.Product)
                .WithMany(p => p.PriceDiscountHistories)
                .HasForeignKey(h => h.product_id)
                .OnDelete(DeleteBehavior.Cascade);

            base.OnModelCreating(modelBuilder);
        }
    }
}
