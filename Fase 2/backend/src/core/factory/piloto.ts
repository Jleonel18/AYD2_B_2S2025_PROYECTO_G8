import Usuario from "./usuario";
import { UsuarioType } from "./usuario";

class Piloto extends Usuario {
    constructor(nombre: string, edad: number, correo: string, public readonly horasVuelo: number) {
        super(nombre, edad, correo, UsuarioType.PILOTO)
    }
    toJSON() { return { tipo: "piloto", nombre: this.nombre, correo: this.correo, edad: this.edad, horasVuelo: this.horasVuelo } }
}

export default Piloto;