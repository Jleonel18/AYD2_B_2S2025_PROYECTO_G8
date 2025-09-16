import { IUserRepository } from '../repositories/IUserRepository';
import { IUser } from '../models/User';
import { UsuarioType } from '../../factory/usuario';
import UsuarioFactory from '../../factory/usuarioFactory';
import { ObjectId } from 'mongodb';

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

    async obtenerUsuarioPorToken(token: string, tipo: string): Promise<IUser | null> {
        return await this.userRepository.findByToken(token, tipo)
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

    async guardarTokenRecuperacion(userId: string, token: string, expiration: Date): Promise<IUser | null> {
        return await this.userRepository.saveTokenForgotPassword(userId, token, expiration)
    }

    async verificarYRestablecerContraseña(userId: string, plainPassword: string): Promise<IUser | null> {
        return await this.userRepository.verifyAndResetPassword(userId, plainPassword)
    }

    async sumarHorasVueloPiloto(pilotId: string, hours: number): Promise<IUser | null> {
        if (hours <= 0) {
            throw new Error("Las horas de vuelo deben ser un número positivo");
        }
        
        return await this.userRepository.addFlightHoursToPilot(pilotId, hours);
    }

    async puntosPorHorasDeVuelo(pasajero: string, puntos: number): Promise<IUser | null> {
        if (puntos === undefined) {
            throw new Error("Debe proporcionar puntos para actualizar");
        }
        return await this.userRepository.updatePoints(pasajero, puntos);
    }

    async agregarVueloAlHistorial(usuarioID: string, vueloId: string): Promise<IUser | null> {
        return await this.userRepository.addFlightToHistory(usuarioID, vueloId);
    }

    async agregarPuntosYVueloAlHistorial(usuarioID: string, vueloId: string, puntos: number): Promise<IUser | null> {
        if (puntos === undefined) {
            throw new Error("Debe proporcionar puntos para actualizar");
        }
        return await this.userRepository.addPointsAndFlightToHistory(usuarioID, vueloId, puntos);
    }

    async obtenerHistorialDeVuelos(usuarioID: string): Promise<ObjectId[] | null> {
        return await this.userRepository.getFlightHistory(usuarioID);
    }
}