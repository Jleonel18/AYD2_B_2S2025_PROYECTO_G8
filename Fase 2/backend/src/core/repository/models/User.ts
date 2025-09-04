import { Schema, model, Document, Types } from 'mongoose';

export interface IPasaporte {
    numero: string;
    fecha_vencimiento: Date;
    pais_emision: string;
}

export interface IUser extends Document {
    nombre: string;
    correo: string;
    edad: number;
    telefono: string;
    direccion: string;
    genero: string;
    fecha_nacimiento: Date;
    dpi: string;
    usuario: string;
    contrasena: string;
    tipo: string;
    vuelos: Types.ObjectId[]; // Todos
    numero_licencia?: string; // Piloto
    horasVuelo?: number; // Piloto
    pasaporte?: IPasaporte; // Pasajero
    verificacion_email?: boolean; // Pasajero
    puntos?: number; // Pasajero
}

const userSchema = new Schema<IUser>({
    nombre: { type: String, required: true },
    correo: { type: String, required: true },
    edad: { type: Number, required: true },
    telefono: { type: String, required: true },
    direccion: { type: String, required: true },
    genero: { type: String, required: true },
    fecha_nacimiento: { type: Date, required: true },
    dpi: { type: String, required: true },
    usuario: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    verificacion_email: { type: Boolean, required: false },
    puntos: { type: Number, required: false },
    tipo: { type: String, required: true },
    horasVuelo: { type: Number, required: false },
    vuelos: { type: [Types.ObjectId], required: false, default: [] },
    pasaporte: { 
        numero: { type: String, required: false },
        fecha_vencimiento: { type: Date, required: false },
        pais_emision: { type: String, required: false }
    },
    numero_licencia: { type: String, required: false }
});

export const UserModel = model<IUser>('User', userSchema);