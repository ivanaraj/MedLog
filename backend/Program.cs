using MongoDB.Driver;
using Microsoft.Extensions.Options;
using DotNetEnv;

Env.Load();

var builder = WebApplication.CreateBuilder(args);

// Controllers
builder.Services.AddControllers();

// Swagger
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

var app = builder.Build();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();
