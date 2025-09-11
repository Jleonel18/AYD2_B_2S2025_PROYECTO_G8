import { IVueloRepository } from '../repositories/IVueloRepository';
import { VueloModel, IVuelo } from '../models/Vuelo';
import { Observador, EstadoVuelo } from '../../observer/observador'; // Ajusta la ruta según tu estructura

export class VueloService {
    private vueloRepository: IVueloRepository;
    private observadores: Observador[] = [];

    constructor(vueloRepository: IVueloRepository) {
        this.vueloRepository = vueloRepository;
    }

    // Métodos para gestionar observadores
    public registrarObservador(observador: Observador): void {
        this.observadores.push(observador);
    }

    public eliminarObservador(observador: Observador): void {
        const index = this.observadores.indexOf(observador);
        if (index !== -1) {
            this.observadores.splice(index, 1);
        }
    }

    private notificarObservadores(estado: EstadoVuelo, vueloId: string): void {
        this.observadores.forEach(observador => observador.actualizar(estado, vueloId));
    }

    async crearVuelo(datos: Partial<IVuelo>): Promise<IVuelo> {
        console.log("Vuelo a guardar:", datos);
        // Asumimos que el estado inicial es PLANIFICADO si no se proporciona
        const estado = datos.estado ? (datos.estado as EstadoVuelo) : EstadoVuelo.PLANIFICADO;
        const vueloData = { ...datos, estado };
        const vuelo = await this.vueloRepository.create(vueloData as IVuelo);
        this.notificarObservadores(estado, vuelo._id.toString());
        return vuelo;
    }

    async obtenerVuelo(id: string): Promise<IVuelo | null> {
        return await this.vueloRepository.findById(id);
    }

    async listarVuelos(): Promise<IVuelo[]> {
        return await this.vueloRepository.findAll();
    }

    async actualizarEstadoVuelo(id: string, nuevoEstado: string): Promise<IVuelo | null> {
        const estadoVuelo = nuevoEstado as EstadoVuelo; // Validar que sea un valor válido de EstadoVuelo
        const vuelo = await this.vueloRepository.updateEstado(id, estadoVuelo);
        if (vuelo) {
            this.notificarObservadores(estadoVuelo, id);
        }
        return vuelo;
    }

    async cancelarVuelo(id: string): Promise<IVuelo | null> {
        const vuelo = await this.vueloRepository.cancel(id);
        if (vuelo) {
            this.notificarObservadores(EstadoVuelo.CANCELADO, id);
        }
        return vuelo;
    }

    async actualizarVuelo(id: string, datos: Partial<IVuelo>): Promise<IVuelo | null> {
        const vuelo = await this.vueloRepository.update(id, datos);
        if (vuelo && 'estado' in datos) {
            this.notificarObservadores(datos.estado as EstadoVuelo, id);
        }
        return vuelo;
    }

}