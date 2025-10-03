import { subscriber, MaintenanceEventData } from '../../../events/eventConfig.js';
import { notificarMantenimientoAAllOperaciones } from '../../../utils/send_email.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { AvionRepository } from '../repositories/AvionRepository.js';

export class FlotaService {
  private userRepository: UserRepository;
  private avionRepository: AvionRepository;
  private initialized = false;

  constructor() {
    this.userRepository = new UserRepository(); // Instancia del repositorio de usuarios
    this.avionRepository = new AvionRepository(); // Instancia del repositorio de aviones
  }

  async initListener(): Promise<void> {
    if (this.initialized) return; // Evita inicializaciones múltiples
    try {
      if (!subscriber.isOpen) {
        await subscriber.connect();
      }
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
      this.initialized = true;
    } catch (connectError: any) {
      console.error('Error al conectar al subscriber:', connectError);
      if (connectError.message.includes('ECONNREFUSED')) {
        console.error('Asegúrate de que Redis esté corriendo en localhost:6379');
      }
    }
  }
}

export const flotaService = new FlotaService();