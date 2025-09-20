import { Request, Response } from "express";
import { AvionService } from "../../../core/repository/services/AvionService.js";
import { IAvion } from "../../../core/repository/models/Avion.js";

export class AvionController {
    constructor(private readonly avionService: AvionService) {}

    crearAvion = async (req: Request, res: Response) => {
        try {
            const avionData: IAvion = req.body;
            const nuevoAvion = await this.avionService.createAvion(avionData);
            res.status(201).json(nuevoAvion);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    obtenerTodosLosAviones = async (req: Request, res: Response) => {
        try {
            const aviones = await this.avionService.getAllAviones();
            res.json(aviones);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener aviones" });
        }
    }

    obtenerAvionPorId = async (req: Request, res: Response) => {
        try {
            const avion = await this.avionService.getAvionById(req.params.id);
            if (!avion) {
                return res.status(404).json({ error: "Avión no encontrado" });
            }
            res.json(avion);
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    }

    actualizarAvion = async (req: Request, res: Response) => {
        try {
            const avionData: IAvion = req.body;
            const avionActualizado = await this.avionService.updateAvion(req.params.id, avionData);
            if (!avionActualizado) {
                return res.status(404).json({ error: "Avión no encontrado" });
            }
            res.json(avionActualizado);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    eliminarAvion = async (req: Request, res: Response) => {
        try {
            const eliminado = await this.avionService.deleteAvion(req.params.id);
            if (!eliminado) {
                return res.status(404).json({ error: "Avión no encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar avión" });
        }
    }

    sumarHorasVuelo = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const { horas } = req.body;
            
            if (!horas || typeof horas !== 'number') {
                return res.status(400).json({ 
                    error: "Debe proporcionar un número válido de horas" 
                });
            }
            
            const avionActualizado = await this.avionService.addFlightHoursToAvion(id, horas);
            let estadoNuevo: any;
            
            if (!avionActualizado) {
                return res.status(404).json({ error: "Avión no encontrado" });
            }

            if(avionActualizado.horas_Vuelo > avionActualizado.limite_horas) {
                estadoNuevo = await this.avionService.updateAvion(id, { estado: 'Fuera de servicio' } as IAvion);
            }
            
            res.json({
                message: `Se agregaron ${horas} horas de vuelo al avión`,
                avion: estadoNuevo || avionActualizado
            });
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    verificarHorasVuelo = async (req: Request, res: Response) => {
        try {
            const { id } = req.params;
            const avion = await this.avionService.getAvionById(id);
            if (!avion) {
                return res.status(404).json({ error: "Avión no encontrado" });
            }
            if (avion.horas_Vuelo > avion.limite_horas) {
                return res.status(200).json({ 
                    horasSuperadas: true,
                    message: "El avión ha superado el límite de horas de vuelo", 
                    avion 
                });
            } else {
                return res.status(200).json({   
                    horasSuperadas: false,
                    message: "El avión está dentro del límite de horas de vuelo",
                    avion
                });
            }
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    //horas_Vuelo
    //limite_horas
    }
}