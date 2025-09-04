import { IAvion } from "../models/Avion";

export interface IAvionRepository {
    create(avion: IAvion): Promise<IAvion>;
    findAll(): Promise<IAvion[]>;
    findById(id: string): Promise<IAvion | null>;
    update(id: string, avion: IAvion): Promise<IAvion | null>;
    delete(id: string): Promise<boolean>;
}
