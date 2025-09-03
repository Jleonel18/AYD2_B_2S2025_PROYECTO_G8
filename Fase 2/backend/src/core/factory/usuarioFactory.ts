import { UsuarioType } from "./usuario"
import Usuario from "./usuario"
import Piloto from "./piloto"
import Sobrecargo from "./sobrecargo"
import Pasajero from "./pasajero"

class UsuarioFactory {
    static crearUsuario(tipo: UsuarioType, datos: any): Usuario {

        if(!datos.nombre || !datos.edad || !datos.correo || !tipo) {
            throw new Error("Faltan datos requeridos")
        }
        switch (tipo) {
            case UsuarioType.PILOTO:
                //console.log("Datos del piloto:", datos);
                return new Piloto(datos.nombre, datos.edad, datos.correo, datos.horasVuelo)
            case UsuarioType.SOBRECARGO:
                return new Sobrecargo(datos.nombre, datos.edad, datos.correo, datos.vuelos)
            case UsuarioType.PASAJERO:
                if(!datos.numeroPasaporte) {
                    throw new Error("El número de pasaporte es requerido para el pasajero")
                }
                return new Pasajero(datos.nombre, datos.edad, datos.correo, datos.numeroPasaporte)
            default:
                throw new Error("Tipo de usuario no válido")
        }
    }
}

export default UsuarioFactory;