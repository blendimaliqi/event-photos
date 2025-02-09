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
    [Route("/api/events")]
    [ApiController]
    public class EventController: ControllerBase
    {
        private readonly IEventRepository _eventRepository;
        
        public EventController(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
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

            if(eventModel  == null)
            {
                return NotFound();
            }

            return Ok(eventModel.ToEventDto());
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
                NotFound();
            }

            return NoContent();
        }

    }
}