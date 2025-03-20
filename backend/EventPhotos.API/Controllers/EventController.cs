using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Mappers;
using EventPhotos.API.Models;
using EventPhotos.API.Services;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;

namespace EventPhotos.API.Controllers
{
    [Route("/api/events")]
    [ApiController]
    public class EventController: ControllerBase
    {
        private readonly IEventRepository _eventRepository;
        private readonly FileStorageService _fileStorageService;
        
        public EventController(
            IEventRepository eventRepository,
            FileStorageService fileStorageService)
        {
            _eventRepository = eventRepository;
            _fileStorageService = fileStorageService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll() 
        {
            try
            {
                var events = await _eventRepository.GetAllAsync();
                var eventsDto = events.Select(e => e.ToEventDto());
                return Ok(eventsDto);
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while fetching events. Please try again later.");
            }
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id) 
        {
            var eventModel = await _eventRepository.GetByIdAsync(id);

            if(eventModel == null)
            {
                return NotFound();
            }

            // Create the DTO with hero photo info
            var eventDto = eventModel.ToEventDto();

            // If hero photo exists, include additional details
            if (eventModel.HeroPhotoId.HasValue)
            {
                // Get the hero photo from the photo repository
                var photoRepository = HttpContext.RequestServices.GetRequiredService<IPhotoRepository>();
                var heroPhoto = await photoRepository.GetPhotoByIdAsync(eventModel.HeroPhotoId.Value);
                
                if (heroPhoto != null)
                {
                    // Add the hero photo URL to the response
                    eventDto.HeroPhotoUrl = heroPhoto.Url;
                }
            }

            return Ok(eventDto);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateEventDto eventDto) 
        {
            var eventModel = eventDto.ToEvent();
            var createdEvent = await _eventRepository.CreateAsync(eventModel);
            return CreatedAtAction(nameof(GetById), new { id = createdEvent.Id }, createdEvent.ToEventDto());
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update([FromRoute] int id, [FromBody] UpdateEventDto eventDto)
        {
            var eventModel = await _eventRepository.UpdateAsync(id, eventDto);

            if(eventModel == null)
            {
                return NotFound();
            }

            return Ok(eventModel.ToEventDto());
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete([FromRoute] int id) 
        {
            var eventModel = await _eventRepository.DeleteAsync(id);

            if(eventModel == null)
            {
                return NotFound();
            }

            return NoContent();
        }

        [HttpPost("{id}/hero-photo")]
        [Consumes("multipart/form-data")]
        public async Task<IActionResult> UploadHeroPhoto(
            [FromRoute] int id,
            [FromForm] IFormFile file,
            [FromForm] string? description)
        {
            if (file == null || file.Length == 0)
            {
                return BadRequest("No file was uploaded");
            }

            if (!await _eventRepository.EventExists(id))
            {
                return BadRequest("Event does not exist");
            }

            try
            {
                // Save the file and get its URL
                var fileUrl = await _fileStorageService.SavePhotoAsync(file);

                // Create the photo record
                var photo = new Photo
                {
                    Url = fileUrl,
                    EventId = id,
                    Description = description,
                    UploadDate = DateTime.UtcNow
                };

                var success = await _eventRepository.CreateHeroPhotoAsync(id, photo);
                if (!success)
                {
                    // Clean up the uploaded file since we couldn't set it as hero
                    _fileStorageService.DeletePhoto(fileUrl);
                    return StatusCode(500, "Failed to set hero photo for the event");
                }

                // Get the updated event to return the complete data
                var updatedEvent = await _eventRepository.GetByIdAsync(id);
                return CreatedAtAction(nameof(GetById), new { id }, updatedEvent?.ToEventDto());
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred while uploading the hero photo: {ex.Message}");
            }
        }

        [HttpGet("{id}/hero-photo")]
        public async Task<IActionResult> GetHeroPhoto([FromRoute] int id)
        {
            var eventModel = await _eventRepository.GetByIdAsync(id);

            if (eventModel == null)
            {
                return NotFound("Event not found");
            }

            if (eventModel.HeroPhotoId == null)
            {
                return NotFound("Event has no hero photo");
            }

            // Get the hero photo from the photo repository
            var photoRepository = HttpContext.RequestServices.GetRequiredService<IPhotoRepository>();
            var heroPhoto = await photoRepository.GetPhotoByIdAsync(eventModel.HeroPhotoId.Value);

            if (heroPhoto == null)
            {
                return NotFound("Hero photo not found");
            }

            return Ok(heroPhoto);
        }
    }
}