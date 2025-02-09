using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EventPhotos.API.Models
{
    public class Event
    {
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DateTime Date { get; set; }
    public string Description { get; set; } = string.Empty;
    public List<Photo> Photos { get; set; } = new();
    }
}