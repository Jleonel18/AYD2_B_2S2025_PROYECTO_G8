import { EstadoReserva } from "../../types/reservas";
export enum EstadoVuelo {
    PLANIFICADO = "Planificado",
    INICIADO = "Iniciado",
    CANCELADO = "Cancelado"
}

export interface Observador {
    actualizar(estado: EstadoReserva, reservaId: string): void;
}