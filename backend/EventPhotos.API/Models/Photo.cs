using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EventPhotos.API.Models
{
    public class Photo
    {
    public int Id { get; set; }
    public string Url { get; set; } = string.Empty;
    public DateTime UploadDate { get; set; }
    public int EventId { get; set; }
    public Event Event { get; set; } = null!;
    }
}