import { EstadoReserva } from "../../../types/reservas";
import { Observador } from "../../observer/observador";
import { IReserva } from "../models/Reserva";
import { IReservaRepository } from "../repositories/IReserva";
import { ReservaRepository } from "../repositories/ReservaRepository";
import { UserService } from "./UserService";
import { enviarCorreoCancelacion } from "../../../utils/send_email";

export class ReservaService {
    private reservaRepository: IReservaRepository;
    private observadores: Observador[] = [];

    constructor(reservaRepository: IReservaRepository, private userService: UserService) {
        this.reservaRepository = reservaRepository;
    }



    // Métodos para gestionar observadores
    public registrarObservador(observador: Observador): void {
        this.observadores.push(observador);
    }

    public eliminarObservador(observador: Observador): void {
        const index = this.observadores.indexOf(observador);
        if (index !== -1) {
            this.observadores.splice(index, 1);
        }
    }

    private async notificarObservadores(estado: EstadoReserva, reservaI: IReserva): Promise<void> {
        if (estado === EstadoReserva.cancelada) {
            //const reserva = await this.obtenerReserva(reservaI._id.toString());
            if (reservaI) {
                const usuario = await this.userService.obtenerUsuario(reservaI.id_usuario.toString());
                console.log("Usuario encontrado para notificación:", usuario);
                if (usuario && usuario.correo) {
                    const correoDestino = usuario.correo;
                    const nombre = usuario.nombre
                    await enviarCorreoCancelacion({ correoDestino, nombre, reservaId: reservaI._id.toString(), codigo_reserva: reservaI.codigo_reserva });
                }
            }
        }
        // Notificar a otros observadores registrados
        this.observadores.forEach(observador => observador.actualizar(estado, reservaI._id.toString()));
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

    async cancelarReservasPorVuelo(id_vuelo: string): Promise<number> {
        const resultado = await this.reservaRepository.cancelarReservasPorVuelo(id_vuelo);
        console.log(`Número de reservas canceladas para el vuelo ${id_vuelo}: ${resultado}`);
        
        if (resultado > 0) {
            const reservasCanceladas = await this.reservaRepository.obtenerReservasPorVuelo(id_vuelo)
                .then(reservas => reservas.filter(r => r.estado === EstadoReserva.cancelada));
            for (const reserva of reservasCanceladas) {
                console.log(`Notificando cancelación de reserva ${reserva._id}`);
                await this.notificarObservadores(EstadoReserva.cancelada, reserva);
            }
        }
        return resultado;
    }

}