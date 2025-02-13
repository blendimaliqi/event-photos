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

        public async Task<Event?> DeleteAsync(int id)
        {
            var eventModel = await _context.Events.FirstOrDefaultAsync((e) => e.Id == id);

            if(eventModel == null) {
                return null;
            }

            _context.Events.Remove(eventModel);
            await _context.SaveChangesAsync();

            return eventModel;
        }

        public async Task<bool> DeleteHeroPhotoAsync(int eventId, bool deletePhoto = false)
        {
            if (!await EventExists(eventId))
            {
                return false;
            }

            var eventModel = await _context.Events
                .Include(e => e.HeroPhoto)
                .FirstOrDefaultAsync(e => e.Id == eventId);

            if (eventModel?.HeroPhotoId == null)
            {
                return false;
            }

            // Store the photo before clearing the reference
            var photoToDelete = deletePhoto ? eventModel.HeroPhoto : null;
            
 
            
            // If requested, delete the actual photo
            if (deletePhoto && photoToDelete != null)
            {         
                // Clear the hero photo reference
                eventModel.HeroPhotoId = null;
                _context.Photos.Remove(photoToDelete);
            }

            await _context.SaveChangesAsync();
            return true;
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
            return await _context.Events
                .Include(e => e.Photos)
                .FirstOrDefaultAsync(e => e.Id == id);
        }

        public async Task<Photo?> GetHeroPhotoAsync(int eventId)
        {
            var heroPhoto = await _context.Events
            .Where(e => e.Id == eventId)
            .Select(e => e.HeroPhoto)
            .FirstOrDefaultAsync();

            if (heroPhoto == null)
            {
                return null;
            }

            return heroPhoto;
        }

        public async Task<bool> CreateHeroPhotoAsync(int eventId, Photo photo)
        {
            if (!await EventExists(eventId))
            {
                return false;
            }

            var eventModel = await _context.Events
                .Include(e => e.HeroPhoto)
                .FirstOrDefaultAsync(e => e.Id == eventId);
            
            if(eventModel == null)
            {
                return false;
            }

            // If there's an existing hero photo, remove the reference (but keep the photo)
            eventModel.HeroPhotoId = null;
            
            // Add the new photo to the database first to get its ID
            await _context.Photos.AddAsync(photo);
            await _context.SaveChangesAsync();
            
            // Now set it as the hero photo
            eventModel.HeroPhotoId = photo.Id;
            await _context.SaveChangesAsync();

            return true;
        }

        public async Task<Event?> UpdateAsync(int id, UpdateEventDto eventDto)
        {
            var existingEvent = await _context.Events.FindAsync(id);

            if (existingEvent == null)
            {
                return null;
            }

            existingEvent.Name = eventDto.Name;
            existingEvent.Date = eventDto.Date;
            existingEvent.Description = eventDto.Description;

            await _context.SaveChangesAsync();

            return existingEvent;
        }
    }
}