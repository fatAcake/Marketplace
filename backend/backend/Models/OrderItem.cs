using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("order_items")]
    public class OrderItem
    {
        [Key]
        public int id { get; set; }

        public int product_id { get; set; }

        public int order_id { get; set; }

        public int seller_id { get; set; }

        [Required]
        public int quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal price_at_buy { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? discount_at_buy { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal final_price_at_buy { get; set; }

        [Required]
        [StringLength(255)]
        public string name_at_buy { get; set; } = string.Empty;

        // Навигационные свойства
        [ForeignKey("product_id")]
        public Products Product { get; set; }

        [ForeignKey("order_id")]
        public Orders Order { get; set; }

        [ForeignKey("seller_id")]
        public Users Seller { get; set; }
    }
}
