import { Photo } from "./photo";

export interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  heroPhotoId?: number;
  heroPhotoUrl?: string;
  heroPhoto?: Photo;
  photos: Photo[];
}
