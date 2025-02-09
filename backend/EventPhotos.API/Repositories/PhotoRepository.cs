using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using EventPhotos.API.DTOs;
using EventPhotos.API.Interfaces;
using EventPhotos.API.Models;
using EventPhotos.API.Mappers;
using Microsoft.EntityFrameworkCore;

namespace EventPhotos.API.Repositories
{
    public class PhotoRepository : IPhotoRepository
    {
        private readonly ApplicationDbContext _context;

        public PhotoRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<List<Photo>> GetPhotosByEventIdAsync(int eventId)
        {
            return await _context.Photos
                .Where(p => p.EventId == eventId)
                .ToListAsync();
        }

        public async Task<Photo?> GetPhotoByIdAsync(int id)
        {
            return await _context.Photos
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<Photo> AddPhotoAsync(CreatePhotoDto photoDto)
        {
            var photo = photoDto.ToPhotoFromCreatePhotoDto();
            await _context.Photos.AddAsync(photo);
            await _context.SaveChangesAsync();
            return photo;
        }

        public async Task<Photo?> DeletePhotoAsync(int id)
        {
            var photo = await _context.Photos.FindAsync(id);

            if (photo == null)
            {
                return null;
            }

            _context.Photos.Remove(photo);
            await _context.SaveChangesAsync();

            return photo;
        }

        public async Task<bool> PhotoExists(int id)
        {
            return await _context.Photos.AnyAsync(p => p.Id == id);
        }
    }
}