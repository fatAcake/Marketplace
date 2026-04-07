using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using backend.Models;
using backend.DTO.Auth;
using backend.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using backend.Services;
using Microsoft.AspNetCore.Identity;
using Org.BouncyCastle.Ocsp;
using Microsoft.Extensions.Caching.Memory;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DBContext _db;
        private readonly IEmailSender _emailSender;
        private readonly IMemoryCache _cache;

        public AuthController(DBContext db, IEmailSender emailSender, IMemoryCache cache)
        {
            _db = db;
            _emailSender = emailSender;
            _cache = cache;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        { 
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            var existingUser = await _db.Users
                .FirstOrDefaultAsync(u => u.email == request.email && !u.deleted);

            if (existingUser != null)
                return BadRequest(new {error = "Email уже зарегестрирован"});


            var passwordHasher = new PasswordHasher<Users>();
            var hashPass = passwordHasher.HashPassword(null, request.password);

            var user = new Users
            {
                nickname = request.nickname,
                email = request.email,
                password = hashPass,
                registration_date = DateTime.UtcNow,
                status = "Buyer"
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            var code = GenerateVerificationCode();
            var cachekey = $"email_verify_{user.email}";

            _cache.Set(cachekey, code, TimeSpan.FromMinutes(10));

            _cache.Set($"register_attempt_{user.email}", true, TimeSpan.FromMinutes(1));

            await _emailSender.SendEmailAsync(user.email,
            "Код подтверждения регистрации",
                $@"<html>
                    <body style='font-family: Arial, sans-serif;'>
                        <h2>Привет, {user.nickname}!</h2>
                        <p>Ваш код подтверждения:</p>
                        <h1 style='background: #f0f0f0; padding: 20px; text-align: center; letter-spacing: 5px; font-size: 32px;'>{code}</h1>
                        <p>Код действителен <strong>10 минут</strong>.</p>
                        <p>Если вы не регистрировались, просто проигнорируйте это письмо.</p>
                    </body>
                   </html>");
            return Ok(new {message = "Код подтверждения отправлен на email"});            
        }

        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyEmailCode([FromBody] VerifyEmailCodeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var cacheKey = $"email_verify_{request.email}";
            
            // Проверяем код в кэше
            if (!_cache.TryGetValue(cacheKey, out string? storedCode))
                return BadRequest(new { error = "Код истёк или не найден. Запросите новый." });

            // Сравниваем коды
            if (storedCode != request.code)
                return BadRequest(new { error = "Неверный код подтверждения" });

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.email == request.email && !u.deleted);
            
            if (user == null)
                return NotFound(new { error = "Пользователь не найден" });

            user.status = "Buyer";
            user.edited_at = DateTime.UtcNow;
            
            await _db.SaveChangesAsync();

            _cache.Remove(cacheKey);

            var token = GenerateJwtToken(user);
            var expiresIn = int.Parse(Environment.GetEnvironmentVariable("ACCESS_TOKEN_EXPIRE_MINUTES") ?? "30");

            return Ok(new AuthResponse
            {
                token = token,
                expires_at = DateTime.UtcNow.AddMinutes(expiresIn),
                refresh_token = "",
                user = new UserDto
                {
                    id = user.id,
                    email = user.email,
                    nickname = user.nickname,
                    status = user.status
                }
            });
        }

        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] VerifyEmailCodeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.email == request.email && !u.deleted);
            
            if (user == null)
                return NotFound(new { error = "Пользователь не найден" });

            if (user.status == "User")
                return BadRequest(new { error = "Email уже подтверждён" });

            var rateLimitKey = $"register_attempt_{user.email}";
            if (_cache.TryGetValue(rateLimitKey, out _))
                return BadRequest(new { error = "Подождите 1 минуту перед повторной отправкой" });

            // Генерация нового кода
            var code = GenerateVerificationCode();
            var cacheKey = $"email_verify_{user.email}";
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(10));
            _cache.Set(rateLimitKey, true, TimeSpan.FromMinutes(1));

            await _emailSender.SendEmailAsync(
                user.email,
                "Новый код подтверждения",
                $@"<html>
                    <body style='font-family: Arial, sans-serif;'>
                        <h2>Привет, {user.nickname}!</h2>
                        <p>Ваш новый код подтверждения:</p>
                        <h1 style='background: #f0f0f0; padding: 20px; text-align: center; letter-spacing: 5px; font-size: 32px;'>{code}</h1>
                        <p>Код действителен <strong>10 минут</strong>.</p>
                    </body>
                   </html>");

            return Ok(new { message = "Новый код отправлен на email" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.email == request.email && !u.deleted);
            
            if (user == null)
                return Unauthorized("Неверные учётные данные");

            var passwordHasher = new PasswordHasher<Users>();
            var result = passwordHasher.VerifyHashedPassword(user, user.password, request.password);
            if (result == PasswordVerificationResult.Failed)
                return Unauthorized("Неверные учётные данные");

            if (user.status != "User")
                return BadRequest(new { error = "Подтвердите email перед входом" });

            var token = GenerateJwtToken(user);
            var expiresIn = int.Parse(Environment.GetEnvironmentVariable("ACCESS_TOKEN_EXPIRE_MINUTES") ?? "30");

            return Ok(new AuthResponse
            {
                token = token,
                expires_at = DateTime.UtcNow.AddMinutes(expiresIn),
                refresh_token = "",
                user = new UserDto
                {
                    id = user.id,
                    email = user.email,
                    nickname = user.nickname,
                    status = user.status
                }
            });
        }

        [HttpGet("me")]
        [Authorize]
        public IActionResult GetMe()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var email = User.FindFirstValue(ClaimTypes.Email);
            var nickname = User.FindFirstValue(ClaimTypes.Name);

            return Ok(new UserDto
            {
                id = int.Parse(userId ?? "0"),
                email = email ?? string.Empty,
                nickname = nickname ?? string.Empty,
                status = "User"
            });
        }
        #region Auxiliary methods
        private string GenerateJwtToken(Users user)
        {
            var secretKey = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
                ?? throw new InvalidOperationException("JWT_SECRET_KEY not set");
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var expireMinutes = int.Parse(Environment.GetEnvironmentVariable("ACCESS_TOKEN_EXPIRE_MINUTES") ?? "30");

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.id.ToString()),
                new Claim(ClaimTypes.Email, user.email),
                new Claim(ClaimTypes.Name, user.nickname),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
            };

            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddMinutes(expireMinutes),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GenerateVerificationCode()
        {
            var random = new Random();
            return random.Next(0, 1000000).ToString("D6");
        }
        #endregion
    }
}