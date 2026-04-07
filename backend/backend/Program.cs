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

builder.Services.AddDbContext<DBContext>(options =>
    options.UseNpgsql(
        Environment.GetEnvironmentVariable("CONNECTION_STRING")
        ?? throw new InvalidOperationException("CONNECTION_STRING not found")));

// Регистрация SMTP сервиса
builder.Services.AddScoped<IEmailSender>(_ =>
    new EmailSender(
        smtpServer: Environment.GetEnvironmentVariable("SMTP_SERVER"),
        smtpPort: int.Parse(Environment.GetEnvironmentVariable("SMTP_PORT") ?? "587"),
        senderEmail: Environment.GetEnvironmentVariable("SMTP_EMAIL"),
        senderName: "Marketplace",
        smtpUser: Environment.GetEnvironmentVariable("SMTP_EMAIL"), 
        smtpPassword: Environment.GetEnvironmentVariable("SMTP_PASSWORD")
    ));

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();
app.UseRouting();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();