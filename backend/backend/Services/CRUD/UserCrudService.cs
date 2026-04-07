using backend.Data;
using backend.DTO.Auth;
using backend.Models;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using backend.Services.Interfaces;
namespace backend.Services.CRUD
{
    public class UserCrudService : IUserCrudService
    {
        private readonly DBContext _db;
        private readonly TokenService _tokenService;
        private readonly ILogger<UserCrudService> _logger;

        public UserCrudService(DBContext db, TokenService tokenService, ILogger<UserCrudService> logger)
        {
            _db = db;
            _tokenService = tokenService;
            _logger = logger;
        }

        /// <summary>
        /// Найти пользователя по email
        /// </summary>
        public async Task<Users?> FindByEmailAsync(string email)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.email == email && !u.deleted);
        }

        /// <summary>
        /// Найти пользователя по ID
        /// </summary>
        public async Task<Users?> FindByIdAsync(int id)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.id == id && !u.deleted);
        }

        /// <summary>
        /// Найти пользователя по хешу refresh token
        /// </summary>
        public async Task<Users?> FindByRefreshTokenHashAsync(string hashedToken)
        {
            return await _db.Users
                .FirstOrDefaultAsync(u => u.refresh_token == hashedToken && !u.deleted);
        }

        /// <summary>
        /// Создать нового пользователя
        /// </summary>
        public async Task<Users> CreateUserAsync(string nickname, string email, string password)
        {
            var passwordHasher = new PasswordHasher<Users>();
            var hashPass = passwordHasher.HashPassword(null, password);

            var user = new Users
            {
                nickname = nickname,
                email = email,
                password = hashPass,
                registration_date = DateTime.UtcNow,
                status = "Buyer"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation("Пользователь создан: {UserId}, {Email}", user.id, user.email);
            return user;
        }

        /// <summary>
        /// Проверить пароль пользователя
        /// </summary>
        public async Task<Users> VerifyPasswordAsync(Users user, string password)
        {
            var passwordHasher = new PasswordHasher<Users>();
            var result = passwordHasher.VerifyHashedPassword(user, user.password, password);

            if (result == PasswordVerificationResult.Failed)
                throw new UnauthorizedAccessException("Неверный пароль");

            return user;
        }

        /// <summary>
        /// Сгенерировать пару access + refresh токенов
        /// </summary>
        public async Task<TokenResult> GenerateTokensAsync(Users user)
        {
            var accessToken = _tokenService.GenerateAccessToken(user);
            var refreshToken = _tokenService.GenerateRefreshToken();

            var result = new TokenResult
            {
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                AccessTokenExpiresAt = _tokenService.AccessTokenExpiresAt,
                User = await MapToDtoAsync(user)
            };

            return result;
        }

        /// <summary>
        /// Обновить refresh token пользователя
        /// </summary>
        public async Task<Users> UpdateRefreshTokenAsync(Users user, string hashedRefreshToken, DateTime expiresAt)
        {
            user.refresh_token = hashedRefreshToken;
            user.refresh_token_expires_at = expiresAt;
            user.edited_at = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation("Refresh token обновлён для пользователя {UserId}", user.id);
            return user;
        }

        /// <summary>
        /// Очистить refresh token пользователя (logout)
        /// </summary>
        public async Task<Users> ClearRefreshTokenAsync(Users user)
        {
            user.refresh_token = null;
            user.refresh_token_expires_at = null;
            user.edited_at = DateTime.UtcNow;

            await _db.SaveChangesAsync();

            _logger.LogInformation("Refresh token отозван для пользователя {UserId}", user.id);
            return user;
        }

        /// <summary>
        /// Преобразовать модель пользователя в DTO
        /// </summary>
        public Task<UserDto> MapToDtoAsync(Users user)
        {
            return Task.FromResult(new UserDto
            {
                id = user.id,
                email = user.email,
                nickname = user.nickname,
                status = user.status
            });
        }
    }
}
