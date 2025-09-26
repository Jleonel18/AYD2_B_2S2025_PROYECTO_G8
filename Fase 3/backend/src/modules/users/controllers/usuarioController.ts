import { Request, Response } from "express"
import {UserService} from "../../../core/repository/services/UserService.js"
import { UsuarioType } from "../../../core/factory/usuario.js"
import { generarTokenVerificacion, generarUsuario } from "../../../utils/utils.js"
import { enviarCorreoRecuperacion, enviarCorreoVerificacion } from "../../../utils/send_email.js"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { hashPassword } from "../../../utils/passwords.js"
import { AuthRequest } from "../../../middleware/authMiddleware.js"
import { VueloService } from "../../../core/repository/services/VueloService.js"
import { AvionService } from "../../../core/repository/services/AvionService.js"

export class UsuarioController {
    constructor(private readonly usuarioService: UserService, private readonly vueloService: VueloService, private readonly avionesService: AvionService) {}


    crearUsuario = async (req: Request, res: Response) => {
        try {
            const { tipo, datos } = req.body

            // Validaciones
            if(datos.edad < 18) {
                return res.status(400).json({ error: "La edad debe ser menor o igual a 18 años" })
            }

            if(datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
                return res.status(400).json({ error: "Correo inválido" })
            }

            if(datos.telefono.length < 8) {
                return res.status(400).json({ error: "El teléfono debe tener al menos 8 caracteres" })
            }

            const fechaNacimiento = new Date(datos.fecha_nacimiento);

            if(fechaNacimiento >= new Date()) {
                return res.status(400).json({ error: "La fecha de nacimiento no puede ser en el futuro" })
            }

            if(datos.dpi && datos.dpi.length < 13) {
                return res.status(400).json({ error: "El DPI debe tener al menos 13 caracteres" })
            }
            
            if(tipo === "pasajero" && new Date(datos.pasaporte.fecha_vencimiento) < new Date()) {
                return res.status(400).json({ error: "El pasaporte no debe estar vencido" })
            }

            // Validar que el correo no esté en uso
            const correoExistente = await this.usuarioService.obtenerUsuarioPorCorreo(datos.correo)
            if(correoExistente) {
                return res.status(400).json({ error: "El correo ya está en uso" })
            }

            const usuario_unico = generarUsuario(datos.nombre)
            datos.usuario = usuario_unico

            if(tipo === "pasajero") {
                datos.token = {}
                datos.token.token = generarTokenVerificacion()
                datos.token.expiracion = new Date(Date.now() + 120 * 60 * 60 * 1000) // 120 horas
            }else {
                if(datos.contrasena.length < 8 || !/[A-Z]/.test(datos.contrasena) || !/[a-z]/.test(datos.contrasena) || !/[0-9]/.test(datos.contrasena)) {
                    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número" })
                }
                datos.contrasena = await hashPassword(datos.contrasena)
            }
            
            const nuevoUsuario = await this.usuarioService.crearUsuario(tipo as UsuarioType, datos)

            if(tipo === "pasajero") {
                await enviarCorreoVerificacion({correoDestino: nuevoUsuario.correo, nombre: nuevoUsuario.nombre, token: datos.token.token, usuario: usuario_unico})
            }

            res.status(201).json(nuevoUsuario)
        } catch (error) {
            res.status(400).json({ error: (error as Error).message })
        }
    }

