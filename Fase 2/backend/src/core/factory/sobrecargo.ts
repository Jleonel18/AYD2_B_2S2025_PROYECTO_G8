import Usuario from "./usuario";
import { UsuarioType } from "./usuario";

class Sobrecargo extends Usuario {
    constructor(nombre: string, edad: number, correo: string, public readonly vuelos: number) {
        super(nombre, edad, correo, UsuarioType.SOBRECARGO)
    }
    toJSON() { return { tipo: "sobrecargo", nombre: this.nombre, correo: this.correo, edad: this.edad, vuelos: this.vuelos } }
}

export default Sobrecargo;
