import { IVueloRepository } from '../repositories/IVueloRepository';
import { IVuelo } from '../models/Vuelo';

export class VueloService {
  constructor(private vueloRepository: IVueloRepository) {}

  async crearVuelo(datos: Partial<IVuelo>): Promise<IVuelo> {
    console.log("Vuelo a guardar:", datos);
    return await this.vueloRepository.create(datos as IVuelo);
  }

  async obtenerVuelo(id: string): Promise<IVuelo | null> {
    return await this.vueloRepository.findById(id);
  }

  async listarVuelos(): Promise<IVuelo[]> {
    return await this.vueloRepository.findAll();
  }

  async actualizarEstadoVuelo(id: string, nuevoEstado: string): Promise<IVuelo | null> {
    return await this.vueloRepository.updateEstado(id, nuevoEstado);
  }

  async cancelarVuelo(id: string): Promise<IVuelo | null> {
    return await this.vueloRepository.cancel(id);
  }

  

}