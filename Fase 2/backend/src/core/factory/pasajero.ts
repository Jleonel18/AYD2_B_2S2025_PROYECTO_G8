import Usuario, { UsuarioType } from "./usuario";

class Pasajero extends Usuario {

    public readonly pasaporte: { numero: string; fecha_vencimiento: Date; pais_emision: string };
    public readonly verificacion_email: boolean;
    public readonly puntos: number;

    constructor(nombre: string, edad: number, correo: string, telefono: string, direccion: string, 
        genero: string, fecha_nacimiento: Date, dpi: string, usuario: string, contrasena: string, vuelos: string[],
        pasaporte: { numero: string; fecha_vencimiento: Date; pais_emision: string }, verificacion_email: boolean, puntos: number
    ) {
        super(nombre, edad, correo, telefono, direccion, genero, fecha_nacimiento, dpi, usuario, contrasena, UsuarioType.PASAJERO, vuelos);
        this.pasaporte = pasaporte;
        this.verificacion_email = verificacion_email;
        this.puntos = puntos;
    }
    toJSON() { return { 
        tipo: 'pasajero',
        nombre: this.nombre,
        edad: this.edad,
        correo: this.correo,
        telefono: this.telefono,
        direccion: this.direccion,
        genero: this.genero,
        fecha_nacimiento: this.fecha_nacimiento,
        dpi: this.dpi,
        usuario: this.usuario,
        contrasena: this.contrasena,
        vuelos: this.vuelos,
        pasaporte: this.pasaporte,
        verificacion_email: this.verificacion_email,
        puntos: this.puntos
    }}
}

export default Pasajero;