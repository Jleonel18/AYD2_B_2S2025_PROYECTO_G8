import { IVueloRepository } from '../repositories/IVueloRepository';
import { IVuelo } from '../models/Vuelo';
import { VueloType } from '../../factory/vuelo';
import VueloFactory from '../../factory/vueloFactory';

export class VueloService {
  constructor(private vueloRepository: IVueloRepository) {}

  async crearVuelo(tipo: VueloType, datos: any): Promise<IVuelo> {
    const vuelo = VueloFactory.crearVuelo(tipo, datos);
    console.log("Vuelo a guardar:", vuelo.toJSON());
    return await this.vueloRepository.create({
      ...vuelo.toJSON()
    });
  }

  async obtenerVuelo(id: string): Promise<IVuelo | null> {
    return await this.vueloRepository.findById(id);
  }

  async listarVuelos(): Promise<IVuelo[]> {
    return await this.vueloRepository.findAll();
  }
}