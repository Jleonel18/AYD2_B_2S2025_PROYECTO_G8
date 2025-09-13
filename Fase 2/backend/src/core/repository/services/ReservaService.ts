import { IReserva } from "../models/Reserva";
import { IReservaRepository } from "../repositories/IReserva";

export class ReservaService {
    private reservaRepository: IReservaRepository;
    constructor(reservaRepository: IReservaRepository) {
        this.reservaRepository = reservaRepository;
    }

    async crearReserva(datos: Partial<IReserva>): Promise<IReserva> {
        console.log("Reserva a guardar:", datos);
        return await this.reservaRepository.crearReserva(datos as IReserva);
    }

    async obtenerReserva(id: string): Promise<IReserva | null> {
        return await this.reservaRepository.obtenerReservaPorId(id);
    }

    async listarReservasPorUsuario(id_usuario: string): Promise<IReserva[]> {
        return await this.reservaRepository.obtenerReservasPorUsuario(id_usuario);
    }

    async actualizarReserva(id: string, datos: Partial<IReserva>): Promise<IReserva | null> {
        return await this.reservaRepository.actualizarReserva(id, datos);
    }

    async eliminarReserva(id: string): Promise<boolean> {
        return await this.reservaRepository.eliminarReserva(id);
    }

    async listarReservasPorVuelo(id_vuelo: string): Promise<IReserva[]> {
        return await this.reservaRepository.obtenerReservasPorVuelo(id_vuelo);
    }

}