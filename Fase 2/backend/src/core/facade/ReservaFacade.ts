import { ReservaRepository } from "../repository/repositories/ReservaRepository";
import { IReserva } from "../repository/models/Reserva";
import { VueloRepository } from "../repository/repositories/VueloRepository";
import { AvionRepository } from "../repository/repositories/AvionRepository";
import { EstadoReserva } from "../../types/reservas";
import { ReservaService } from "../repository/services/ReservaService";
import { VueloService } from "../repository/services/VueloService";
import { AvionService } from "../repository/services/AvionService";

export class ReservaFacade {

    constructor(private readonly vueloService: VueloService,
                private readonly avionService: AvionService,
                private readonly reservaService: ReservaService) { }

    async crearReserva(reserva: IReserva): Promise<IReserva> {

        // Validar existencia de vuelo
        const vueloExiste = await this.vueloService.obtenerVuelo(reserva.id_vuelo.toString());
        if (!vueloExiste) {
            throw new Error("El vuelo no existe");
        }

        // Validar existencia de avión
        const avionExiste = await this.avionService.getAvionById(vueloExiste.aeronave.toString());
        if (!avionExiste) {
            throw new Error("El avión asociado al vuelo no existe");
        }

        const reservasExistentes = await this.reservaService.listarReservasPorVuelo(vueloExiste._id.toString())
        // Agregar que la reserva no debe estar cancelada para liberar asientos
        const reservasActivas = reservasExistentes.filter(r => r.estado !== EstadoReserva.cancelada);
        const asientosReservados = reservasActivas.flatMap(r => r.asientos)

        const conflicto = reserva.asientos.filter(asiento => asientosReservados.includes(asiento));
        if (conflicto.length > 0) {
            throw new Error(`Los asientos ${conflicto.join(", ")} ya están reservados para este vuelo`);
        }

        const totalAsientosReservados = reservasExistentes.reduce((acc, r) => acc + r.asientos.length, 0);
        if (totalAsientosReservados + reserva.asientos.length > avionExiste.capacidadMaxima) {
            throw new Error("No hay suficientes asientos disponibles en el avión para esta reserva");
        }

        reserva.codigo_reserva = "RSV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        reserva.fecha_reserva = new Date();
        reserva.estado = EstadoReserva.pendiente_checkin

        return await this.reservaService.crearReserva(reserva);
    }

    async obtenerReserva(id: string): Promise<IReserva | null> {
        return await this.reservaService.obtenerReserva(id);
    }

    async listarReservasPorUsuario(id_usuario: string): Promise<IReserva[]> {
        return await this.reservaService.listarReservasPorUsuario(id_usuario);
    }

    async actualizarReserva(id: string, reserva: IReserva): Promise<IReserva | null> {
        return await this.reservaService.actualizarReserva(id, reserva);
    }

    async eliminarReserva(id: string): Promise<boolean> {
        return await this.reservaService.eliminarReserva(id);
    }

    async listarReservasPorVuelo(id_vuelo: string): Promise<IReserva[]> {
        return await this.reservaService.listarReservasPorVuelo(id_vuelo);
    }
}