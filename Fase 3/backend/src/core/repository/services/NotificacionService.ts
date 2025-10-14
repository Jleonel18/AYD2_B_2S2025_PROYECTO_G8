import { subscriber, FlightEventData } from '../../../events/eventConfig.js';
import { EstadoReserva } from '../../../types/reservas.js';
import { generarCodigoQR } from '../../../utils/qr.js';
import { enviarCorreoReservaEstado } from '../../../utils/send_email.js';
import { ReservaFacade } from '../../facade/ReservaFacade.js';
import { AvionRepository } from '../repositories/AvionRepository.js';
import { IAvionRepository } from '../repositories/IAvionRepository.js';
import { IReservaRepository } from '../repositories/IReserva.js';
import { IUserRepository } from '../repositories/IUserRepository.js';
import { IVueloRepository } from '../repositories/IVueloRepository.js';
import { ReservaRepository } from '../repositories/ReservaRepository.js';
import { UserRepository } from '../repositories/UserRepository.js';
import { VueloRepository } from '../repositories/VueloRepository.js';
import { AvionService } from './AvionService.js';
import { ReservaService } from './ReservaService.js';
import { UserService } from './UserService.js';
import { VueloService } from './VueloService.js';

const userRepo = new UserRepository();
const reservaRepo = new ReservaRepository();
const vueloRepo = new VueloRepository();
const avionRepo = new AvionRepository();

export class NotificacionService {
  private reservaService: ReservaService;
  private userService: UserService
  private vueloService: VueloService;
  private avionService: AvionService
  private reservaFacade: ReservaFacade
  private initialized = false;

  constructor(user: IUserRepository, reserva: IReservaRepository, vuelo: IVueloRepository, avion: IAvionRepository) {
    this.userService = new UserService(user)
    this.reservaService = new ReservaService(reserva, this.userService);
    this.vueloService = new VueloService(vuelo);
    this.avionService = new AvionService(avion);
    this.reservaFacade = new ReservaFacade(this.vueloService, this.avionService,this.reservaService);
  }

  async initListener(): Promise<void> {
    if (this.initialized) return; // Evita inicializaciones múltiples
    try {
      if (!subscriber.isOpen) {
        await subscriber.connect();
      }
      subscriber.subscribe('estado-vuelo', async (message: string) => {
        try {
          const data: FlightEventData = JSON.parse(message);
          console.log(`Notificación a usuarios: El vuelo ${data.flightId} ha cambiado a estado '${data.newStatus}'. Notificar a pasajeros afectados.`);
          
          const reservas = await this.reservaService.listarReservasPorVuelo(data.flightId);

          for (const reserva of reservas) {
            const reservaActualizada = await this.reservaFacade.cambiarEstadoReserva(reserva._id.toString());
            if(!reservaActualizada) continue;
            const qrCode = await generarCodigoQR(reservaActualizada._id.toString())
            const user = await this.userService.obtenerUsuario(reserva.id_usuario.toString());
            if(!user) continue;
            await enviarCorreoReservaEstado({ correoDestino: user.correo, nombre: user.nombre, codigo_reserva: reservaActualizada.codigo_reserva, qrCode: qrCode, estado: reservaActualizada.estado as EstadoReserva });
          }

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

export const notificacionService = new NotificacionService(userRepo, reservaRepo, vueloRepo, avionRepo);