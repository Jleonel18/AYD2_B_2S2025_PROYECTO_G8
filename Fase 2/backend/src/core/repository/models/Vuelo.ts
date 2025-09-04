import { Schema, model, Document } from 'mongoose';

export interface IVuelo extends Document {
  _id?: string;
  origen: string;
  destino: string;
  fecha_salida: Date;
  fecha_llegada: Date;
  aeronave: string;
  estado: string;
  tripulacion: {
    piloto_id: string;
    copiloto_id: string;
    sobrecargos: string[];
  };
}

const VueloSchema = new Schema<IVuelo>({
  origen: { type: String, required: true },
  destino: { type: String, required: true },
  fecha_salida: { type: Date, required: true },
  fecha_llegada: { type: Date, required: true },
  aeronave: { type: Schema.Types.ObjectId, ref: 'Avion', required: true },
  estado: { type: Schema.Types.ObjectId, required: true },
  tripulacion: {
    piloto_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    copiloto_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    sobrecargos: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
}, {
  timestamps: true,
});

export const VueloModel = model<IVuelo>('Vuelo', VueloSchema);