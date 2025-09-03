import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
    nombre: string;
    correo: string;
    edad: number;
    tipo: string;
    horasVuelo?: number;
    vuelos?: number;
    numeroPasaporte?: string;
}

const userSchema = new Schema<IUser>({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    edad: { type: Number, required: true },
    tipo: { type: String, required: true },
    horasVuelo: { type: Number, required: false },
    vuelos: { type: Number, required: false },
    numeroPasaporte: { type: String, required: false }
});

export const UserModel = model<IUser>('User', userSchema);