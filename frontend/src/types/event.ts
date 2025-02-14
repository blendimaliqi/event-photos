import { Photo } from "./photo";

export interface Event {
  id: number;
  name: string;
  date: string;
  description: string;
  heroPhotoId?: number;
  heroPhoto?: Photo;
  photos: Photo[];
}
