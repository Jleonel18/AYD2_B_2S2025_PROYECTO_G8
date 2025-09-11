import { IUserRepository } from '../repositories/IUserRepository';
import { IUser } from '../models/User';
import { UsuarioType } from '../../factory/usuario';
import UsuarioFactory from '../../factory/usuarioFactory';

export class UserService {
    constructor(private userRepository: IUserRepository) {}

    async crearUsuario(tipo: UsuarioType, datos: any): Promise<IUser> {

        // Validar correo unico
        const existingUser = await this.userRepository.findByEmail(datos.correo);
        if (existingUser) {
            throw new Error("El correo ya está en uso");
        }

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

    async listarTrabajadores(): Promise<IUser[]> {
        return await this.userRepository.findWorkers()
    }

    async agregarPass(id: string, datos: Partial<IUser>): Promise<IUser | null> {
        if (!datos.contrasena) {
            throw new Error("La contraseña es requerida para actualizar");
        }
        return await this.userRepository.verifyAndSetPassword(id, datos.contrasena)
    }

    async obtenerUsuarioPorToken(token: string): Promise<IUser | null> {
        return await this.userRepository.findByToken(token)
    }

    async login(usuario: string, contrasena: string): Promise<IUser | null> {
        return await this.userRepository.login(usuario, contrasena)
    }

    async obtenerUsuarioPorCorreo(correo: string): Promise<IUser | null> {
        return await this.userRepository.findByEmail(correo)
    }

    async editarPerfil(id: string, datos: Partial<IUser>): Promise<IUser | null> {
        return await this.userRepository.editProfile(id, datos)
    }

    async actualizarTrabajador(id: string, datos: Partial<IUser>): Promise<IUser | null> {
        return await this.userRepository.updateWorker(id, datos)
    }

    async eliminarTrabajador(id: string): Promise<void> {
        return await this.userRepository.deleteWorker(id)
    }
}