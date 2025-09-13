import { EstadoReserva } from "../../../types/reservas";
import { ReservaModel, IReserva } from "../models/Reserva";
import { IReservaRepository } from "./IReserva";

export class ReservaRepository implements IReservaRepository {
    async crearReserva(reserva: IReserva): Promise<IReserva> {
        const nuevaReserva = new ReservaModel(reserva);
        return await nuevaReserva.save();
    }

    async obtenerReservaPorId(id: string): Promise<IReserva | null> {
        return await ReservaModel.findById(id).exec();
    }

    async obtenerReservasPorUsuario(id_usuario: string): Promise<IReserva[]> {
        return await ReservaModel.find({ id_usuario }).exec();
    }

    async actualizarReserva(id: string, reserva: Partial<IReserva>): Promise<IReserva | null> {
        return await ReservaModel.findByIdAndUpdate(id, reserva, { new: true }).exec();
    }

    async eliminarReserva(id: string): Promise<boolean> {
        // Cambiar estado a cancelada en lugar de eliminar
        const reserva = await ReservaModel.findById(id).exec();
        if (reserva) {
            reserva.estado = EstadoReserva.cancelada;
            await reserva.save();
            return true;
        }

        return false;
    }

    async obtenerReservasPorVuelo(id_vuelo: string): Promise<IReserva[]> {
        return await ReservaModel.find({ id_vuelo }).exec();
    }
}
