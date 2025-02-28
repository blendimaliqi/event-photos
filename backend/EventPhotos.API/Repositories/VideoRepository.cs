using Microsoft.EntityFrameworkCore;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Mappers;
using EventPhotos.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace EventPhotos.API.Repositories
{
    public class VideoRepository : IVideoRepository
    {
        private readonly ApplicationDbContext _context;

        public VideoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<Video>> GetVideosByEventIdAsync(int eventId)
        {
            return await _context.Videos
                .Where(v => v.EventId == eventId)
                .OrderByDescending(v => v.UploadDate)
                .ToListAsync();
        }

        public async Task<Video?> GetVideoByIdAsync(int id)
        {
            return await _context.Videos.FindAsync(id);
        }

        public async Task<Video> AddVideoAsync(CreateVideoDto videoDto)
        {
            var video = videoDto.ToVideoFromCreate();
            _context.Videos.Add(video);
            await _context.SaveChangesAsync();
            return video;
        }

        public async Task<Video?> DeleteVideoAsync(int id)
        {
            var video = await _context.Videos.FindAsync(id);

            if (video == null)
            {
                return null;
            }

            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();
            return video;
        }

        public async Task<long> GetTotalVideoSizeByEventIdAsync(int eventId)
        {
            return await _context.Videos
                .Where(v => v.EventId == eventId)
                .SumAsync(v => v.FileSize);
        }
    }
}
