using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("price_discount_history")]
    public class PriceDiscountHistory
    {
        [Key]
        public int id { get; set; }

        public int product_id { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? old_price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? new_price { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? old_discount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? new_discount { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime changed_at { get; set; } = DateTime.UtcNow;

        public int? changed_by { get; set; }

        // Навигационные свойства
        [ForeignKey("product_id")]
        public Products Product { get; set; }

        [ForeignKey("changed_by")]
        public Users ChangedByUser { get; set; }
    }
}
