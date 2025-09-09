import { Schema , model, Document } from 'mongoose';

export interface IAeropuerto extends Document {
    _id: string;
    nombre: string;
    ciudad: string;
    pais: string;
    codigoIATA: string;
    codigoICAO: string;
}

const aeropuertoSchema = new Schema<IAeropuerto>({
    nombre: { type: String, required: true },
    ciudad: { type: String, required: true },
    pais: { type: String, required: true },
    codigoIATA: { type: String, required: true },
    codigoICAO: { type: String, required: true }
});

export const AeropuertoModel = model<IAeropuerto>('Aeropuerto', aeropuertoSchema);