import { IAeropuerto } from "../models/Aeropuerto.js";

export interface IAeropuertoRepository {
    create(aeropuerto: IAeropuerto): Promise<IAeropuerto>;
    findAll(): Promise<IAeropuerto[]>;
    findById(id: string): Promise<IAeropuerto | null>;
    update(id: string, aeropuerto: IAeropuerto): Promise<IAeropuerto | null>;
    delete(id: string): Promise<boolean>;
}
