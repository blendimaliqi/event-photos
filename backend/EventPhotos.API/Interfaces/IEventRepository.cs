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
        Task<Event> CreateAsync(CreateEventDto eventDto);
        Task<bool> DeleteAsync(int id);
        Task<Event?> UpdateAsync(int id, UpdateEventDto eventDto);
        Task<bool> EventExists(int id);
    }
}