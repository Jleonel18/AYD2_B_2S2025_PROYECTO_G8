import { Request, Response } from "express"
import {UserService} from "../../../core/repository/services/UserService"
import { UsuarioType } from "../../../core/factory/usuario"

export class UsuarioController {
    constructor(private readonly usuarioService: UserService) {}

    crearUsuario = async (req: Request, res: Response) => {
        try {
            const { tipo, datos } = req.body
            const nuevoUsuario = await this.usuarioService.crearUsuario(tipo as UsuarioType, datos)
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
}
