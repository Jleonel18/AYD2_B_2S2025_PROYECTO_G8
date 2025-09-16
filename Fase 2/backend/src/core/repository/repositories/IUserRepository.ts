import { IUser } from '../models/User';

export interface IUserRepository {
    create(user: Partial<IUser>): Promise<IUser>;
    findById(id: string): Promise<IUser | null>;
    findAll(): Promise<IUser[]>;
    findWorkers(): Promise<IUser[]>;
    update(id: string, user: Partial<IUser>): Promise<IUser | null>;
    delete(id: string): Promise<void>;
    verifyAndSetPassword(userId: string, plainPassword: string): Promise<IUser | null>;
    findByEmail(email: string): Promise<IUser | null>;
    findByToken(token: string, tipo: string): Promise<IUser | null>;
    login(usuario: string, contrasena: string): Promise<IUser | null>;
    editProfile(id: string, datos: Partial<IUser>): Promise<IUser | null>;
    updateWorker(id: string, datos: Partial<IUser>): Promise<IUser | null>;
    deleteWorker(id: string): Promise<void>;
    saveTokenForgotPassword(userId: string, token: string, expiration: Date): Promise<IUser | null>;
    verifyAndResetPassword(userId: string, plainPassword: string): Promise<IUser | null>;
    addFlightHoursToPilot(pilotId: string, hours: number): Promise<IUser | null>;
    updatePoints(pasajero: string, puntos: number): Promise<IUser | null>;
}