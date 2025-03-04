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
            try 
            {
                // Try normal query first
                return await _context.Videos
                    .Where(v => v.EventId == eventId)
                    .OrderByDescending(v => v.UploadDate)
                    .ToListAsync();
            }
            catch (Exception)
            {
                // Fallback to explicit column selection if ThumbnailUrl column doesn't exist
                return await _context.Videos
                    .Where(v => v.EventId == eventId)
                    .OrderByDescending(v => v.UploadDate)
                    .Select(v => new Video
                    {
                        Id = v.Id,
                        Url = v.Url,
                        Description = v.Description,
                        UploadDate = v.UploadDate,
                        FileSize = v.FileSize,
                        ContentType = v.ContentType,
                        EventId = v.EventId,
                        // Set ThumbnailUrl to null since column might not exist
                        ThumbnailUrl = null
                    })
                    .ToListAsync();
            }
        }

        public async Task<Video?> GetVideoByIdAsync(int id)
        {
            try
            {
                return await _context.Videos.FindAsync(id);
            }
            catch (Exception)
            {
                // If FindAsync fails, try with explicit column selection
                return await _context.Videos
                    .Where(v => v.Id == id)
                    .Select(v => new Video
                    {
                        Id = v.Id,
                        Url = v.Url,
                        Description = v.Description,
                        UploadDate = v.UploadDate,
                        FileSize = v.FileSize,
                        ContentType = v.ContentType,
                        EventId = v.EventId,
                        ThumbnailUrl = null
                    })
                    .FirstOrDefaultAsync();
            }
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
