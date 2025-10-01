import { subscriber, FlightEventData } from '../../../events/eventConfig';

export class NotificacionService {
  private initialized = false;

  async initListener(): Promise<void> {
    if (this.initialized) return; // Evita inicializaciones múltiples
    try {
      if (!subscriber.isOpen) {
        await subscriber.connect();
      }
      subscriber.subscribe('estado-vuelo', (message: string) => {
        try {
          const data: FlightEventData = JSON.parse(message);
          console.log(`Notificación a usuarios: El vuelo ${data.flightId} ha cambiado a estado '${data.newStatus}'. Notificar a pasajeros afectados.`);
          // Lógica futura: Obtener pasajeros del vuelo (via ReservaService), enviar emails o push
          // Ejemplo con Nodemailer (instala npm i nodemailer):
          // const transporter = nodemailer.createTransport({ ... });
          // transporter.sendMail({ to: 'pasajero@example.com', subject: 'Cambio en su vuelo', text: `El vuelo ${data.flightId} ahora está ${data.newStatus}.` });
        } catch (parseError) {
          console.error('Error al parsear mensaje de cambio de estado de vuelo:', parseError);
        }
      });
      this.initialized = true;
    } catch (connectError: any) {
      console.error('Error al conectar al subscriber para notificaciones:', connectError);
      if (connectError.message.includes('ECONNREFUSED')) {
        console.error('Asegúrate de que Redis esté corriendo en localhost:6379');
      }
    }
  }
}

export const notificacionService = new NotificacionService();