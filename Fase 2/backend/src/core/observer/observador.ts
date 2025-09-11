export enum EstadoVuelo {
    PLANIFICADO = "Planificado",
    INICIADO = "Iniciado",
    CANCELADO = "Cancelado"
}

export interface Observador {
    actualizar(estado: EstadoVuelo, vueloId: string): void;
}