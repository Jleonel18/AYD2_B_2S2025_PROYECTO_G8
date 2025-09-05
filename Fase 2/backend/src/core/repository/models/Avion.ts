import { Schema, model, Document } from 'mongoose';

export interface IAvion extends Document {
    _id: string;
    modelo: string;
    capacidadMaxima: number;
    estado: string;
    numeroSerie: string;
    horas_Vuelo: number;
    limite_horas: number;
    id_aeropuerto_actual?: string;
}

const avionSchema = new Schema<IAvion>({
    modelo: { type: String, required: true },
    capacidadMaxima: { type: Number, required: true },
    horas_Vuelo: { type: Number, default: 0 },
    estado: { type: String, required: true },
    limite_horas: { type: Number, required: true },
    numeroSerie: { type: String, required: true },
    id_aeropuerto_actual: { type: Schema.Types.ObjectId, ref: 'Aeropuerto', required: false }
});

export const AvionModel = model<IAvion>('Avion', avionSchema);