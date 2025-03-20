import { config } from "../config/config";
import { Event } from "../types/event";
import { Photo } from "../types/photo";

const API_URL = config.API_ENDPOINT;

export const eventService = {
  async getEvent(eventId: number): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${eventId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch event");
    }

    return response.json();
  },

  async getHeroPhoto(eventId: number): Promise<Photo | null> {
    try {
      const response = await fetch(`${API_URL}/events/${eventId}/hero-photo`);

      if (response.status === 404) {
        return null; // No hero photo found
      }

      if (!response.ok) {
        throw new Error("Failed to fetch hero photo");
      }

      return response.json();
    } catch (error) {
      console.error("Error fetching hero photo:", error);
      return null;
    }
  },
};
