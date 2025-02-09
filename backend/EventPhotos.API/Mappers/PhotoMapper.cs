using EventPhotos.API.DTOs;
using EventPhotos.API.Models;

namespace EventPhotos.API.Mappers
{
    public static class PhotoMapper
    {
        public static PhotoDto ToPhotoDto(this Photo photoModel)
        {
            return new PhotoDto
            {
                Id = photoModel.Id,
                Url = photoModel.Url,
                Description = photoModel.Description,
                UploadDate = photoModel.UploadDate,
                EventId = photoModel.EventId
            };
        }
    }
} 