import { IVueloRepository } from './IVueloRepository';
import { VueloModel, IVuelo } from '../models/Vuelo';

export class VueloRepository implements IVueloRepository {
  async create(vuelo: Partial<IVuelo>): Promise<IVuelo> {
    const newVuelo = new VueloModel(vuelo);
    return await newVuelo.save();
  }

  async findById(id: string): Promise<IVuelo | null> {
    return await VueloModel.findById(id);
  }

  async findAll(): Promise<IVuelo[]> {
    return await VueloModel.find();
  }

  async update(id: string, vuelo: Partial<IVuelo>): Promise<IVuelo | null> {
    return await VueloModel.findByIdAndUpdate(id, vuelo, { new: true });
  }

  async delete(id: string): Promise<void> {
    await VueloModel.findByIdAndDelete(id);
  }
}