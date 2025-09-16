import { EstadoReserva } from "../../types/reservas";
export enum EstadoVuelo {
    PLANIFICADO = "Planificado",
    INICIADO = "Iniciado",
    CANCELADO = "Cancelado",
    RETRASADO = "Retrasado",
    ATERRIZADO = "Aterrizado"
}

export interface Observador {
    actualizar(estado: EstadoReserva, reservaId: string): void;
}