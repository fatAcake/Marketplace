using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("products")]
    public class Products
    {
        [Key]
        public int id { get; set; }

        [Required]
        [StringLength(255, MinimumLength = 1)]
        public string name { get; set; } = string.Empty;

        [Required]
        [Range(0.01, float.MaxValue)]
        public float price { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int quantity { get; set; }

        public int user_id { get; set; }
        
        [Column(TypeName = "text")]
        public string description { get; set; } = String.Empty;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? edited_at { get; set; } = null;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? deleted_at { get; set; } = null;

        public bool deleted { get; set; } = false;

        [ForeignKey("user_id")]
        public Users User { get; set; }

        // Навигационное свойство — коллекция изображений
        public ICollection<ProductImage> Images { get; set; } = new List<ProductImage>();
    }
}