import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    nombre: string;
    correo: string;
    edad: number;
}

const userSchema = new Schema<IUser>({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    edad: { type: Number, required: true },
});

export const UserModel = model<IUser>('User', userSchema);