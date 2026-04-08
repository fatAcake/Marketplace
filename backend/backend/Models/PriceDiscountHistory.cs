using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("PriceDiscountHistory")]
    public class PriceDiscountHistory
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OldPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NewPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal OldDiscount { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal NewDiscount { get; set; }

        public DateTime ChangedAt { get; set; }

        public int ChangedBy { get; set; }

        // Navigation Properties
        public virtual Product Product { get; set; }
    }
}
