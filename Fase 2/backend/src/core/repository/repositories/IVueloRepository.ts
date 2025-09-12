import { IVuelo } from '../models/Vuelo';

export interface IVueloRepository {
  create(vuelo: Partial<IVuelo>): Promise<IVuelo>;
  findById(id: string): Promise<IVuelo | null>;
  findAll(): Promise<IVuelo[]>;
  update(id: string, vuelo: Partial<IVuelo>): Promise<IVuelo | null>;
  delete(id: string): Promise<void>;
  updateEstado(id: string, nuevoEstado: string): Promise<IVuelo | null>;
  cancel(id: string): Promise<IVuelo | null>;
  findVuelosByTrabajador(trabajadorId: string): Promise<IVuelo[]>;
}