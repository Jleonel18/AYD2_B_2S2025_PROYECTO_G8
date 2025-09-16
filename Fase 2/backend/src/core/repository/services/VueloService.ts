import { IVueloRepository } from '../repositories/IVueloRepository';
import { VueloModel, IVuelo } from '../models/Vuelo';
import { Types } from 'mongoose';
import { EstadoVuelo } from '../../observer/observador';

export class VueloService {
    private vueloRepository: IVueloRepository;

    constructor(vueloRepository: IVueloRepository) {
        this.vueloRepository = vueloRepository;
    }

    async crearVuelo(datos: Partial<IVuelo>): Promise<IVuelo> {
        console.log("Vuelo a guardar:", datos);
        // Asumimos que el estado inicial es PLANIFICADO si no se proporciona
        const estado = datos.estado ? (datos.estado as EstadoVuelo) : EstadoVuelo.PLANIFICADO;
        const vueloData = { ...datos, estado };
        const vuelo = await this.vueloRepository.create(vueloData as IVuelo);
        return vuelo;
    }

    async obtenerVuelo(id: string): Promise<IVuelo | null> {
        return await this.vueloRepository.findById(id);
    }

    async listarVuelos(): Promise<IVuelo[]> {
        return await this.vueloRepository.findAll();
    }

    async actualizarEstadoVuelo(id: string, nuevoEstado: string): Promise<IVuelo | null> {
        const vuelo = await this.vueloRepository.updateEstado(id, nuevoEstado);
        return vuelo;
    }

    async cancelarVuelo(id: string): Promise<IVuelo | null> {
        const vuelo = await this.vueloRepository.cancel(id);
        return vuelo;
    }

    async actualizarVuelo(id: string, datos: Partial<IVuelo>): Promise<IVuelo | null> {
        const vuelo = await this.vueloRepository.update(id, datos);
        return vuelo;
    }

    async verificarDisponibilidadTrabajador(trabajadorId: string, fecha_salida: Date, fecha_llegada: Date): Promise<boolean> {
        // Validar que fecha_salida sea anterior a fecha_llegada
        if (fecha_salida >= fecha_llegada) {
            console.log(`Error: La fecha de salida (${fecha_salida}) debe ser anterior a la fecha de llegada (${fecha_llegada})`);
            return false;
        }

        const vuelosAsignados = await this.vueloRepository.findVuelosByTrabajador(trabajadorId);
        
        for (const vuelo of vuelosAsignados) {
            // Verificar superposición de fechas
            if (fecha_salida <= vuelo.fecha_llegada && fecha_llegada >= vuelo.fecha_salida) {
                console.log(`El trabajador ${trabajadorId} está ocupado entre ${vuelo.fecha_salida} y ${vuelo.fecha_llegada}`);
                return false; // El trabajador está ocupado
            }
        }

        console.log(`El trabajador ${trabajadorId} está disponible`);
        return true; // El trabajador está disponible
    }

    async verificarDisponibilidadAvion(aeronave: string, fecha_salida: Date, fecha_llegada: Date): Promise<boolean> {
        // Validar que fecha_salida sea anterior a fecha_llegada
        if (fecha_salida >= fecha_llegada) {
            console.log(`Error: La fecha de salida (${fecha_salida}) debe ser anterior a la fecha de llegada (${fecha_llegada})`);
            return false;
        }

        const vuelosAsignados = await VueloModel.find({ 'aeronave': new Types.ObjectId(aeronave), estado: { $ne: 'Cancelado' } });

        for (const vuelo of vuelosAsignados) {
            // Verificar superposición de fechas
            if (fecha_salida <= vuelo.fecha_llegada && fecha_llegada >= vuelo.fecha_salida) {
                console.log(`El avión ${aeronave} está ocupado entre ${vuelo.fecha_salida} y ${vuelo.fecha_llegada}`);
                return false; // El avión está ocupado
            }
        }

        console.log(`El avión ${aeronave} está disponible`);
        return true; // El avión está disponible
    }

}