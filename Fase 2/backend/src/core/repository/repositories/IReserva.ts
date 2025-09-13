import { IReserva } from "../models/Reserva";

export interface IReservaRepository {
    crearReserva(reserva: IReserva): Promise<IReserva>;
    obtenerReservaPorId(id: string): Promise<IReserva | null>;
    obtenerReservasPorUsuario(id_usuario: string): Promise<IReserva[]>;
    actualizarReserva(id: string, reserva: Partial<IReserva>): Promise<IReserva | null>;
    eliminarReserva(id: string): Promise<boolean>;
    obtenerReservasPorVuelo(id_vuelo: string): Promise<IReserva[]>;
}
