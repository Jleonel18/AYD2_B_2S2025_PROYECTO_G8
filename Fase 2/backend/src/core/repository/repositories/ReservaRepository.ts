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

    async cancelarReservasPorVuelo(id_vuelo: string): Promise<number> {
        const resultado = await ReservaModel.updateMany(
            { id_vuelo, estado: { $ne: EstadoReserva.cancelada } },
            { $set: { estado: EstadoReserva.cancelada } }
        ).exec();
        return resultado.modifiedCount;
    }

    async hacerCheckIn(id: string, maletas: { tipo: string; peso: number }[]): Promise<IReserva | null> {
        const reserva = await ReservaModel.findById(id).exec();
        if (!reserva) {
            throw new Error("Reserva no encontrada");
        }

        // Validar que la reserva esté en estado pendiente_checkin
        if (reserva.estado !== EstadoReserva.pendiente_checkin) {
            throw new Error("La reserva no está en estado de check-in");
        }

        // Asignar maletas a la reserva
        reserva.maletas = maletas;
        reserva.estado = EstadoReserva.pendiente_abordaje;

        await reserva.save();
        return reserva;
    }

    async cambiarEstadoReserva(id: string, estado: EstadoReserva): Promise<IReserva | null> {
        const reserva = await ReservaModel.findById(id).exec();
        if (!reserva) {
            throw new Error("Reserva no encontrada");
        }

        reserva.estado = estado;
        await reserva.save();
        return reserva;
    }
}
