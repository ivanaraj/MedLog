using MongoDB.Driver;
using Microsoft.Extensions.Options;
using DotNetEnv;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Microsoft.OpenApi.Models;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// MongoDB configuration
builder.Services.Configure<MongoDbSettings>(
    builder.Configuration.GetSection("MongoDbSettings"));

builder.Services.AddSingleton<IMongoClient>(sp =>
{
    string connectionString = Environment.GetEnvironmentVariable("CONNECTION_STRING") ?? throw new InvalidOperationException("Connection string not found in environment variables.");
    return new MongoClient(connectionString);
});

// UserService
builder.Services.AddSingleton<UserService>();

// SpecializationService
builder.Services.AddSingleton<SpecializationService>();

// ExaminationService
builder.Services.AddSingleton<ExaminationService>();

// AuthService
builder.Services.AddSingleton<AuthService>();

// JWT konfiguracija
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var jwtKey = Environment.GetEnvironmentVariable("JWT_KEY") 
    ?? throw new InvalidOperationException("JWT_KEY nije pronadjen u .env fajlu.");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
    };
});



var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthentication(); 
app.UseAuthorization();

app.MapControllers();

app.Run();
