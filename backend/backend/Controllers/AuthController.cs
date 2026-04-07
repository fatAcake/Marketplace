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


namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly DBContext _db;
        private readonly IEmailSender _emailSender;
        private readonly IConfiguration _conf;

        public AuthController(DBContext db, IEmailSender emailSender, IConfiguration conf)
        {
            _db = db;
            _emailSender = emailSender;
            _conf = conf;
        }

        [HttpPost]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        { 
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            
            if (await _db.Users.AnyAsync(u=>u.email == request.email && u.deleted))
                return BadRequest(new {error = "Email уже зарегестрирован!"});

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

            return null;
        }

    }
}
