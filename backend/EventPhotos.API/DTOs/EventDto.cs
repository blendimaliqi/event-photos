using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.Models;

namespace EventPhotos.API.DTOs
{
    public class EventDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public DateTime Date { get; set; }
        public string Description { get; set; } = string.Empty;
        public PhotoDto? HeroPhoto { get; set; }
        public List<PhotoDto> Photos { get; set; } = new();
    }
}