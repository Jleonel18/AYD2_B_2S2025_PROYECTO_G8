import Usuario from "./usuario";
import { UsuarioType } from "./usuario";

class Sobrecargo extends Usuario {
    constructor(nombre: string, edad: number, correo: string, telefono: string, direccion: string, 
        genero: string, fecha_nacimiento: Date, dpi: string, usuario: string, contrasena: string, vuelos: string[]
    ) {
        super(nombre, edad, correo, telefono, direccion, genero, fecha_nacimiento, dpi, usuario, contrasena, UsuarioType.SOBRECARGO, vuelos)
    }
    toJSON() { return { 
        tipo: "sobrecargo",
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

export default Sobrecargo;
