import Usuario from "./usuario";

class Sobrecargo extends Usuario {
    constructor(nombre: string, edad: number, correo: string, public readonly vuelos: number) {
        super(nombre, edad, correo)
    }
    toJSON() { return { tipo: "sobrecargo", nombre: this.nombre, vuelos: this.vuelos } }
}

export default Sobrecargo;
