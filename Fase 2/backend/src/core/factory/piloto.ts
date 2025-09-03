import Usuario from "./usuario";

class Piloto extends Usuario {
    constructor(nombre: string, edad: number, correo: string, public readonly horasVuelo: number) {
        super(nombre, edad, correo)
    }
    toJSON() { return { tipo: "piloto", nombre: this.nombre, horasVuelo: this.horasVuelo } }
}

export default Piloto;