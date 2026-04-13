using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("discounts")]
    public class Discount
    {
        [Key]
        public int id { get; set; }

        public int product_id { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? size { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? start_date { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? end_date { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? edited_at { get; set; } = null;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? deleted_at { get; set; } = null;

        public bool deleted { get; set; } = false;

        // Навигационные свойства
        [ForeignKey("product_id")]
        public Products Product { get; set; }
    }
}
