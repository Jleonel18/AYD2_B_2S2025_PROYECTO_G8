import Usuario from "./usuario.js";
import { UsuarioType } from "./usuario.js";

class Operaciones extends Usuario {
    constructor(nombre: string, edad: number, correo: string, telefono: string, direccion: string, 
        genero: string, fecha_nacimiento: Date, dpi: string, usuario: string, contrasena: string, vuelos: string[]
    ) {
        super(nombre, edad, correo, telefono, direccion, genero, fecha_nacimiento, dpi, usuario, UsuarioType.OPERACIONES, vuelos, contrasena)
    }
    toJSON() { return { 
        tipo: "operaciones",
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
        vuelos: this.vuelos
    }}
}

export default Operaciones;
