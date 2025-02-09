using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Mappers;
using Microsoft.AspNetCore.Mvc;

namespace EventPhotos.API.Controllers
{
    [Route("/api/photos")]
    [ApiController]
    public class PhotoController : ControllerBase
    {
        private readonly IPhotoRepository _photoRepository;
        private readonly IEventRepository _eventRepository;

        public PhotoController(IPhotoRepository photoRepository, IEventRepository eventRepository)
        {
            _photoRepository = photoRepository;
            _eventRepository = eventRepository;
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

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePhotoDto photoDto)
        {
            if (!await _eventRepository.EventExists(photoDto.EventId))
            {
                return BadRequest("Event does not exist");
            }

            try
            {
                var photo = await _photoRepository.AddPhotoAsync(photoDto);
                return CreatedAtAction(nameof(GetById), new { id = photo.Id }, photo.ToPhotoDto());
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while creating the photo. Please try again later.");
            }
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

                return NoContent();
            }
            catch (Exception)
            {
                return StatusCode(500, "An error occurred while deleting the photo. Please try again later.");
            }
        }
    }
}