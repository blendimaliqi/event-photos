using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Models;

namespace EventPhotos.API.Mappers
{
    public static class EventMapper
    {
        public static EventDto ToEventDto(this Event eventModel)
        {
            return new EventDto
            {
                Id = eventModel.Id,
                Name = eventModel.Name,
                Date = eventModel.Date,
                Description = eventModel.Description,
                HeroPhotoId = eventModel.HeroPhotoId,
                HeroPhoto = eventModel.HeroPhoto?.ToPhotoDto(),
                Photos = eventModel.Photos.Select(p => p.ToPhotoDto()).ToList()
            };
        }

        public static Event ToEvent(this CreateEventDto eventDto)
        {
            return new Event
            {
                Name = eventDto.Name,
                Date = eventDto.Date,
                Description = eventDto.Description
            };
        }
    }
}