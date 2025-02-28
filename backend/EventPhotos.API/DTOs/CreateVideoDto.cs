using System;
using System.ComponentModel.DataAnnotations;

namespace EventPhotos.API.DTOs
{
    public class CreateVideoDto
    {
        [Required]
        [Url]
        public string Url { get; set; } = string.Empty;

        [StringLength(1500)]
        public string? Description { get; set; }

        [Required]
        public int EventId { get; set; }
        
        [Required]
        public long FileSize { get; set; } // Size in bytes
        
        [Required]
        public string ContentType { get; set; } = string.Empty;
    }
}
