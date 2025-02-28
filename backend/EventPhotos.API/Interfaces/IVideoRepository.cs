using System.Collections.Generic;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Models;

namespace EventPhotos.API.Interfaces
{
    public interface IVideoRepository
    {
        Task<IEnumerable<Video>> GetVideosByEventIdAsync(int eventId);
        Task<Video?> GetVideoByIdAsync(int id);
        Task<Video> AddVideoAsync(CreateVideoDto videoDto);
        Task<Video?> DeleteVideoAsync(int id);
        Task<long> GetTotalVideoSizeByEventIdAsync(int eventId);
    }
}
