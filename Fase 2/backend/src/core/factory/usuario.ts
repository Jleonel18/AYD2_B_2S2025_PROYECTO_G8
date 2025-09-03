export enum UsuarioType {
    PILOTO = "piloto",
    COPILOTO = "copiloto",
    SOBRECARGO = "sobrecargo",
    PASAJERO = "pasajero"
}

abstract class Usuario {
    constructor(
        public readonly nombre: string,
        public readonly edad: number,
        public readonly correo: string
    ) {}
    abstract toJSON(): Record<string, unknown>
}

export default Usuario;