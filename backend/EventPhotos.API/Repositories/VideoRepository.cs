using Microsoft.EntityFrameworkCore;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Mappers;
using EventPhotos.API.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Npgsql;

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
                return await _context.Videos
                    .Where(v => v.EventId == eventId)
                    .OrderByDescending(v => v.UploadDate)
                    .ToListAsync();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving videos: {ex.Message}");
                // Return empty list rather than crashing
                return new List<Video>();
            }
        }

        public async Task<Video?> GetVideoByIdAsync(int id)
        {
            try
            {
                return await _context.Videos.FindAsync(id);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error retrieving video by ID: {ex.Message}");
                return null;
            }
        }

        public async Task<Video> AddVideoAsync(CreateVideoDto videoDto)
        {
            var video = videoDto.ToVideoFromCreate();
            
            try
            {
                // Add to context and save
                await _context.Videos.AddAsync(video);
                await _context.SaveChangesAsync();
                return video;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error adding video (EF approach): {ex.Message}");
                
                // Fallback to direct SQL approach
                try
                {
                    // Insert using direct SQL (minimal approach)
                    video.Id = await InsertVideoWithSQL(videoDto);
                    return video;
                }
                catch (Exception innerEx)
                {
                    Console.WriteLine($"Error adding video (SQL approach): {innerEx.Message}");
                    throw new Exception($"Failed to add video: {ex.Message}, {innerEx.Message}");
                }
            }
        }

        private async Task<int> InsertVideoWithSQL(CreateVideoDto videoDto)
        {
            var sql = @"
                INSERT INTO ""Videos"" (""Url"", ""Description"", ""EventId"", ""FileSize"", ""ContentType"", ""UploadDate"", ""ThumbnailUrl"")
                VALUES (@url, @description, @eventId, @fileSize, @contentType, @uploadDate, @thumbnailUrl)
                RETURNING ""Id""";
            
            using (var connection = _context.Database.GetDbConnection() as NpgsqlConnection)
            {
                if (connection.State != System.Data.ConnectionState.Open)
                    await connection.OpenAsync();
                
                using (var cmd = new NpgsqlCommand(sql, connection))
                {
                    cmd.Parameters.AddWithValue("@url", videoDto.Url);
                    cmd.Parameters.AddWithValue("@description", videoDto.Description ?? (object)DBNull.Value);
                    cmd.Parameters.AddWithValue("@eventId", videoDto.EventId);
                    cmd.Parameters.AddWithValue("@fileSize", videoDto.FileSize);
                    cmd.Parameters.AddWithValue("@contentType", videoDto.ContentType);
                    cmd.Parameters.AddWithValue("@uploadDate", DateTime.UtcNow);
                    cmd.Parameters.AddWithValue("@thumbnailUrl", videoDto.ThumbnailUrl ?? (object)DBNull.Value);
                    
                    // Log the SQL parameters for debugging
                    Console.WriteLine($"Inserting video with SQL: Url={videoDto.Url}, ThumbnailUrl={videoDto.ThumbnailUrl ?? "null"}");
                    
                    var result = await cmd.ExecuteScalarAsync();
                    return result != null ? Convert.ToInt32(result) : 0;
                }
            }
        }

        public async Task<Video?> DeleteVideoAsync(int id)
        {
            try
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
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting video: {ex.Message}");
                return null;
            }
        }

        public async Task<long> GetTotalVideoSizeByEventIdAsync(int eventId)
        {
            try
            {
                return await _context.Videos
                    .Where(v => v.EventId == eventId)
                    .SumAsync(v => v.FileSize);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting total video size: {ex.Message}");
                return 0;
            }
        }
    }
}
