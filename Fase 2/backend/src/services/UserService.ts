import { IUserRepository } from '../repositories/IUserRepository';
import { IUser } from '../models/User';

export class UserService {
    constructor(private userRepository: IUserRepository) {}

    async createUser(user: Partial<IUser>): Promise<IUser> {
        if (!user.email) throw new Error('Email requerido');
        return await this.userRepository.create(user);
    }

    async getUserById(id: string): Promise<IUser | null> {
        return await this.userRepository.findById(id);
    }
}