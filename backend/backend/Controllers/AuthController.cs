using System.Security.Claims;
using backend.DTO.Auth;
using backend.Models;
using backend.Services;
using backend.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Caching.Memory;
using Microsoft.IdentityModel.Tokens.Experimental;


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : BaseApiController
    {
        private readonly IUserCrudService _userService;
        private readonly IMemoryCache _cache;
        private readonly IEmailSender _emailSender;
        private readonly TokenService _tokenService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(
            IUserCrudService userService,
            IMemoryCache cache,
            IEmailSender emailSender,
            TokenService tokenService,
            ILogger<AuthController> logger)
        {
            _userService = userService;
            _cache = cache;
            _emailSender = emailSender;
            _tokenService = tokenService;
            _logger = logger;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            _logger.LogInformation("Попытка регистрации: {Email}", request.email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Невалидная модель регистрации: {@Errors}", ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage));
                return BadRequest(ModelState);
            }

            var existingUser = await _userService.FindByEmailAsync(request.email);
            if (existingUser != null)
            {
                _logger.LogWarning("Email уже зарегистрирован: {Email}", request.email);
                return BadRequest(new { error = "Email уже зарегестрирован" });
            }

            var user = await _userService.CreateUserAsync(request.nickname, request.email, request.password);

            var code = _tokenService.GenerateVerificationCode();
            var cacheKey = $"email_verify_{user.email}";

            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(10));
            _cache.Set($"register_attempt_{user.email}", true, TimeSpan.FromMinutes(1));

            _logger.LogDebug("Код подтверждения сохранён в кэше для {Email}", user.email);

            await _emailSender.SendEmailAsync(user.email,
                "Код подтверждения регистрации",
                Methods.GetHTMLMessage(user, code)
            );

            _logger.LogInformation("Код подтверждения отправлен на {Email}", user.email);
            return Ok(new { message = "Код подтверждения отправлен на email" });
        }

        [HttpPost("verify-code")]
        public async Task<IActionResult> VerifyEmailCode([FromBody] VerifyEmailCodeRequest request)
        {
            _logger.LogInformation("Проверка кода для {Email}", request.email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Невалидная модель верификации");
                return BadRequest(ModelState);
            }

            var cacheKey = $"email_verify_{request.email}";

            (bool flowControl, IActionResult value) = CheckVerificationCode(request, cacheKey);
            if (!flowControl)
            {
                return value;
            }

            var user = await _userService.FindByEmailAsync(request.email);
            (flowControl, value) = CheckUser(user, true);
            if (!flowControl) return value;

            user.status = "Buyer";
            user.edited_at = DateTime.UtcNow;

            TokenResult tokens = await CheckGetSetToken(cacheKey, user);

            return Ok(new AuthResponse
            {
                token = tokens.AccessToken,
                expires_at = tokens.AccessTokenExpiresAt,
                refresh_token = tokens.RefreshToken,
                user = tokens.User
            });
        }


        [HttpPost("resend-code")]
        public async Task<IActionResult> ResendCode([FromBody] VerifyEmailCodeRequest request)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userService.FindByEmailAsync(request.email);
            (bool flowControl, IActionResult value) = CheckUser(user);
            if (!flowControl) return value;

            var rateLimitKey = $"register_attempt_{user.email}";
            if (_cache.TryGetValue(rateLimitKey, out _))
                return BadRequest(new { error = "Подождите 1 минуту перед повторной отправкой" });

            var code = _tokenService.GenerateVerificationCode();
            var cacheKey = $"email_verify_{user.email}";
            _cache.Set(cacheKey, code, TimeSpan.FromMinutes(10));
            _cache.Set(rateLimitKey, true, TimeSpan.FromMinutes(1));

            await _emailSender.SendEmailAsync(
                user.email,
                "Новый код подтверждения",
                Methods.GetHTMLMessage(user, code));

            return Ok(new { message = "Новый код отправлен на email" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            _logger.LogInformation("Попытка входа: {Email}", request.email);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Невалидная модель входа");
                return BadRequest(ModelState);
            }

            var user = await _userService.FindByEmailAsync(request.email);
            (bool flowControl, IActionResult value) = CheckUser(user);
            if (!flowControl) return value;

            try
            {
                await _userService.VerifyPasswordAsync(user, request.password);
            }
            catch (UnauthorizedAccessException)
            {
                _logger.LogWarning("Неверный пароль для {Email}", request.email);
                return Unauthorized("Неверные учётные данные");
            }

            var tokens = await _userService.GenerateTokensAsync(user);
            await _userService.UpdateRefreshTokenAsync(user, _tokenService.HashToken(tokens.RefreshToken), _tokenService.RefreshTokenExpiresAt);

            _tokenService.SetTokenCookies(Response, tokens.AccessToken, tokens.RefreshToken);

            _logger.LogInformation("Вход выполнен: {UserId}, {Email}", user.id, user.email);
            return Ok(new AuthResponse
            {
                token = tokens.AccessToken,
                expires_at = tokens.AccessTokenExpiresAt,
                refresh_token = tokens.RefreshToken,
                user = tokens.User
            });
        }

        [HttpGet("me")]
        [Authorize]
        public async Task<IActionResult> GetMe()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);

            if (!int.TryParse(userIdStr, out var userId))
            {
                _logger.LogWarning("Невалидный user ID в токене: {UserIdStr}", userIdStr);
                return BadRequest("Невалидный user ID в токене");
            }

            var user = await _userService.FindByIdAsync(userId);
            (bool flowControl, IActionResult value) = CheckUser(user);
            if (!flowControl) return value;

            _logger.LogInformation("Данные пользователя возвращены: {UserId}, {Email}", user.id, user.email);
            return Ok(await _userService.MapToDtoAsync(user));
        }

        [HttpPost("refresh")]
        public async Task<IActionResult> RefreshToken()
        {
            _logger.LogInformation("Запрос обновления токена");

            var refreshToken = Request.Cookies["refresh_token"];
            if (string.IsNullOrEmpty(refreshToken))
            {
                _logger.LogWarning("Refresh token отсутствует в cookies");
                return Unauthorized("Refresh token отсутствует");
            }

            var hashedToken = _tokenService.HashToken(refreshToken);
            var user = await _userService.FindByRefreshTokenHashAsync(hashedToken);

            if (user == null)
            {
                _logger.LogWarning("Невалидный refresh token использован");
                return Unauthorized("Невалидный refresh token");
            }

            if (user.refresh_token_expires_at < DateTime.UtcNow)
            {
                _logger.LogWarning("Refresh token истёк для пользователя {UserId}", user.id);
                await _userService.ClearRefreshTokenAsync(user);
                return Unauthorized("Refresh token истёк");
            }

            var tokens = await _userService.GenerateTokensAsync(user);
            await _userService.UpdateRefreshTokenAsync(user, _tokenService.HashToken(tokens.RefreshToken), _tokenService.RefreshTokenExpiresAt);

            _tokenService.SetTokenCookies(Response, tokens.AccessToken, tokens.RefreshToken);

            _logger.LogInformation("Токены обновлены для пользователя {UserId}", user.id);
            return Ok(new AuthResponse
            {
                token = tokens.AccessToken,
                expires_at = tokens.AccessTokenExpiresAt,
                refresh_token = tokens.RefreshToken,
                user = tokens.User
            });
        }

        [HttpPost("logout")]
        [Authorize]
        public async Task<IActionResult> Logout()
        {
            var userIdStr = User.FindFirstValue(ClaimTypes.NameIdentifier);
            _logger.LogInformation("Запрос выхода, UserId: {UserId}", userIdStr);

            if (int.TryParse(userIdStr, out var userId))
            {
                var user = await _userService.FindByIdAsync(userId);
                if (user != null)
                    await _userService.ClearRefreshTokenAsync(user);
            }

            _tokenService.ClearTokenCookies(Response);
            return Ok(new { message = "Выход выполнен успешно" });
        }

        private async Task<TokenResult> CheckGetSetToken(string cacheKey, Users user)
        {
            var tokens = await _userService.GenerateTokensAsync(user);
            await _userService.UpdateRefreshTokenAsync(user, _tokenService.HashToken(tokens.RefreshToken), _tokenService.RefreshTokenExpiresAt);

            _tokenService.SetTokenCookies(Response, tokens.AccessToken, tokens.RefreshToken);
            _cache.Remove(cacheKey);

            _logger.LogInformation("Email подтверждён, токены выданы: {UserId}, {Email}", user.id, user.email);
            return tokens;
        }

        private (bool flowControl, IActionResult value) CheckVerificationCode(
            VerifyEmailCodeRequest request, string cacheKey)
        {
            if (!_cache.TryGetValue(cacheKey, out string? storedCode))
            {
                _logger.LogWarning("Код верификации истёк или не найден для {Email}", request.email);
                return (flowControl: false, value: BadRequestError("Код истёк или не найден. Запросите новый."));
            }

            if (storedCode != request.code)
            {
                _logger.LogWarning("Неверный код для {Email}", request.email);
                return (flowControl: false, value: BadRequestError("Неверный код подтверждения"));
            }

            return (flowControl: true, value: null);
        }

        private (bool flowControl, IActionResult value) CheckUser(Users? user, bool? isregister = false)
        {
            if (user == null)
            return (flowControl: false, value: NotFoundError("Пользователь не найден"));

            if (isregister == true)
                if (user.status != null)
                    return (flowControl: false, value: BadRequestError("Email уже подтверждён"));
            return (flowControl: true, value: null);
        }
    }
}