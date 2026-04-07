using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services
{
    public class TokenService
    {
        private readonly string _jwtSecretKey;
        private readonly int _accessTokenExpireMinutes;
        private readonly int _refreshTokenExpireDays;

        public TokenService()
        {
            _jwtSecretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY")
                ?? throw new InvalidOperationException("JWT_SECRET_KEY not set");
            _accessTokenExpireMinutes = int.Parse(Environment.GetEnvironmentVariable("ACCESS_TOKEN_EXPIRE_MINUTES") ?? "30");
            _refreshTokenExpireDays = int.Parse(Environment.GetEnvironmentVariable("REFRESH_TOKEN_EXPIRE_DAYS") ?? "7");
        }

        /// <summary>
        /// Генерирует JWT access token
        /// </summary>
        public string GenerateAccessToken(Users user)
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Name, user.nickname),
                new Claim(ClaimTypes.Role, user.status),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(_accessTokenExpireMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        /// <summary>
        /// Генерирует криптографически случайный refresh token
        /// </summary>
        public string GenerateRefreshToken()
        {
            var randomNumber = new byte[32];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        /// <summary>
        /// Хеширует токен (SHA256) для безопасного хранения в БД
        /// </summary>
        public string HashToken(string token)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(token));
            return Convert.ToBase64String(hashedBytes);
        }

        /// <summary>
        /// Устанавливает HttpOnly cookies для access и refresh токенов
        /// </summary>
        public void SetTokenCookies(HttpResponse response, string accessToken, string refreshToken)
        {
            var isHttps = response.HttpContext.Request.IsHttps;

            response.Cookies.Append("access_token", accessToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = isHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddMinutes(_accessTokenExpireMinutes),
                Path = "/"
            });

            response.Cookies.Append("refresh_token", refreshToken, new CookieOptions
            {
                HttpOnly = true,
                Secure = isHttps,
                SameSite = SameSiteMode.Lax,
                Expires = DateTime.UtcNow.AddDays(_refreshTokenExpireDays),
                Path = "/"
            });
        }

        /// <summary>
        /// Удаляет cookies токенов
        /// </summary>
        public void ClearTokenCookies(HttpResponse response)
        {
            var isHttps = response.HttpContext.Request.IsHttps;

            response.Cookies.Delete("access_token", new CookieOptions
            {
                Secure = isHttps,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });
            response.Cookies.Delete("refresh_token", new CookieOptions
            {
                Secure = isHttps,
                SameSite = SameSiteMode.Lax,
                Path = "/"
            });
        }

        /// <summary>
        /// Генерирует 6-значный код подтверждения
        /// </summary>
        public string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(0, 1000000).ToString("D6");
        }

        public DateTime AccessTokenExpiresAt => DateTime.UtcNow.AddMinutes(_accessTokenExpireMinutes);
        public DateTime RefreshTokenExpiresAt => DateTime.UtcNow.AddDays(_refreshTokenExpireDays);
    }
}
