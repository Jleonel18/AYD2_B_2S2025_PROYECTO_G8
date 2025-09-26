import { Schema, model, Document, Types } from 'mongoose';

export interface IVuelo extends Document {
  _id: Types.ObjectId; // Cambia a Types.ObjectId
  origen: Types.ObjectId;
  destino: Types.ObjectId;
  fecha_salida: Date;
  fecha_llegada: Date;
  aeronave: Types.ObjectId; // Cambia a Types.ObjectId
  estado: string; // Cambia a Types.ObjectId
  tripulacion: {
    piloto_id: Types.ObjectId; // Cambia a Types.ObjectId
    copiloto_id: Types.ObjectId; // Cambia a Types.ObjectId
    sobrecargos: Types.ObjectId[]; // Cambia a Types.ObjectId[]
  };
}

const VueloSchema = new Schema<IVuelo>({
  origen: { type: Schema.Types.ObjectId, ref: 'Aeropuerto', required: true },
  destino: { type: Schema.Types.ObjectId, ref: 'Aeropuerto', required: true },
  fecha_salida: { type: Date, required: true },
  fecha_llegada: { type: Date, required: true },
  aeronave: { type: Schema.Types.ObjectId, ref: 'Avion', required: true },
  estado: { type: String, required: true },
  tripulacion: {
    piloto_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    copiloto_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sobrecargos: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
}, {
  timestamps: true,
});

export const VueloModel = model<IVuelo>('Vuelo', VueloSchema);