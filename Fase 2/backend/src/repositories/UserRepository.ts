import { IUserRepository } from './IUserRepository';
import { UserModel, IUser } from '../models/User';

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

    async update(id: string, user: Partial<IUser>): Promise<IUser | null> {
        return await UserModel.findByIdAndUpdate(id, user, { new: true });
    }

    async delete(id: string): Promise<void> {
        await UserModel.findByIdAndDelete(id);
    }
}