    obtenerUsuario = async (req: AuthRequest, res: Response) => {
        try {
            const usuario = await this.usuarioService.obtenerUsuario(req.user.id)
            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" })
            //console.log(usuario)
            res.json(usuario)
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    obtenerTrabajadores = async (req: Request, res: Response) => {
        try {
            const usuarios = await this.usuarioService.listarTrabajadores()
            res.json({ trabajadores: usuarios })
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    verificarCorreoGuardarPass = async (req: Request, res: Response) => {
        try {
            const { token, nueva_contrasena } = req.body
            if(!token || !nueva_contrasena) {
                return res.status(400).json({ error: "Faltan datos requeridos" })
            }

            //validar contrasena
            if(nueva_contrasena.length < 8 || !/[A-Z]/.test(nueva_contrasena) || !/[a-z]/.test(nueva_contrasena) || !/[0-9]/.test(nueva_contrasena)) {
                return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número" })
            }

            const usuario = await this.usuarioService.obtenerUsuarioPorToken(token, "verificacion")
            if (!usuario) {
                return res.status(400).json({ error: "Token inválido o expirado" })
            }

            const userUpdated = await this.usuarioService.agregarPass(usuario._id, { contrasena: nueva_contrasena })

            res.json({ message: "Correo verificado y contraseña actualizada", usuario: userUpdated })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    login = async (req: Request, res: Response) => {
        try {
            const { usuario, contrasena } = req.body
            if(!usuario || !contrasena) {
                return res.status(400).json({ message: "Faltan datos requeridos" })
            }
            const usuarioEncontrado = await this.usuarioService.login(usuario, contrasena)
            if (!usuarioEncontrado) {
                return res.status(400).json({ message: "Usuario o contraseña incorrectos" })
            }

            if(!usuarioEncontrado.activo) {
                return res.status(403).json({ message: "Hay un problema con tu cuenta, por favor contacta al soporte" })
            }

            const data = {
                id: usuarioEncontrado._id,
                usuario: usuarioEncontrado.usuario,
                tipo: usuarioEncontrado.tipo,
                nombre: usuarioEncontrado.nombre,
                correo: usuarioEncontrado.correo
            }

            const token = jwt.sign(
                data,
                process.env.JWT_SECRET || 'secreto',
                { expiresIn: '1h' }
            )

            res.json({ usuario: data, token })
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    editarPerfil = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.user
            const datos = req.body
            const usuarioActual = await this.usuarioService.obtenerUsuario(id)
            if (!usuarioActual) {
                return res.status(404).json({ error: "Usuario no encontrado" })
            }

            //Validar correo
            if(datos.correo && datos.correo !== usuarioActual.correo) {
                const correoExistente = await this.usuarioService.obtenerUsuarioPorCorreo(datos.correo)
                if(correoExistente) {
                    return res.status(400).json({ error: "El correo ya está en uso" })
                }
            }

            // Validaciones
            if(datos.edad && datos.edad < 18) {
                return res.status(400).json({ error: "La edad debe ser menor o igual a 18 años" })
            }

            if(datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
                return res.status(400).json({ error: "Correo inválido" })
            }

            if(datos.telefono && datos.telefono.length < 8) {
                return res.status(400).json({ error: "El teléfono debe tener al menos 8 caracteres" })
            }

            if(datos.fecha_nacimiento) {
                const fechaNacimiento = new Date(datos.fecha_nacimiento);
                if(fechaNacimiento >= new Date()) {
                    return res.status(400).json({ error: "La fecha de nacimiento no puede ser en el futuro" })
                }
            }

            if(datos.dpi && datos.dpi.length < 13) {
                return res.status(400).json({ error: "El DPI debe tener al menos 13 caracteres" })
            }

            if(usuarioActual.tipo === "pasajero" && datos.pasaporte && new Date(datos.pasaporte.fecha_vencimiento) < new Date()) {
                return res.status(400).json({ error: "El pasaporte no debe estar vencido" })
            }

            const usuarioEditado = await this.usuarioService.editarPerfil(id, datos)
            res.json(usuarioEditado)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    obtenerTrabajadorPorId = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const usuario = await this.usuarioService.obtenerUsuario(id)
            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" })
            res.json(usuario)
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    actualizarTrabajador = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const datos = req.body
            const usuarioActual = await this.usuarioService.obtenerUsuario(id)
            if (!usuarioActual) {
                return res.status(404).json({ error: "Usuario no encontrado" })
            }

            //Validar correo
            if(datos.correo && datos.correo !== usuarioActual.correo) {
                const correoExistente = await this.usuarioService.obtenerUsuarioPorCorreo(datos.correo)
                if(correoExistente) {
                    return res.status(400).json({ error: "El correo ya está en uso" })
                }

            }

            // Validaciones
            if(datos.edad && datos.edad < 18) {
                return res.status(400).json({ error: "La edad debe ser menor o igual a 18 años" })
            }

            if(datos.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)) {
                return res.status(400).json({ error: "Correo inválido" })
            }

            if(datos.telefono && datos.telefono.length < 8) {
                return res.status(400).json({ error: "El teléfono debe tener al menos 8 caracteres" })
            }

            if(datos.fecha_nacimiento) {
                const fechaNacimiento = new Date(datos.fecha_nacimiento);
                if(fechaNacimiento >= new Date()) {
                    return res.status(400).json({ error: "La fecha de nacimiento no puede ser en el futuro" })
                }
            }
            if(datos.dpi && datos.dpi.length < 13) {
                return res.status(400).json({ error: "El DPI debe tener al menos 13 caracteres" })
            }

            if(datos.contrasena) {
                if(datos.contrasena.length < 8 || !/[A-Z]/.test(datos.contrasena) || !/[a-z]/.test(datos.contrasena) || !/[0-9]/.test(datos.contrasena)) {
                    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número" })
                }
                datos.contrasena = await hashPassword(datos.contrasena)
            }

            const usuarioEditado = await this.usuarioService.actualizarTrabajador(id, datos)
            res.json(usuarioEditado)
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    eliminarTrabajador = async (req: Request, res: Response) => {
        try {
            const { id } = req.params
            const usuarioActual = await this.usuarioService.obtenerUsuario(id)
            if (!usuarioActual) {
                return res.status(404).json({ error: "Usuario no encontrado" })
            }

            await this.usuarioService.eliminarTrabajador(id)
            res.json({ message: "Usuario eliminado" })
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    solicitarTokenRecuperacion = async (req: Request, res: Response) => {
        try {
            
            const { correo } = req.body

            if(!correo) {
                return res.status(400).json({ error: "Faltan datos requeridos" })
            }

            const usuario = await this.usuarioService.obtenerUsuarioPorCorreo(correo)
            if (!usuario) {
                return res.status(400).json({ error: "Correo no registrado" })
            }

            if(usuario.tipo !== "pasajero") {
                return res.status(400).json({ error: "No tienes permisos para reestablecer tu contraseña. Habla con el administrador" })
            }

            const token = generarTokenVerificacion()
            const expiration = new Date(Date.now() + 1 * 60 * 60 * 1000) // 1 hora
            const userUpdated = await this.usuarioService.guardarTokenRecuperacion(usuario._id, token, expiration)
            if(!userUpdated) {
                return res.status(500).json({ error: "Error al guardar token" })
            }

            await enviarCorreoRecuperacion({correoDestino: usuario.correo, nombre: usuario.nombre, token})

            res.json({ message: "Se ha enviado un correo con las instrucciones para recuperar la contraseña", userUpdated })

        } catch (error) {
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    verificarYRestablecerContrasena = async (req: Request, res: Response) => {
        try {
            const { token, nueva_contrasena } = req.body
            if(!token || !nueva_contrasena) {
                return res.status(400).json({ error: "Faltan datos requeridos" })
            }

            //validar contrasena
            if(nueva_contrasena.length < 8 || !/[A-Z]/.test(nueva_contrasena) || !/[a-z]/.test(nueva_contrasena) || !/[0-9]/.test(nueva_contrasena)) {
                return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número" })
            }

            const usuario = await this.usuarioService.obtenerUsuarioPorToken(token, "reset")
            if (!usuario) {
                return res.status(400).json({ error: "Token inválido o expirado" })
            }
            const userUpdated = await this.usuarioService.verificarYRestablecerContraseña(usuario._id, nueva_contrasena)
            res.json({ message: "Contraseña actualizada", usuario: userUpdated })
        } catch (error) {
            console.log(error)
            res.status(500).json({ error: "Error en servidor" })
        }
    }

    sumarHorasVueloPiloto = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { horas } = req.body;
            
            if (!horas || typeof horas !== 'number') {
                return res.status(400).json({ 
                    error: "Debe proporcionar un número válido de horas" 
                });
            }
            
            const pilotoActualizado = await this.usuarioService.sumarHorasVueloPiloto(id, horas);
            
            if (!pilotoActualizado) {
                return res.status(404).json({ error: "Piloto no encontrado" });
            }
            
            res.json({
                message: `Se agregaron ${horas} horas de vuelo al piloto ${pilotoActualizado.nombre}`,
                piloto: {
                    id: pilotoActualizado._id,
                    nombre: pilotoActualizado.nombre,
                    usuario: pilotoActualizado.usuario,
                    horasVuelo: pilotoActualizado.horasVuelo,
                    tipo: pilotoActualizado.tipo
                }
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    sumarPuntosPorHorasVuelo = async (req: Request, res: Response) => {
        try {
            const { ids, horas } = req.body; // Esperamos una lista de IDs y las horas en el body
            const horasTruncadas = Math.floor(horas); // Truncar las horas a la parte entera
            const puntos = horasTruncadas * 100; // Ejemplo: 100 puntos por hora de vuelo

            // Validar que horas sea un número válido
            if (!horas || typeof horas !== 'number' || horasTruncadas <= 0) {
                return res.status(400).json({
                    error: "Debe proporcionar un número válido de horas mayor que 0"
                });
            }

            // Validar que ids sea un arreglo y no esté vacío
            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    error: "Debe proporcionar una lista válida de IDs"
                });
            }

            // Procesar cada ID en la lista
            const resultados = [];
            for (const id of ids) {
                const tripulacionActualizada = await this.usuarioService.puntosPorHorasDeVuelo(id, puntos);
                if (!tripulacionActualizada) {
                    resultados.push({ id, error: "Miembro de tripulación no encontrado" });
                } else {
                    resultados.push({
                        id: tripulacionActualizada._id,
                        message: `Se agregaron ${horasTruncadas} horas de vuelo al miembro de tripulación ${tripulacionActualizada.nombre}`,
                        tripulacion: {
                            id: tripulacionActualizada._id,
                            nombre: tripulacionActualizada.nombre,
                            usuario: tripulacionActualizada.usuario,
                            puntos: tripulacionActualizada.puntos,
                            tipo: tripulacionActualizada.tipo
                        }
                    });
                }
            }

            // Responder con los resultados de todos los IDs procesados
            res.json({
                message: "Procesamiento de horas de vuelo completado",
                resultados
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message + " - Asegúrese de enviar una lista de IDs y un número de horas válido" });
        }
    };

    obtenerHistorialVuelos = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.user;
            const usuario = await this.usuarioService.obtenerUsuario(id);
            if (!usuario) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const historial = await this.usuarioService.obtenerHistorialDeVuelos(id);
            if (!historial) {
                return res.status(404).json({ error: "No se encontró historial de vuelos para este usuario" });
            }

            // Retornar toda la información de los vuelos en el historial
            const vuelosInfo = await Promise.all(historial.map(vueloId => this.vueloService.obtenerVuelo(vueloId.toString())));

            res.json({ vuelos: vuelosInfo });
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    }

    obtenerEstadisticasAdmin = async (req: AuthRequest, res: Response) => {
        try {
            const estadisticasUsuarios = await this.usuarioService.getStatisticsUsers();
            const estadisticasAviones = await this.avionesService.getStatisticsAviones();
            const estadisticasVuelos = await this.vueloService.getStatisticsVuelos();
            res.json({
                usuarios: estadisticasUsuarios,
                aviones: estadisticasAviones,
                vuelos: estadisticasVuelos
            });
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    }

    obtenerPasajeros = async (req: AuthRequest, res: Response) => {
        try {
            const pasajeros = await this.usuarioService.listarPasajeros();
            res.json(pasajeros);
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    }

    editarEstadoUsuario = async (req: AuthRequest, res: Response) => {
        try {
            const { id } = req.params;

            if(id !== req.user.id && req.user.tipo !== 'operaciones') {
                return res.status(403).json({ error: "No tienes permisos para cambiar el estado de este usuario" });
            }
            
            const usuarioActual = await this.usuarioService.obtenerUsuario(id);
            if (!usuarioActual) {
                return res.status(404).json({ error: "Usuario no encontrado" });
            }

            const nuevoEstado = !usuarioActual.activo; // Alternar el estado actual
            const usuarioActualizado = await this.usuarioService.actualizarEstado(id, nuevoEstado);
            res.json({
                message: `El estado del usuario ha sido actualizado a ${nuevoEstado ? 'activo' : 'inactivo'}.`,
                usuario: usuarioActualizado
            });
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    }
}
