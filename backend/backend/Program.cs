// Program.cs
using DotNetEnv;
using backend.Data;
using backend.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

if (builder.Environment.IsDevelopment())
{
    Env.Load();
}

builder.Services.AddControllersWithViews();
builder.Services.AddControllers();

// Добавляем Swagger
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(); 

builder.Services.AddDbContext<DBContext>(options =>
    options.UseNpgsql(
        Environment.GetEnvironmentVariable("CONNECTION_STRING") 
        ?? throw new InvalidOperationException("CONNECTION_STRING not found")));

builder.Services.AddMemoryCache();

builder.Services.AddScoped<IEmailSender>(_ =>
    new EmailSender(
        smtpServer: Environment.GetEnvironmentVariable("SMTP_SERVER")
            ?? throw new InvalidOperationException("SMTP_SERVER not set"),
        smtpPort: int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587"),
        senderEmail: Environment.GetEnvironmentVariable("SMTP_EMAIL")
            ?? throw new InvalidOperationException("SMTP_EMAIL not set"),
        senderName: "TaskManager", // Или тоже из .env, если нужно
        smtpUser: Environment.GetEnvironmentVariable("SMTP_EMAIL"),
        smtpPassword: Environment.GetEnvironmentVariable("SMTP_PASSWORD")
            ?? throw new InvalidOperationException("SMTP_PASSWORD not set")
    ));

var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET_KEY") 
    ?? throw new InvalidOperationException("JWT_SECRET_KEY is missing");
var key = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
    System.Text.Encoding.UTF8.GetBytes(jwtSecret));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
    {
        ValidateIssuer = false,
        ValidateAudience = false,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = key,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

var app = builder.Build();

// Включаем Swagger только в Development режиме
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapSwagger();
}

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();