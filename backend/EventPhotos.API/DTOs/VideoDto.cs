using System;
using System.ComponentModel.DataAnnotations;

namespace EventPhotos.API.DTOs
{
    public class VideoDto
    {
        public int Id { get; set; }
        public string Url { get; set; } = string.Empty;
        public string? Description { get; set; }
        public DateTime UploadDate { get; set; }
        public long FileSize { get; set; } // Size in bytes
        public string ContentType { get; set; } = string.Empty;
        public string? ThumbnailUrl { get; set; }
        public int EventId { get; set; }
    }
}
