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

// Add antiforgery services
builder.Services.AddAntiforgery(options => 
{
    // Set Cookie properties to match your application
    options.HeaderName = "X-CSRF-TOKEN";
    options.SuppressXFrameOptionsHeader = false;
});

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

// Configure Database with detailed logging
builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection"));
    options.EnableSensitiveDataLogging();
    options.EnableDetailedErrors();
});

// Register repositories
builder.Services.AddScoped<IEventRepository, EventRepository>();
builder.Services.AddScoped<IPhotoRepository, PhotoRepository>();
builder.Services.AddScoped<IVideoRepository, VideoRepository>();

// Register FileStorageService
builder.Services.AddScoped<FileStorageService>();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(builder =>
    {
        builder
            .WithOrigins(
                "https://c0k84wcg480o0scckc88kggs.blendimaliqi.com",
                "http://localhost:5173",
                "http://localhost:5174"
            )
            .AllowAnyMethod()
            .AllowAnyHeader()
            .WithExposedHeaders("Content-Disposition", "Content-Length")
            .SetIsOriginAllowed(_ => true);
    });
});

var app = builder.Build();

// Always enable Swagger in all environments
app.UseSwagger();
app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Event Photos API v1"));

// Enable detailed error messages in all environments for debugging
app.UseDeveloperExceptionPage();

// Use CORS before other middleware
app.UseCors();

// Enable response compression
app.UseResponseCompression();

// Configure static file serving for uploads
app.UseStaticFiles();

// Create uploads directories if they don't exist
var photoUploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads", "photos");
if (!Directory.Exists(photoUploadsPath))
{
    Directory.CreateDirectory(photoUploadsPath);
}

var videoUploadsPath = Path.Combine(app.Environment.ContentRootPath, "uploads", "videos");
if (!Directory.Exists(videoUploadsPath))
{
    Directory.CreateDirectory(videoUploadsPath);
}

// Map the uploads directories to URL paths
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(photoUploadsPath),
    RequestPath = "/uploads/photos"
});

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(videoUploadsPath),
    RequestPath = "/uploads/videos"
});

app.UseHttpsRedirection();
app.MapControllers();

// Add health check endpoint
app.MapGet("/health", () => Results.Ok(new { status = "healthy", timestamp = DateTime.UtcNow }));

// Ensure database is created and migrated
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.Migrate();
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating the database.");
    }
}

app.Run();
