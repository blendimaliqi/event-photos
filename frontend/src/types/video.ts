export interface Video {
  id: number;
  url: string;
  description: string;
  eventId: number;
  uploadDate: string;
  thumbnailUrl?: string;
}

export interface VideoUploadResponse {
  id: number;
  url: string;
  thumbnailUrl?: string;
}
