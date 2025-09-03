import { IUserRepository } from '../repositories/IUserRepository';
import { IUser } from '../models/User';
import { UsuarioType } from '../../factory/usuario';
import UsuarioFactory from '../../factory/usuarioFactory';

export class UserService {
    constructor(private userRepository: IUserRepository) {}

    async crearUsuario(tipo: UsuarioType, datos: any): Promise<IUser> {
        // 1. Crear con factory (dominio)
        const usuario = UsuarioFactory.crearUsuario(tipo, datos)

        // 2. Persistir en Mongo (infraestructura)
        console.log("Usuario a guardar:", usuario.toJSON());
        return await this.userRepository.create({ 
            ...usuario.toJSON()
        })
    }

    async obtenerUsuario(id: string): Promise<IUser | null> {
        return await this.userRepository.findById(id)
    }

    async listarUsuarios(): Promise<IUser[]> {
        return await this.userRepository.findAll()
    }
}