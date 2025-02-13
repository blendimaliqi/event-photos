using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;

namespace EventPhotos.API.Models
{
    [Table("Events")]
    public class Event
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        public int? HeroPhotoId { get; set; }

        [ForeignKey(nameof(HeroPhotoId))]
        public virtual Photo? HeroPhoto { get; set; }

        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; }

        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        public virtual List<Photo> Photos { get; set; } = new();
    }
}