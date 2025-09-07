import { Request, Response } from "express"
import {UserService} from "../../../core/repository/services/UserService"
import { UsuarioType } from "../../../core/factory/usuario"
import { generarTokenVerificacion, generarUsuario } from "../../../utils/utils"
import { enviarCorreoVerificacion } from "../../../utils/send_email"
import jwt, { JwtPayload } from 'jsonwebtoken';
import { hashPassword } from "../../../utils/passwords"
import { AuthRequest } from "../../../middleware/authMiddleware"

export class UsuarioController {
    constructor(private readonly usuarioService: UserService) {}


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

            const usuario_unico = generarUsuario(datos.nombre)
            datos.usuario = usuario_unico

            if(tipo === "pasajero") {
                datos.token = {}
                datos.token.token = generarTokenVerificacion()
                datos.token.expiracion = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 horas
            }else {
                if(datos.contrasena.length < 8 || !/[A-Z]/.test(datos.contrasena) || !/[a-z]/.test(datos.contrasena) || !/[0-9]/.test(datos.contrasena)) {
                    return res.status(400).json({ error: "La contraseña debe tener al menos 8 caracteres, una letra mayúscula, una letra minúscula y un número" })
                }
                datos.contrasena = await hashPassword(datos.contrasena)
            }
            
            const nuevoUsuario = await this.usuarioService.crearUsuario(tipo as UsuarioType, datos)

            if(tipo === "pasajero") {
                enviarCorreoVerificacion({correoDestino: nuevoUsuario.correo, nombre: nuevoUsuario.nombre, token: datos.token.token, usuario: usuario_unico})
            }

            res.status(201).json(nuevoUsuario)
        } catch (error) {
            res.status(400).json({ error: (error as Error).message })
        }
    }

    obtenerUsuario = async (req: Request, res: Response) => {
        try {
            const usuario = await this.usuarioService.obtenerUsuario(req.params.id)
            if (!usuario) return res.status(404).json({ error: "Usuario no encontrado" })
            res.json(usuario)
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

            const usuario = await this.usuarioService.obtenerUsuarioPorToken(token)
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
                return res.status(400).json({ error: "Faltan datos requeridos" })
            }
            const usuarioEncontrado = await this.usuarioService.login(usuario, contrasena)
            if (!usuarioEncontrado) {
                return res.status(400).json({ error: "Usuario o contraseña incorrectos" })
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

}
