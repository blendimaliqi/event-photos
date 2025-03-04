using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventPhotos.API.Models
{
    [Table("Videos")]
    public class Video
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [Url]
        [StringLength(2048)]
        public string Url { get; set; } = string.Empty;

        [StringLength(1500)]
        public string? Description { get; set; }

        [Required]
        public DateTime UploadDate { get; set; }

        [Required]
        public long FileSize { get; set; } // File size in bytes

        [Required]
        public string ContentType { get; set; } = string.Empty;

        [Url]
        [StringLength(2048)]
        public string? ThumbnailUrl { get; set; }

        [Required]
        public int EventId { get; set; }

        [ForeignKey(nameof(EventId))]
        public virtual Event Event { get; set; } = null!;
    }
}
