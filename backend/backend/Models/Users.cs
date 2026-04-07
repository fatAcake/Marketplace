using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models
{
    [Table("users")]
    public class Users
    {
        [Key]
        public int id { get; set; }

        [StringLength(100, MinimumLength = 1)]
        [Required]
        public string nickname { get; set; }

        [StringLength(100, MinimumLength = 5)]
        [Required]
        [EmailAddress]
        public string email { get; set; }

        [StringLength(255, MinimumLength = 5)]
        [Required]
        public string password { get; set; }

        [Column(TypeName = "timestamp with time zone")]
        public DateTime registration_date { get; set; } = DateTime.UtcNow;


        [StringLength(50, MinimumLength = 1)]
        [Required]
        public string status { get; set; } = "Buyer";

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? edited_at { get; set; } = null;

        [Column(TypeName = "timestamp with time zone")]
        public DateTime? deleted_at { get; set; } = null;
        public bool deleted { get; set; } = false;
    }
}
