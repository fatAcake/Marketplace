namespace backend.DTO.Auth
{
    public class AuthResponse
    {
        public string token { get; set; } = string.Empty;
        public DateTime expires_at { get; set; }
        public string refresh_token { get; set; } = string.Empty; // Пустой, если не используешь
        public UserDto user { get; set; } = new();
    }

    public class UserDto
    {
        public int id { get; set; }
        public string email { get; set; } = string.Empty;
        public string nickname { get; set; } = string.Empty;
        public string status { get; set; } = string.Empty;
    }
}
