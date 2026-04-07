using System.ComponentModel.DataAnnotations;

namespace backend.DTO.Auth
{
    public class VerifyEmailCodeRequest
    {
        [Required, EmailAddress]
        public string email { get; set; } = string.Empty;
        
        [Required, StringLength(6, MinimumLength = 6)]
        public string code { get; set; } = string.Empty;
    }
}