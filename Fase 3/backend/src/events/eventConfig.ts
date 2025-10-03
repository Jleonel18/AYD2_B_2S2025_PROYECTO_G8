// eventConfig.ts
import { createClient } from 'redis';

export const publisher = createClient();
export const subscriber = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });

interface FlightEventData {
  flightId: string;
  newStatus: string;
}

interface MaintenanceEventData {
  airplaneId: string;
  hours: number;
  limitExceeded: boolean;
  maintenanceStatus: string;
}

//const publisher = createClient();
//const subscriber = createClient();

export { FlightEventData, MaintenanceEventData };