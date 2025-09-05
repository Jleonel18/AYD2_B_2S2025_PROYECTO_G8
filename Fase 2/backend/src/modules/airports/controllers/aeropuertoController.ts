import { Request, Response } from "express";
import { AeropuertoService } from "../../../core/repository/services/AeropuertoService";
import { IAeropuerto } from "../../../core/repository/models/Aeropuerto";

export class AeropuertoController {
    constructor(private readonly aeropuertoService: AeropuertoService) {}

    crearAeropuerto = async (req: Request, res: Response) => {
        try {
            const aeropuertoData: IAeropuerto = req.body;
            const nuevoAeropuerto = await this.aeropuertoService.createAeropuerto(aeropuertoData);
            res.status(201).json(nuevoAeropuerto);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    obtenerTodosLosAeropuertos = async (req: Request, res: Response) => {
        try {
            const aeropuertos = await this.aeropuertoService.getAllAeropuertos();
            res.json(aeropuertos);
        } catch (error) {
            res.status(500).json({ error: "Error al obtener aeropuertos" });
        }
    }

    obtenerAeropuertoPorId = async (req: Request, res: Response) => {
        try {
            const aeropuerto = await this.aeropuertoService.getAeropuertoById(req.params.id);
            if (!aeropuerto) {
                return res.status(404).json({ error: "Aeropuerto no encontrado" });
            }
            res.json(aeropuerto);
        } catch (error) {
            res.status(500).json({ error: "Error en servidor" });
        }
    }

    actualizarAeropuerto = async (req: Request, res: Response) => {
        try {
            const aeropuertoData: IAeropuerto = req.body;
            const aeropuertoActualizado = await this.aeropuertoService.updateAeropuerto(req.params.id, aeropuertoData);
            if (!aeropuertoActualizado) {
                return res.status(404).json({ error: "Aeropuerto no encontrado" });
            }
            res.json(aeropuertoActualizado);
        } catch (error) {
            res.status(400).json({ error: (error as Error).message });
        }
    }

    eliminarAeropuerto = async (req: Request, res: Response) => {
        try {
            const eliminado = await this.aeropuertoService.deleteAeropuerto(req.params.id);
            if (!eliminado) {
                return res.status(404).json({ error: "Aeropuerto no encontrado" });
            }
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ error: "Error al eliminar aeropuerto" });
        }
    }
}