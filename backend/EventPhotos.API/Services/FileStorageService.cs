using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace EventPhotos.API.Services
{
    public class FileStorageService
    {
        private readonly string _uploadDirectory;
        private readonly IWebHostEnvironment _environment;
        private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly string[] _allowedImageMimeTypes = { 
            "image/jpeg", 
            "image/png", 
            "image/gif", 
            "image/webp" 
        };

        public FileStorageService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _uploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "photos");
            
            // Ensure upload directory exists
            if (!Directory.Exists(_uploadDirectory))
            {
                Directory.CreateDirectory(_uploadDirectory);
            }
        }

        private bool IsValidImageFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedImageExtensions.Contains(extension))
                return false;

            // Check MIME type
            if (!_allowedImageMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;

            return true;
        }

        public async Task<string> SavePhotoAsync(IFormFile file)
        {
            if (!IsValidImageFile(file))
            {
                throw new ArgumentException("Invalid image file. Only JPG, JPEG, PNG, GIF, and WebP files are allowed.");
            }

            // Generate a unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
            var filePath = Path.Combine(_uploadDirectory, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL path that can be used to access the file
            return $"/uploads/photos/{fileName}";
        }

        public void DeletePhoto(string photoUrl)
        {
            if (string.IsNullOrEmpty(photoUrl))
                return;

            // Extract filename from URL
            var fileName = Path.GetFileName(photoUrl);
            var filePath = Path.Combine(_uploadDirectory, fileName);

            // Delete file if it exists
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
} 