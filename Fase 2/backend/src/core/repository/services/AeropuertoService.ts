import { IAeropuertoRepository } from "../repositories/IAeropuertoRepository";
import { IAeropuerto } from "../models/Aeropuerto";

export class AeropuertoService {
    constructor(private aeropuertoRepository: IAeropuertoRepository) {}

    async createAeropuerto(aeropuerto: IAeropuerto): Promise<IAeropuerto> {
        return await this.aeropuertoRepository.create(aeropuerto);
    }

    async getAllAeropuertos(): Promise<IAeropuerto[]> {
        return await this.aeropuertoRepository.findAll();
    }

    async getAeropuertoById(id: string): Promise<IAeropuerto | null> {
        return await this.aeropuertoRepository.findById(id);
    }

    async updateAeropuerto(id: string, aeropuerto: IAeropuerto): Promise<IAeropuerto | null> {
        return await this.aeropuertoRepository.update(id, aeropuerto);
    }

    async deleteAeropuerto(id: string): Promise<boolean> {
        return await this.aeropuertoRepository.delete(id);
    }
}
