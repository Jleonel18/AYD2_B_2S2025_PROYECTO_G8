// eventConfig.ts
import { createClient } from 'redis';

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

const publisher = createClient();
const subscriber = createClient();

export { publisher, subscriber, FlightEventData, MaintenanceEventData };