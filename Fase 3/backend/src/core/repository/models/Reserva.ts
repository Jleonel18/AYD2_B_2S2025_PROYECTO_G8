import { Schema, model, Document, Types } from 'mongoose';

export interface IReserva extends Document {
    _id: Types.ObjectId;
    id_usuario: Types.ObjectId;
    id_vuelo: Types.ObjectId;
    asientos_reservados: number;
    asientos: number[];
    fecha_reserva: Date;
    estado: string;
    codigo_reserva: string;
    fecha_checkin: Date;
    maletas: { tipo: string; peso: number }[];
}

const ReservaSchema = new Schema<IReserva>({
    id_usuario: { type: Schema.Types.ObjectId, ref: 'Usuario', required: true },
    id_vuelo: { type: Schema.Types.ObjectId, ref: 'Vuelo', required: true },
    asientos_reservados: { type: Number, required: true },
    asientos: { type: [Number], required: true },
    fecha_reserva: { type: Date, required: true },
    estado: { type: String, required: true },
    codigo_reserva: { type: String, required: true },
    fecha_checkin: { type: Date, required: false, default: null },
    maletas: { type: [{ tipo: String, peso: Number }], required: false },
}, {
    timestamps: true,
});

export const ReservaModel = model<IReserva>('Reserva', ReservaSchema);