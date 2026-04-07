using backend.DTO.Auth;
using backend.Models;

namespace backend.Services.Interfaces
{
    /// <summary>
    /// Результат операции с токенами
    /// </summary>
    public class TokenResult
    {
        public string AccessToken { get; set; } = string.Empty;
        public string RefreshToken { get; set; } = string.Empty;
        public DateTime AccessTokenExpiresAt { get; set; }
        public UserDto User { get; set; } = new();
    }

    /// <summary>
    /// Интерфейс для CRUD операций с пользователями
    /// </summary>
    public interface IUserCrudService
    {
        Task<Users?> FindByEmailAsync(string email);
        Task<Users?> FindByIdAsync(int id);
        Task<Users?> FindByRefreshTokenHashAsync(string hashedToken);
        Task<Users> CreateUserAsync(string nickname, string email, string password);
        Task<Users> VerifyPasswordAsync(Users user, string password);
        Task<TokenResult> GenerateTokensAsync(Users user);
        Task<Users> UpdateRefreshTokenAsync(Users user, string hashedRefreshToken, DateTime expiresAt);
        Task<Users> ClearRefreshTokenAsync(Users user);
        Task<UserDto> MapToDtoAsync(Users user);
    }
}
