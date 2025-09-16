import { ReservaRepository } from "../repository/repositories/ReservaRepository.js";
import { IReserva } from "../repository/models/Reserva.js";
import { VueloRepository } from "../repository/repositories/VueloRepository.js";
import { AvionRepository } from "../repository/repositories/AvionRepository.js";
import { EstadoReserva } from "../../types/reservas.js";
import { ReservaService } from "../repository/services/ReservaService.js";
import { VueloService } from "../repository/services/VueloService.js";
import { AvionService } from "../repository/services/AvionService.js";

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

        // // Validar que las maletas no excedan el limite (50 lbs/cada una)
        // for (const maleta of reserva.maletas) {
        //     if (maleta.peso > 50) {
        //         throw new Error(`La maleta excede el límite de peso permitido (50 lbs)`);
        //     }
        // }

        reserva.codigo_reserva = "RSV-" + Math.random().toString(36).substring(2, 8).toUpperCase();
        reserva.fecha_reserva = new Date();
        reserva.estado = EstadoReserva.pendiente_checkin

        return await this.reservaService.crearReserva(reserva);
    }

    async obtenerReserva(id: string): Promise<IReserva | null> {
        
        const reserva = await this.reservaService.obtenerReserva(id);

        if (!reserva) {
            throw new Error("Reserva no encontrada");
        }

        return reserva;
    }

    async listarReservasPorUsuario(id_usuario: string): Promise<IReserva[]> {
        return await this.reservaService.listarReservasPorUsuario(id_usuario);
    }

    async actualizarReserva(id: string, reserva: IReserva): Promise<IReserva | null> {
        return await this.reservaService.actualizarReserva(id, reserva);
    }

    async eliminarReserva(id: string, id_usuario: string): Promise<boolean> {

        const reserva = await this.reservaService.obtenerReserva(id);
        if (!reserva) {
            throw new Error("Reserva no encontrada");
        }

        if (reserva.estado === EstadoReserva.cancelada) {
            throw new Error("La reserva ya está cancelada");
        }

        // Validar que la reserva sea del usuario
        if (reserva.id_usuario.toString() !== id_usuario) {
            throw new Error("No tienes permiso para cancelar esta reserva");
        }

        return await this.reservaService.eliminarReserva(id);
    }

    async listarReservasPorVuelo(id_vuelo: string): Promise<IReserva[]> {
        return await this.reservaService.listarReservasPorVuelo(id_vuelo);
    }

    async hacerCheckIn(id: string, id_usuario: string, maletas: { tipo: string; peso: number }[]): Promise<IReserva | null> {

        const reserva = await this.reservaService.obtenerReserva(id);
        if (!reserva) {
            throw new Error("Reserva no encontrada");
        }

        // Validar que la reserva esté en estado pendiente_checkin
        if (reserva.estado !== EstadoReserva.pendiente_checkin) {
            throw new Error("La reserva no está en estado de check-in");
        }

        // Validar que la reserva sea del usuario
        if (reserva.id_usuario.toString() !== id_usuario) {
            throw new Error("No tienes permiso para hacer check-in en esta reserva");
        }

        for (const maleta of maletas) {
            if (maleta.peso > 50) {
                throw new Error(`La maleta excede el límite de peso permitido (50 lbs)`);
            }
        }

        return await this.reservaService.hacerCheckIn(id, maletas);
    }

    async cambiarEstadoReserva(id: string): Promise<IReserva | null> {
        
        const reserva = await this.reservaService.obtenerReserva(id);
        if (!reserva) {
            throw new Error("Reserva no encontrada");
        }

        let estado: EstadoReserva;
        if (reserva.estado === EstadoReserva.pendiente_checkin) {
            throw new Error("La reserva debe pasar por check-in antes de cambiar de estado");
        }
        else if (reserva.estado === EstadoReserva.pendiente_abordaje) {
            estado = EstadoReserva.abordado;
        }
        else {
            throw new Error("La reserva no está en un estado válido para cambiar");
        }

        return await this.reservaService.cambiarEstadoReserva(id, estado);
    }

    async obtenerAsientosReservados(id_vuelo: string): Promise<number[]> {
        const reservas = await this.reservaService.listarReservasPorVuelo(id_vuelo);
        // Filtrar reservas que no estén canceladas
        const reservasActivas = reservas.filter(r => r.estado !== EstadoReserva.cancelada);
        const asientos = reservasActivas.flatMap(r => r.asientos);
        return asientos;
    }
}