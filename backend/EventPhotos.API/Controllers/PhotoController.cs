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

namespace EventPhotos.API.Controllers
{
    [Route("/api/photos")]
    [ApiController]
    public class PhotoController : ControllerBase
    {
        private readonly IPhotoRepository _photoRepository;
        private readonly IEventRepository _eventRepository;
        private readonly FileStorageService _fileStorageService;

        public PhotoController(
            IPhotoRepository photoRepository, 
            IEventRepository eventRepository,
            FileStorageService fileStorageService)
        {
            _photoRepository = photoRepository;
            _eventRepository = eventRepository;
            _fileStorageService = fileStorageService;
        }

        [HttpGet("event/{eventId}")]
        public async Task<IActionResult> GetByEventId([FromRoute] int eventId)
        {
            if (!await _eventRepository.EventExists(eventId))
            {
                return NotFound("Event not found");
            }

            var photos = await _photoRepository.GetPhotosByEventIdAsync(eventId);
            return Ok(photos.Select(p => p.ToPhotoDto()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var photo = await _photoRepository.GetPhotoByIdAsync(id);

            if (photo == null)
            {
                return NotFound();
            }

            return Ok(photo.ToPhotoDto());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id)
        {
            try
            {
                var photo = await _photoRepository.DeletePhotoAsync(id);

                if (photo == null)
                {
                    return NotFound();
                }

                // Delete the physical file
                _fileStorageService.DeletePhoto(photo.Url);

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the photo. Please try again later.");
            }
        }

        [HttpPost]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> Create(
            [FromForm] IFormFile file,
            [FromForm] int eventId,
            [FromForm] string? description)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was uploaded");
            }

            if (!await _eventRepository.EventExists(eventId))
            {
                return BadRequest("Event does not exist");
            }

            try
            {
                // Save the file and get its URL
                var fileUrl = await _fileStorageService.SavePhotoAsync(file);

                // Create the photo record
                var photoDto = new CreatePhotoDto
                {
                    Url = fileUrl,
                    EventId = eventId,
                    Description = description
                };

                var photo = await _photoRepository.AddPhotoAsync(photoDto);
                return CreatedAtAction(nameof(GetById), new { id = photo.Id }, photo.ToPhotoDto());
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while uploading the photo: {ex.Message}");
            }
        }
    }
}