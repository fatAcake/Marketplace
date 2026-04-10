using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("product_images")]
    public class ProductImage
    {
        [Key]
        public int id { get; set; }

        public int product_id { get; set; }

        [ForeignKey("product_id")]
        public Products Product { get; set; } = null!;

        [Column(TypeName = "BYTEA")]
        public byte[] image_data { get; set; } = Array.Empty<byte>();

        [StringLength(100)]
        public string content_type { get; set; } = "image/jpeg";

        public int order { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime created_at { get; set; } = DateTime.UtcNow;
    }
}
