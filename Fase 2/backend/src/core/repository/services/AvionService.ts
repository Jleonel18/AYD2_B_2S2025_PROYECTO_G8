import { IAvionRepository } from "../repositories/IAvionRepository";
import { IAvion } from "../models/Avion";

export class AvionService {
    constructor(private avionRepository: IAvionRepository) {}

    async createAvion(avion: IAvion): Promise<IAvion> {
        return await this.avionRepository.create(avion);
    }

    async getAllAviones(): Promise<IAvion[]> {
        return await this.avionRepository.findAll();
    }

    async getAvionById(id: string): Promise<IAvion | null> {
        return await this.avionRepository.findById(id);
    }

    async updateAvion(id: string, avion: IAvion): Promise<IAvion | null> {
        return await this.avionRepository.update(id, avion);
    }

    async deleteAvion(id: string): Promise<boolean> {
        return await this.avionRepository.delete(id);
    }

    async avionEstaEnAeropuerto(idAvion: string, idAeropuerto: string): Promise<boolean> {
        const avion = await this.avionRepository.findById(idAvion);
        return avion?.id_aeropuerto_actual?.toString() == idAeropuerto;
        
    }

    async addFlightHoursToAvion(id: string, hours: number): Promise<IAvion | null> {
    if (hours <= 0) {
        throw new Error("Las horas de vuelo deben ser un número positivo");
    }
    
    const avion = await this.avionRepository.findById(id);
    if (!avion) {
        throw new Error("Avión no encontrado");
    }
    
    return await this.avionRepository.addFlightHours(id, hours);
    }   

}
