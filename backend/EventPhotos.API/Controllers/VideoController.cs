using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Mappers;
using EventPhotos.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.OpenApi.Models;
using Swashbuckle.AspNetCore.Annotations;
using Microsoft.AspNetCore.Antiforgery;

namespace EventPhotos.API.Controllers
{
    [Route("/api/videos")]
    [ApiController]
    public class VideoController : ControllerBase
    {
        private readonly IVideoRepository _videoRepository;
        private readonly IEventRepository _eventRepository;
        private readonly FileStorageService _fileStorageService;
        private readonly IAntiforgery _antiforgery;
        
        // Max total size per event in bytes (default: 500MB)
        private const long MaxTotalVideoSizePerEventBytes = 524288000;

        public VideoController(
            IVideoRepository videoRepository, 
            IEventRepository eventRepository,
            FileStorageService fileStorageService,
            IAntiforgery antiforgery)
        {
            _videoRepository = videoRepository;
            _eventRepository = eventRepository;
            _fileStorageService = fileStorageService;
            _antiforgery = antiforgery;
        }

        [HttpGet("event/{eventId:int}")]
        public async Task<IActionResult> GetByEventId([FromRoute] int eventId)
        {
            if (!await _eventRepository.EventExists(eventId))
            {
                return NotFound("Event not found");
            }

            var videos = await _videoRepository.GetVideosByEventIdAsync(eventId);
            return Ok(videos.Select(v => v.ToVideoDto()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var video = await _videoRepository.GetVideoByIdAsync(id);

            if (video == null)
            {
                return NotFound();
            }

            return Ok(video.ToVideoDto());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var video = await _videoRepository.DeleteVideoAsync(id);

                if (video == null)
                {
                    return NotFound();
                }

                // Delete the physical file
                _fileStorageService.DeleteVideo(video.Url);

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while deleting the video: {ex.Message}");
            }
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        [IgnoreAntiforgeryToken]
        public async Task<IActionResult> Create(
            [FromForm] IFormFile file,
            [FromForm] int eventId,
            [FromForm] string? description,
            [FromForm] IFormFile? thumbnail)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was uploaded");
            }

            if (!await _eventRepository.EventExists(eventId))
            {
                return BadRequest("Event does not exist");
            }
            
            // Check if file size exceeds individual limit
            if (file.Length > FileStorageService.MaxVideoSizeBytes)
            {
                return BadRequest($"Video file size exceeds the maximum allowed size of {FileStorageService.MaxVideoSizeBytes / 1024 / 1024}MB.");
            }
            
            // Check if total video size for the event would exceed the limit
            var currentTotalSize = await _videoRepository.GetTotalVideoSizeByEventIdAsync(eventId);
            if (currentTotalSize + file.Length > MaxTotalVideoSizePerEventBytes)
            {
                return BadRequest($"Total video size for this event would exceed the maximum limit of {MaxTotalVideoSizePerEventBytes / 1024 / 1024}MB. " +
                                 $"Current total: {currentTotalSize / 1024 / 1024}MB.");
            }

            try
            {
                // Save the video file and get its URL, size, and content type
                var (fileUrl, fileSize, contentType) = await _fileStorageService.SaveVideoAsync(file);
                Console.WriteLine($"Video saved: {fileUrl}, size: {fileSize}, contentType: {contentType}");
                
                // Save thumbnail if provided
                string? thumbnailUrl = null;
                if (thumbnail != null && thumbnail.Length > 0)
                {
                    try
                    {
                        // Save the thumbnail as a photo
                        thumbnailUrl = await _fileStorageService.SavePhotoAsync(thumbnail);
                        Console.WriteLine($"Thumbnail saved successfully: {thumbnailUrl}");
                    }
                    catch (Exception ex)
                    {
                        // Log but continue - we can still save the video without a thumbnail
                        Console.WriteLine($"Error saving thumbnail: {ex.Message}");
                    }
                }
                else
                {
                    Console.WriteLine("No thumbnail provided");
                }

                // Create the video record
                var videoDto = new CreateVideoDto
                {
                    Url = fileUrl,
                    EventId = eventId,
                    Description = description,
                    FileSize = fileSize,
                    ContentType = contentType,
                    ThumbnailUrl = thumbnailUrl
                };

                Console.WriteLine($"Creating video with URL: {fileUrl}, ThumbnailURL: {thumbnailUrl}");

                var video = await _videoRepository.AddVideoAsync(videoDto);
                Console.WriteLine($"Video created with ID: {video.Id}, ThumbnailURL: {video.ThumbnailUrl}");
                
                return CreatedAtAction(nameof(GetById), new { id = video.Id }, video.ToVideoDto());
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error uploading video: {ex.Message}");
                Console.WriteLine($"Exception details: {ex}");
                return StatusCode(500, $"An error occurred while uploading the video: {ex.Message}");
            }
        }
    }
}
