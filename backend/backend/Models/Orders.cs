using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("orders")]
    public class Orders
    {
        [Key]
        public int id { get; set; }

        public int user_id { get; set; }

        [Required]
        [StringLength(50)]
        public string status { get; set; } = "Pending";

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal total_sum { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? edited_at { get; set; } = null;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? deleted_at { get; set; } = null;

        public bool deleted { get; set; } = false;

        public int total_amount { get; set; }

        // Навигационные свойства
        [ForeignKey("user_id")]
        public Users User { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }
}
