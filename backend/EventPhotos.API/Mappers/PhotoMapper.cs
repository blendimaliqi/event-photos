using EventPhotos.API.DTOs;
using EventPhotos.API.Models;

namespace EventPhotos.API.Mappers
{
    public static class PhotoMapper
    {
        public static PhotoDto ToPhotoDto(this Photo photo)
        {
            return new PhotoDto
            {
                Id = photo.Id,
                Url = photo.Url,
                Description = photo.Description,
                UploadDate = photo.UploadDate,
                EventId = photo.EventId
            };
        }

        public static Photo ToPhotoFromCreatePhotoDto(this CreatePhotoDto photoDto)
        {
            return new Photo
            {
                Url = photoDto.Url,
                Description = photoDto.Description,
                EventId = photoDto.EventId,
                UploadDate = DateTime.UtcNow
            };
        }
    }
} 