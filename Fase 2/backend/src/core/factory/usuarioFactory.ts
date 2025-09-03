import { UsuarioType } from "./usuario"
import Usuario from "./usuario"
import Piloto from "./piloto"
import Sobrecargo from "./sobrecargo"
import Pasajero from "./pasajero"

class UsuarioFactory {
    static crearUsuario(tipo: UsuarioType, datos: any): Usuario {
        switch (tipo) {
            case UsuarioType.PILOTO:
                return new Piloto(datos.nombre, datos.edad, datos.correo, datos.horasVuelo)
            case UsuarioType.SOBRECARGO:
                return new Sobrecargo(datos.nombre, datos.edad, datos.correo, datos.vuelos)
            case UsuarioType.PASAJERO:
                return new Pasajero(datos.nombre, datos.edad, datos.correo, datos.numeroPasaporte)
            default:
                throw new Error("Tipo de usuario no válido")
        }
    }
}

export default UsuarioFactory;