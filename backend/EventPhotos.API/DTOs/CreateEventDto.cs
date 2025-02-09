using System;
using System.ComponentModel.DataAnnotations;

namespace EventPhotos.API.DTOs
{
    public class CreateEventDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;
    }
} 