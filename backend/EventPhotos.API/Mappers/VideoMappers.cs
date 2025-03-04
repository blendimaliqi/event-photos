using EventPhotos.API.DTOs;
using EventPhotos.API.Models;

namespace EventPhotos.API.Mappers
{
    public static class VideoMappers
    {
        public static VideoDto ToVideoDto(this Video video)
        {
            return new VideoDto
            {
                Id = video.Id,
                Url = video.Url,
                Description = video.Description,
                UploadDate = video.UploadDate,
                FileSize = video.FileSize,
                ContentType = video.ContentType,
                ThumbnailUrl = video.ThumbnailUrl,
                EventId = video.EventId
            };
        }

        public static Video ToVideoFromCreate(this CreateVideoDto videoDto)
        {
            return new Video
            {
                Url = videoDto.Url,
                Description = videoDto.Description,
                EventId = videoDto.EventId,
                UploadDate = DateTime.UtcNow,
                FileSize = videoDto.FileSize,
                ContentType = videoDto.ContentType,
                ThumbnailUrl = videoDto.ThumbnailUrl
            };
        }
    }
}
