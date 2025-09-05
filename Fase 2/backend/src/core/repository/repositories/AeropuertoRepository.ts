import { IAeropuertoRepository } from "./IAeropuertoRepository";
import { AeropuertoModel, IAeropuerto } from "../models/Aeropuerto";

export class AeropuertoRepository implements IAeropuertoRepository {
    async create(aeropuerto: IAeropuerto): Promise<IAeropuerto> {
        const newAeropuerto = new AeropuertoModel(aeropuerto);
        return await newAeropuerto.save();
    }

    async findAll(): Promise<IAeropuerto[]> {
        return await AeropuertoModel.find();
    }

    async findById(id: string): Promise<IAeropuerto | null> {
        return await AeropuertoModel.findById(id);
    }

    async update(id: string, aeropuerto: IAeropuerto): Promise<IAeropuerto | null> {
        return await AeropuertoModel.findByIdAndUpdate(id, aeropuerto, { new: true });
    }

    async delete(id: string): Promise<boolean> {
        const result = await AeropuertoModel.findByIdAndDelete(id);
        return result !== null;
    }
}
