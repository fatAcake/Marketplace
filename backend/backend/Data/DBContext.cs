using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data
{
    public class DBContext : DbContext
    {
        public DBContext(DbContextOptions<DBContext> options)
            : base(options) { }
        public virtual DbSet<Users> Users { get; set; }
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Users>()
                .ToTable(u => u.HasCheckConstraint("CK_users_status", "status in ('Buyer', 'Admin', 'Saller')"));
            base.OnModelCreating(modelBuilder);
        }
    }
}
