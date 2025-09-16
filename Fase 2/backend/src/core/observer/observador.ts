import { EstadoReserva } from "../../types/reservas.js";
export enum EstadoVuelo {
    PLANIFICADO = "Planificado",
    INICIADO = "Iniciado",
    CANCELADO = "Cancelado",
    RETRASADO = "Retrasado",
    ATERRIZADO = "Aterrizado",
    EN_TIEMPO = "En tiempo"
}

export interface Observador {
    actualizar(estado: EstadoReserva, reservaId: string): void;
}