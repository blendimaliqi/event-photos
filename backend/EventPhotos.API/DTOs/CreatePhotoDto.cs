using System;
using System.ComponentModel.DataAnnotations;

namespace EventPhotos.API.DTOs
{
    public class CreatePhotoDto
    {
        [Required]
        [Url]
        public string Url { get; set; } = string.Empty;

        [StringLength(500)]
        public string? Description { get; set; }

        [Required]
        public int EventId { get; set; }
    }
} 