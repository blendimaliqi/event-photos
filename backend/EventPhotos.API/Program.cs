using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL;
using Microsoft.OpenApi.Models;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Repositories;
using EventPhotos.API.Services;
using Microsoft.AspNetCore.Mvc.NewtonsoftJson;
using Microsoft.Extensions.FileProviders;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = Newtonsoft.Json.ReferenceLoopHandling.Ignore;
    });
builder.Services.AddEndpointsApiExplorer();

// Add response compression
builder.Services.AddResponseCompression();

// Add memory cache
builder.Services.AddMemoryCache();

// Configure Swagger/OpenAPI
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { 
        Title = "Event Photos API", 
        Version = "v1",
        Description = "API for managing event photos"
    });
    
    // Enable Swagger annotations
    c.EnableAnnotations();
});

// Configure Database
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// Register repositories
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();

// Register FileStorageService
builder.Services.AddScoped<FileStorageService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        builder => builder
            .AllowAnyOrigin()
            .AllowAnyMethod()
            .AllowAnyHeader());
});

var app = builder.Build();

// Configure middleware pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Event Photos API v1"));
}

// Enable response compression
app.UseResponseCompression();

// Configure static file serving for uploads
app.UseStaticFiles();

// Create uploads directory if it doesn't exist
var uploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads", "photos");
if (!Directory.Exists(uploadsPath))
{
    Directory.CreateDirectory(uploadsPath);
}

// Map the uploads directory to a URL path
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads/photos"
});

app.UseHttpsRedirection();
app.UseCors("AllowReactApp");
app.MapControllers();

// Add health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

app.Run();
