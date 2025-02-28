using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;

namespace EventPhotos.API.Services
{
    public class FileStorageService
    {
        private readonly string _photoUploadDirectory;
        private readonly string _videoUploadDirectory;
        private readonly IWebHostEnvironment _environment;
        private readonly string[] _allowedImageExtensions = { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
        private readonly string[] _allowedImageMimeTypes = { 
            "image/jpeg", 
            "image/png", 
            "image/gif", 
            "image/webp" 
        };
        
        private readonly string[] _allowedVideoExtensions = { ".mp4", ".webm", ".mov", ".avi" };
        private readonly string[] _allowedVideoMimeTypes = { 
            "video/mp4", 
            "video/webm", 
            "video/quicktime",
            "video/x-msvideo"
        };
        
        // Max video size in bytes (default: 100MB)
        public const long MaxVideoSizeBytes = 104857600;

        public FileStorageService(IWebHostEnvironment environment)
        {
            _environment = environment;
            _photoUploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "photos");
            _videoUploadDirectory = Path.Combine(_environment.ContentRootPath, "uploads", "videos");
            
            // Ensure upload directories exist
            if (!Directory.Exists(_photoUploadDirectory))
            {
                Directory.CreateDirectory(_photoUploadDirectory);
            }
            
            if (!Directory.Exists(_videoUploadDirectory))
            {
                Directory.CreateDirectory(_videoUploadDirectory);
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
        
        private bool IsValidVideoFile(IFormFile file)
        {
            if (file == null || file.Length == 0)
                return false;

            // Check file extension
            var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!_allowedVideoExtensions.Contains(extension))
                return false;

            // Check MIME type
            if (!_allowedVideoMimeTypes.Contains(file.ContentType.ToLowerInvariant()))
                return false;
            
            // Check file size
            if (file.Length > MaxVideoSizeBytes)
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
            var filePath = Path.Combine(_photoUploadDirectory, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL path that can be used to access the file
            return $"/uploads/photos/{fileName}";
        }
        
        public async Task<(string Url, long FileSize, string ContentType)> SaveVideoAsync(IFormFile file)
        {
            if (!IsValidVideoFile(file))
            {
                throw new ArgumentException($"Invalid video file. Only MP4, WebM, MOV, and AVI files are allowed, with a maximum size of {MaxVideoSizeBytes / 1024 / 1024}MB.");
            }

            // Generate a unique filename
            var fileName = $"{Guid.NewGuid()}{Path.GetExtension(file.FileName).ToLowerInvariant()}";
            var filePath = Path.Combine(_videoUploadDirectory, fileName);

            // Save the file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Return the relative URL path, file size, and content type
            return ($"/uploads/videos/{fileName}", file.Length, file.ContentType);
        }

        public void DeletePhoto(string photoUrl)
        {
            if (string.IsNullOrEmpty(photoUrl))
                return;

            // Extract filename from URL
            var fileName = Path.GetFileName(photoUrl);
            var filePath = Path.Combine(_photoUploadDirectory, fileName);

            // Delete file if it exists
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
        
        public void DeleteVideo(string videoUrl)
        {
            if (string.IsNullOrEmpty(videoUrl))
                return;

            // Extract filename from URL
            var fileName = Path.GetFileName(videoUrl);
            var filePath = Path.Combine(_videoUploadDirectory, fileName);

            // Delete file if it exists
            if (File.Exists(filePath))
            {
                File.Delete(filePath);
            }
        }
    }
}