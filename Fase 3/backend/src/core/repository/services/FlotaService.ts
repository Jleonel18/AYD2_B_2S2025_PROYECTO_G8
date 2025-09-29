import { subscriber, MaintenanceEventData } from '../../../events/eventConfig';
import { notificarMantenimientoAAllOperaciones } from '../../../utils/send_email';
import { UserRepository } from '../repositories/UserRepository';
import { AvionRepository } from '../repositories/AvionRepository';

export class FlotaService {

  private userRepository: UserRepository;
  private avionRepository: AvionRepository;

  constructor() {
    this.userRepository = new UserRepository(); // Instancia del repositorio de usuarios
    this.avionRepository = new AvionRepository(); // Instancia del repositorio de aviones
  }

  async initListener(): Promise<void> {
    try {
      await subscriber.connect();
      subscriber.subscribe('mantenimiento-avion', async (message: string) => {
        try {
          const data: MaintenanceEventData = JSON.parse(message);
          if (data.maintenanceStatus === 'Requiere Mantenimiento') {
            console.log(`Alerta de mantenimiento: Avión ${data.airplaneId} ha excedido el límite de horas (${data.hours}). Programar mantenimiento.`);
            await notificarMantenimientoAAllOperaciones(
              {
                airplaneId: data.airplaneId,
                hours: data.hours
              },
              this.userRepository, 
              this.avionRepository
            );
          }
        } catch (parseError) {
          console.error('Error al parsear mensaje de mantenimiento:', parseError);
        }
      });
    } catch (connectError) {
      console.error('Error al conectar al subscriber:', connectError);
    }
  }
}

export const flotaService = new FlotaService();
flotaService.initListener().catch(console.error);