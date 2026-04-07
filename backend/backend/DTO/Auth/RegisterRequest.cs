using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Auth
{
    public class RegisterRequest
    {
        [Required, EmailAddress]
        public string email { get; set; } = string.Empty;

        [Required, MinLength(5)]
        public string password { get; set; } = string.Empty;

        [Required, Compare(nameof(password))]
        public string confirmPassword { get; set; } = string.Empty;

        [StringLength(100, MinimumLength = 1)]
        public string nickname { get; set; } = string.Empty;
    }
}
