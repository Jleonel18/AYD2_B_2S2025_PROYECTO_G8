import { IUserRepository } from './IUserRepository.js';
import { UserModel, IUser } from '../models/User.js';
import { comparePassword, hashPassword } from '../../../utils/passwords.js';
import { flattenObject } from '../../../utils/utils.js';
import { ObjectId } from 'mongodb';

export class UserRepository implements IUserRepository {
    async create(user: Partial<IUser>): Promise<IUser> {
        const newUser = new UserModel(user);
        return await newUser.save();
    }

    async findById(id: string): Promise<IUser | null> {
        return await UserModel.findById(id);
    }

    async findAll(): Promise<IUser[]> {
        return await UserModel.find();
    }

    async findPassengers(): Promise<IUser[]> {
        return await UserModel.find({ tipo: 'pasajero' });
    }

    async findWorkers(): Promise<IUser[]> {
        return await UserModel.find({ tipo: { $in: ['piloto', 'sobrecargo'] } });
    }

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<void> {
        await UserModel.findByIdAndDelete(id);
    }

    async verifyAndSetPassword(userId: string, plainPassword: string): Promise<IUser | null> {
        const hashed = await hashPassword(plainPassword);
        return await UserModel.findByIdAndUpdate(
            userId,
            {
                contrasena: hashed,
                verificacion_email: true,
                $unset: { token: "" }
            },
            { new: true }
        );
    }
    
    async findByToken(token: string, tipo:string): Promise<IUser | null> {
        if(tipo === "reset"){
            return await UserModel.findOne({ 'token_reset.token': token });
        }
        return await UserModel.findOne({ 'token.token': token });
    }

    async login(usuario: string, contrasena: string): Promise<IUser | null> {
        const user = await UserModel.findOne({ usuario: usuario });
        if (!user) return null;

        const isMatch = await comparePassword(contrasena, user.contrasena);
        if (!isMatch) return null;
        return user;
    }

    async findByEmail(correo: string): Promise<IUser | null> {
        return await UserModel.findOne({ correo: correo });
    }

    async editProfile(id: string, datos: Partial<IUser>): Promise<IUser | null> {
        const datos_flattened = flattenObject(datos);
        return await UserModel.findByIdAndUpdate(id, { $set: datos_flattened }, { new: true });
    }

    async updateStatus(id: string, activo: boolean): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, { activo: activo }, { new: true });
    }

    async updateWorker(id: string, datos: Partial<IUser>): Promise<IUser | null> {
        const datos_flattened = flattenObject(datos);
        return await UserModel.findByIdAndUpdate(id, { $set: datos_flattened }, { new: true });
    }

    async deleteWorker(id: string): Promise<void> {
        await UserModel.findByIdAndDelete(id);
    }

    async saveTokenForgotPassword(userId: string, token: string, expiration: Date): Promise<IUser | null> {
        
        return await UserModel.findByIdAndUpdate(
            userId,
            {
                $set: {
                    token_reset: {
                        token: token,
                        expiration: expiration
                    }
                }
            },
            { new: true }
        );
    }

    async verifyAndResetPassword(userId: string, plainPassword: string): Promise<IUser | null> {
        const hashed = await hashPassword(plainPassword);
        return await UserModel.findByIdAndUpdate(
            userId,
            {
                contrasena: hashed,
                $unset: { token_reset: "" }
            },
            { new: true }
        );
    }

    async addFlightHoursToPilot(pilotId: string, hours: number): Promise<IUser | null> {
        // Primero verificamos que el usuario sea un piloto
        const user = await UserModel.findById(pilotId);
        if (!user || user.tipo !== 'piloto') {
            throw new Error("El usuario no es un piloto o no existe");
        }
        
        // Incrementamos las horas de vuelo del piloto
        return await UserModel.findByIdAndUpdate(
            pilotId,
            { $inc: { horasVuelo: hours } },
            { new: true }
        );
    }

    async updatePoints(pasajero: string, puntos: number): Promise<IUser | null> {
        // Primero verificamos que el usuario sea un pasajero
        const user = await UserModel.findById(pasajero);
        if (!user || user.tipo !== 'pasajero') {
            throw new Error("El usuario no es un pasajero o no existe");
        }
        // Incrementamos los puntos del pasajero
        return await UserModel.findByIdAndUpdate(
            pasajero,
            { $inc: { puntos: puntos } },
            { new: true }
        );
    }

    async addFlightToHistory(usuarioID: string, vueloId: string): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            usuarioID,
            { $push: { vuelos: vueloId } },
            { new: true }
        );
    }

    async addPointsAndFlightToHistory(usuarioID: string, vueloId: string, puntos: number): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(
            usuarioID,
            { $push: { vuelos: vueloId }, $inc: { puntos: puntos } },
            { new: true }
        );
    }

    async getFlightHistory(usuarioID: string): Promise<ObjectId[] | null> {
        const user = await UserModel.findById(usuarioID).select('vuelos');
        return user ? user.vuelos : null;
    }

    async getStatisticsUsers(): Promise<{ totalUsers: number; totalPilots: number; totalFlightAttendants: number; }> {
        const totalUsers = await UserModel.countDocuments({tipo: 'pasajero' });
        const totalPilots = await UserModel.countDocuments({ tipo: 'piloto' });
        const totalFlightAttendants = await UserModel.countDocuments({ tipo: 'sobrecargo' });
        return { totalUsers, totalPilots, totalFlightAttendants };
    }
}