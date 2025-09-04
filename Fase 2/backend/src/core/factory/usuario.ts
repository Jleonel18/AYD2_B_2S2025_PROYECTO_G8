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
        public readonly correo: string,
        public readonly telefono: string,
        public readonly direccion: string,
        public readonly genero: string,
        public readonly fecha_nacimiento: Date,
        public readonly dpi: string,
        public readonly usuario: string,
        public readonly contrasena: string,
        public readonly tipo: UsuarioType,
        public readonly vuelos: string[] = []
    ) {}
    abstract toJSON(): Record<string, unknown>
}

export default Usuario;