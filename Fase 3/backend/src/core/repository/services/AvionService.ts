import { IAvionRepository } from "../repositories/IAvionRepository.js";
import { IAvion } from "../models/Avion.js";
import { publisher, MaintenanceEventData } from '../../../events/eventConfig.js';

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
        const updated = await this.avionRepository.updateEstado(id, 'Eliminado');
        return updated !== null;
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
        const updatedAvion = await this.avionRepository.addFlightHours(id, hours);

        if(updatedAvion && updatedAvion.horas_Vuelo >= updatedAvion.limite_horas) {
            try {
                await publisher.connect();
                const eventData: MaintenanceEventData = {
                    airplaneId: id,
                    hours: updatedAvion.horas_Vuelo,
                    limitExceeded: true,
                    maintenanceStatus: 'Requiere Mantenimiento'
                };
                await publisher.publish('mantenimiento-avion', JSON.stringify(eventData));
            } catch (error) {
                console.error('Error al publicar el evento de mantenimiento de avión:', error);
            } finally {
                await publisher.quit();
            }
        }
        return updatedAvion;
    } 
    
    async getEstadoAvion(id: string): Promise<string | null> {
        const avion = await this.avionRepository.findById(id);
        return avion ? avion.estado : null;
    }

    async getStatisticsAviones(): Promise<{ totalAviones: number; averageFlightHours: number; totalAvionesCriticos: number; }> {
        return await this.avionRepository.getStatisticsAviones();
    }

}
