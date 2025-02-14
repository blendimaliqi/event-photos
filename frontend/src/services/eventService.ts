import { config } from "../config/config";
import { Event } from "../types/event";

const API_URL = config.API_ENDPOINT;

export const eventService = {
  async getEvent(eventId: number): Promise<Event> {
    const response = await fetch(`${API_URL}/events/${eventId}`);

    if (!response.ok) {
      throw new Error("Failed to fetch event");
    }

    return response.json();
  },
};
