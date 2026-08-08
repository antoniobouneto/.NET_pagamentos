using Backend.Hubs;
using Backend.Services;

var builder = WebApplication.CreateBuilder(args);

// Add Services
builder.Services.AddMemoryCache();
builder.Services.AddSingleton<IRedisCacheService, RedisCacheService>();
builder.Services.AddHttpClient<CurrencyService>();
builder.Services.AddHostedService<CurrencyBackgroundWorker>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddSignalR();

// Enable CORS for Next.js Frontend (port 3000 / 3001)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins(
                "http://localhost:3000",
                "http://localhost:3001",
                "http://127.0.0.1:3000",
                "http://127.0.0.1:3001"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials();
    });
});

var app = builder.Build();

// Configure Pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseCors("AllowFrontend");
app.UseAuthorization();

app.MapControllers();
app.MapHub<CurrencyHub>("/hubs/currency");

app.Run();
