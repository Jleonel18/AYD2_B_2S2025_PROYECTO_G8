import { IVueloRepository } from './IVueloRepository.js';
import { VueloModel, IVuelo } from '../models/Vuelo.js';
import { Types } from 'mongoose';

export class VueloRepository implements IVueloRepository {
  async create(vuelo: Partial<IVuelo>): Promise<IVuelo> {
    const newVuelo = new VueloModel(vuelo);
    return await newVuelo.save();
  }

  async findById(id: string): Promise<IVuelo | null> {
    return await VueloModel.findById(id);
  }

  async findAll(): Promise<IVuelo[]> {
    return await VueloModel.find({ estado: 'Planificado' });
  }

  async update(id: string, vuelo: Partial<IVuelo>): Promise<IVuelo | null> {
    return await VueloModel.findByIdAndUpdate(id, vuelo, { new: true });
  }

  async delete(id: string): Promise<void> {
    await VueloModel.findByIdAndDelete(id);
  }

  async updateEstado(id: string, nuevoEstado: string): Promise<IVuelo | null> {
    return await VueloModel.findByIdAndUpdate(id, { estado: nuevoEstado }, { new: true });
  }
  async cancel(id: string): Promise<IVuelo | null> {
    return await VueloModel.findByIdAndUpdate(id, { estado: "Cancelado" }, { new: true });
  } 

  async findVuelosByTrabajador(trabajadorId: string): Promise<IVuelo[]> {
    if (!Types.ObjectId.isValid(trabajadorId)) {
      throw new Error(`ID de trabajador inválido: ${trabajadorId}`);
    }

    return await VueloModel.find({ 
      $or: [
        { 'tripulacion.piloto_id': new Types.ObjectId(trabajadorId) },
        { 'tripulacion.copiloto_id': new Types.ObjectId(trabajadorId) },
        { 'tripulacion.sobrecargos': new Types.ObjectId(trabajadorId) }
      ],
      estado: { $ne: 'Cancelado' }
    });
  }

  async getStatisticsVuelos(): Promise<{ totalVuelos: number; totalVuelosCompletados: number; totalVuelosCancelados: number; totalVuelosPlanificados: number; }> {
    const totalVuelos = await VueloModel.countDocuments();
    const totalVuelosCompletados = await VueloModel.countDocuments({ estado: 'Aterrizado' });
    const totalVuelosCancelados = await VueloModel.countDocuments({ estado: 'Cancelado' });
    const totalVuelosPlanificados = await VueloModel.countDocuments({ estado: 'Planificado' });
    return { totalVuelos, totalVuelosCompletados, totalVuelosCancelados, totalVuelosPlanificados };
  }
}
