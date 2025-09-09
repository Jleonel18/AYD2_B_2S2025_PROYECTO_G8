import { UsuarioType } from "./usuario"
import Usuario from "./usuario"
import Piloto from "./piloto"
import Sobrecargo from "./sobrecargo"
import Pasajero from "./pasajero"
import Operaciones from "./operaciones"

class UsuarioFactory {
    static crearUsuario(tipo: UsuarioType, datos: any): Usuario {

        if(!datos.nombre || !datos.edad || !datos.correo || !tipo) {
            throw new Error("Faltan datos requeridos")
        }
        switch (tipo) {
            case UsuarioType.PILOTO:
                //console.log("Datos del piloto:", datos);
                return new Piloto(
                    datos.nombre, datos.edad, datos.correo, datos.telefono, datos.direccion,
                    datos.genero, datos.fecha_nacimiento, datos.dpi, datos.usuario, datos.contrasena, [],
                    datos.numero_licencia, 0
                )
            case UsuarioType.SOBRECARGO:
                return new Sobrecargo(datos.nombre, datos.edad, datos.correo, datos.telefono, datos.direccion,
                    datos.genero, datos.fecha_nacimiento, datos.dpi, datos.usuario, datos.contrasena, []
                )
            case UsuarioType.PASAJERO:
                if(!datos.pasaporte) {
                    throw new Error("Es necesario un pasaporte")
                }
                return new Pasajero(datos.nombre, datos.edad, datos.correo, datos.telefono, datos.direccion, 
                    datos.genero, datos.fecha_nacimiento, datos.dpi, datos.usuario, datos.contrasena, [],
                    { numero: datos.pasaporte.numero, fecha_vencimiento: datos.pasaporte.fecha_vencimiento, pais_emision: datos.pasaporte.pais_emision },
                    false,
                    0,
                    { token: datos.token.token, expiracion: datos.token.expiracion }
                )
            case UsuarioType.OPERACIONES:
                return new Operaciones(datos.nombre, datos.edad, datos.correo, datos.telefono, datos.direccion,
                    datos.genero, datos.fecha_nacimiento, datos.dpi, datos.usuario, datos.contrasena, []
                )
            default:
                throw new Error("Tipo de usuario no válido")
        }
    }
}

export default UsuarioFactory;