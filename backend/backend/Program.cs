// Program.cs
using DotNetEnv;
using backend.Data;
using backend.Data.Seed;
using backend.Services;
using backend.Services.CRUD;
using backend.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Настраиваем логирование
builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.SetMinimumLevel(LogLevel.Information);

if (builder.Environment.IsDevelopment())
{
    Env.Load();
}

builder.Services.AddControllersWithViews();
builder.Services.AddControllers();

// Добавляем Swagger с поддержкой JWT
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "Marketplace API", Version = "v1" });
    
    // Настройка JWT авторизации в Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Введите JWT токен: eyJhbGci..."
    });
    
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference 
                { 
                    Type = ReferenceType.SecurityScheme, 
                    Id = "Bearer" 
                }
            },
            new List<string>()
        }
    });
}); 

builder.Services.AddDbContext<DBContext>(options =>
    options.UseNpgsql(
        Environment.GetEnvironmentVariable("CONNECTION_STRING") 
        ?? throw new InvalidOperationException("CONNECTION_STRING not found")));

builder.Services.AddMemoryCache();

builder.Services.AddSingleton<TokenService>();

builder.Services.AddScoped<IUserCrudService, UserCrudService>();
builder.Services.AddScoped<IPriceHistoryService, PriceHistoryService>();
builder.Services.AddScoped<IProductsCrudService, ProductsCrudService>();
builder.Services.AddScoped<IProductImagesService, ProductImagesService>();
builder.Services.AddScoped<IDiscountsCrudService, DiscountsCrudService>();
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

// CORS 
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowCookies", policy =>
    {
        policy.WithOrigins("http://localhost:5035", "http://localhost:3000", "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials(); // Разрешаем cookies
    });
});

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<DBContext>();
    await DbInitializer.InitializeAsync(dbContext);
}

// Включаем Swagger только в Development режиме
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Marketplace API v1");
        // Разрешаем отправку cookies через Swagger UI
        c.ConfigObject.AdditionalItems = new Dictionary<string, object>
        {
            { "withCredentials", true }
        };
    });
}

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseCors("AllowCookies");
app.UseAuthentication();
app.UseAuthorization();

if (app.Environment.IsDevelopment())
{
    app.MapSwagger();
}

app.MapControllers();

app.Run();