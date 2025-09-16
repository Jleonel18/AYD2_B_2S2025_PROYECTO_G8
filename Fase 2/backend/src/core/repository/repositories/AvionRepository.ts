import { IAvionRepository } from "./IAvionRepository.js";
import { AvionModel, IAvion } from "../models/Avion.js";

export class AvionRepository implements IAvionRepository {
    
    async create(avion: Partial<IAvion>): Promise<IAvion> {
        const nuevoAvion = new AvionModel(avion);
        return await nuevoAvion.save();
    }

    async findById(id: string): Promise<IAvion | null> {
        return await AvionModel.findById(id).exec();
    }

    async findAll(): Promise<IAvion[]> {
        return await AvionModel.find().exec();
    }

    async update(id: string, avion: Partial<IAvion>): Promise<IAvion | null> {
        return await AvionModel.findByIdAndUpdate(id, avion, { new: true }).exec();
    }

    async delete(id: string): Promise<boolean> {
        const result = await AvionModel.findByIdAndDelete(id).exec();
        return result !== null;
    }

    async addFlightHours(id: string, hours: number): Promise<IAvion | null> {
    return await AvionModel.findByIdAndUpdate(
        id, 
        { $inc: { horas_Vuelo: hours } }, // Incrementa las horas de vuelo
        { new: true }
    ).exec();
}

}