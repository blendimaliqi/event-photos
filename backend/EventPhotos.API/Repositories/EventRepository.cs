using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Models;
using Microsoft.EntityFrameworkCore;

namespace EventPhotos.API.Repositories
{
    public class EventRepository : IEventRepository
    {
        private readonly ApplicationDbContext _context;

        public EventRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<Event> CreateAsync(Event eventModel)
        {
            var existingEvent = await _context.Events
                .FirstOrDefaultAsync(e => e.Name == eventModel.Name && e.Date.Date == eventModel.Date.Date);

            if (existingEvent != null)
            {
                throw new InvalidOperationException("An event with the same name and date already exists.");
            }

            await _context.Events.AddAsync(eventModel);
            await _context.SaveChangesAsync();
            
            return eventModel;
        }

        public Task<bool> DeleteAsync(int id)
        {
            throw new NotImplementedException();
        }

        public Task<bool> EventExists(int id)
        {
            return _context.Events.AnyAsync(e => e.Id == id);
        }

        public async Task<List<Event>> GetAllAsync()
        {
            return await _context.Events
                .Include(e => e.Photos)
                .ToListAsync();
        }

        public async Task<Event?> GetByIdAsync(int id)
        {
            return await _context.Events.Include(e => e.Photos).FirstOrDefaultAsync();
        }

        public Task<Event?> UpdateAsync(int id, UpdateEventDto eventDto)
        {
            throw new NotImplementedException();
        }
    }
}