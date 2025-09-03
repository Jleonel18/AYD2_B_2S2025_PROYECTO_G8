import Usuario, { UsuarioType } from "./usuario";

class Pasajero extends Usuario {
    constructor(nombre: string, edad: number, correo: string, public readonly numeroPasaporte: string) {
        super(nombre, edad, correo, UsuarioType.PASAJERO)
    }
    toJSON() { return { tipo: "pasajero", nombre: this.nombre, pasaporte: this.numeroPasaporte } }
}

export default Pasajero;