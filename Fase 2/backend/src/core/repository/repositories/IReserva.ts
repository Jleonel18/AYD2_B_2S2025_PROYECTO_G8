import { EstadoReserva } from "../../../types/reservas";
import { IReserva } from "../models/Reserva";

export interface IReservaRepository {
    crearReserva(reserva: IReserva): Promise<IReserva>;
    obtenerReservaPorId(id: string): Promise<IReserva | null>;
    obtenerReservasPorUsuario(id_usuario: string): Promise<IReserva[]>;
    actualizarReserva(id: string, reserva: Partial<IReserva>): Promise<IReserva | null>;
    eliminarReserva(id: string): Promise<boolean>;
    obtenerReservasPorVuelo(id_vuelo: string): Promise<IReserva[]>;
    cancelarReservasPorVuelo(id_vuelo: string): Promise<number>;
    hacerCheckIn(id: string, maletas: { tipo: string; peso: number }[]): Promise<IReserva | null>;
    cambiarEstadoReserva(id: string, estado: EstadoReserva): Promise<IReserva | null>;
}
