import { IUserRepository } from './IUserRepository';
import { UserModel, IUser } from '../models/User';
import { comparePassword, hashPassword } from '../../../utils/passwords';
import { flattenObject } from '../../../utils/utils';

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
    
    async findByToken(token: string): Promise<IUser | null> {
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
}