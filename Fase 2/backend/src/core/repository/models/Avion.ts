import { Schema, model, Document } from 'mongoose';

export interface IAvion extends Document {
    modelo: string;
    capacidadMaxima: number;
    estado: string;
    numeroSerie: string;
}

const avionSchema = new Schema<IAvion>({
    modelo: { type: String, required: true },
    capacidadMaxima: { type: Number, required: true },
    estado: { type: String, required: true },
    numeroSerie: { type: String, required: true }
});

export const AvionModel = model<IAvion>('Avion', avionSchema);