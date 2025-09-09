import { Request, Response } from "express";
import { AvionService } from "../../../core/repository/services/AvionService";
import { IAvion } from "../../../core/repository/models/Avion";

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
}