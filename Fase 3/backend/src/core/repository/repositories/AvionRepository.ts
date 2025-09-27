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

    async updateEstado(id: string, estado: string): Promise<IAvion | null> {
        return AvionModel.findByIdAndUpdate(id, { estado }, { new: true }).exec();
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

    async getStatisticsAviones(): Promise<{ totalAviones: number; averageFlightHours: number; totalAvionesCriticos: number; }> {
        const totalAviones = await AvionModel.countDocuments();
        const totalHoras = await AvionModel.aggregate([
            { $group: { _id: null, total: { $sum: "$horas_Vuelo" } } }
        ]);
        const averageFlightHours = totalAviones > 0 ? (totalHoras[0]?.total || 0) / totalAviones : 0;
        const totalAvionesCriticos = await AvionModel.countDocuments({ estado: 'Fuera de servicio' });
        return { totalAviones, averageFlightHours, totalAvionesCriticos };
    }
}