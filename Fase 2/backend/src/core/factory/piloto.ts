import Usuario from "./usuario.js";
import { UsuarioType } from "./usuario.js";

class Piloto extends Usuario {
    public readonly numero_licencia: string;
    public readonly horasVuelo: number;

    constructor(nombre: string, edad: number, correo: string, telefono: string, direccion: string, 
        genero: string, fecha_nacimiento: Date, dpi: string, usuario: string, contrasena: string, vuelos: string[],
        numero_licencia: string, horasVuelo: number
    ) {
        super(nombre, edad, correo, telefono, direccion, genero, fecha_nacimiento, dpi, usuario, UsuarioType.PILOTO, vuelos, contrasena);
        this.numero_licencia = numero_licencia;
        this.horasVuelo = horasVuelo;
    }
    toJSON() { return {
        tipo: "piloto",
        nombre: this.nombre,
        correo: this.correo,
        edad: this.edad,
        telefono: this.telefono,
        direccion: this.direccion,
        genero: this.genero,
        fecha_nacimiento: this.fecha_nacimiento,
        dpi: this.dpi,
        usuario: this.usuario,
        contrasena: this.contrasena,
        vuelos: this.vuelos,
        numero_licencia: this.numero_licencia,
        horasVuelo: this.horasVuelo
    }}
}

export default Piloto;