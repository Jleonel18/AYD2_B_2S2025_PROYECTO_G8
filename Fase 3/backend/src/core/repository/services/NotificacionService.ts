import { subscriber, FlightEventData } from '../../../events/eventConfig'; // Ajusta la ruta

export class NotificacionService {
  async initListener(): Promise<void> {
    try {
      await subscriber.connect();
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
    } catch (connectError) {
      console.error('Error al conectar al subscriber para notificaciones:', connectError);
    }
  }
}

export const notificacionService = new NotificacionService();
notificacionService.initListener().catch(console.error);