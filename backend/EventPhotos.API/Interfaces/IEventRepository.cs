using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EventPhotos.API.Models;
using EventPhotos.API.DTOs;

namespace EventPhotos.API.Interfaces
{
    public interface IEventRepository
    {
        Task<List<Event>> GetAllAsync();
        Task<Event?> GetByIdAsync(int id);
        Task<Event> CreateAsync(Event eventModel);
        Task<Event?> DeleteAsync(int id);
        Task<Event?> UpdateAsync(int id, UpdateEventDto eventDto);
        Task<bool> EventExists(int id);

        // Hero Photo
        Task<bool> CreateHeroPhotoAsync(int eventId, Photo photo);
        Task<bool> DeleteHeroPhotoAsync(int eventId, bool deletePhoto = false);
        Task<Photo?> GetHeroPhotoAsync(int eventId);
    }
}