import { IAvion } from "../models/Avion.js";

export interface IAvionRepository {
    create(avion: IAvion): Promise<IAvion>;
    findAll(): Promise<IAvion[]>;
    findById(id: string): Promise<IAvion | null>;
    update(id: string, avion: IAvion): Promise<IAvion | null>;
    delete(id: string): Promise<boolean>;
    updateEstado(id: string, estado: string): Promise<IAvion | null>;
    addFlightHours(id: string, hours: number): Promise<IAvion | null>;
    getStatisticsAviones(): Promise<{ totalAviones: number, averageFlightHours: number, totalAvionesCriticos: number }>;
}
