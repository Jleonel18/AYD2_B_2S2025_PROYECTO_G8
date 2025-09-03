import Usuario from "./usuario";

class Pasajero extends Usuario {
    constructor(nombre: string, edad: number, correo: string, public readonly numeroPasaporte: string) {
        super(nombre, edad, correo)
    }
    toJSON() { return { tipo: "pasajero", nombre: this.nombre, pasaporte: this.numeroPasaporte } }
}

export default Pasajero;