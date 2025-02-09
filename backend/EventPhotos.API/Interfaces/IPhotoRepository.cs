using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using EventPhotos.API.Models;
using EventPhotos.API.DTOs;

namespace EventPhotos.API.Interfaces
{
    public interface IPhotoRepository
    {
        Task<List<Photo>> GetPhotosByEventIdAsync(int eventId);
        Task<Photo?> GetPhotoByIdAsync(int id);
        Task<Photo> AddPhotoAsync(CreatePhotoDto photoDto);
        Task<Photo?> DeletePhotoAsync(int id);
        Task<bool> PhotoExists(int id);
    }
}