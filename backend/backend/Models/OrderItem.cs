using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace backend.Models
{
    [Table("OrderItem")]
    public class OrderItem
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [ForeignKey("Product")]
        public int ProductId { get; set; }

        [ForeignKey("Order")]
        public int OrderId { get; set; }

        public int SellerId { get; set; }

        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal PriceAtBuy { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal DiscountAtBuy { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal FinalPriceAtBuy { get; set; }

        [StringLength(255)]
        public string NameAtBuy { get; set; }

        // Navigation Properties
        public virtual Products Products { get; set; }
        public virtual Order Order { get; set; }
    }
}
