import { Request, Response } from "express"
import { AuthRequest } from "../../../middleware/authMiddleware"
import { ReservaService } from "../../../core/repository/services/ReservaService";
import { ReservaFacade } from "../../../core/facade/ReservaFacade";


export class ReservaController {

    constructor(private readonly reservaFacade: ReservaFacade) {
    }

    crearReserva = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const datosReserva = req.body;
            if (req.user) {
                datosReserva.id_usuario = req.user.id; // Asignar el ID del usuario autenticado
            } else {
                res.status(401).json({ error: "Usuario no autenticado" });
                return;
            }

            const reservaCreada = await this.reservaFacade.crearReserva(datosReserva);
            res.status(201).json({message: "Reserva creada exitosamente", reserva: reservaCreada});
        } catch (error: any) {
            console.error("Error al crear reserva:", error);
            res.status(500).json({ error: error.message || "Error al crear reserva" });
        }
    }

    // Implementar todas las del service
    obtenerReserva = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idReserva = req.params.id;
            const reserva = await this.reservaFacade.obtenerReserva(idReserva);
            if (reserva) {
                res.status(200).json(reserva);
            } else {
                res.status(404).json({ error: "Reserva no encontrada" });
            }
        } catch (error) {
            console.error("Error al obtener reserva:", error);
            res.status(500).json({ error: "Error al obtener reserva" });
        }
    }

    listarReservasPorUsuario = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            if (!req.user) {
                res.status(401).json({ error: "Usuario no autenticado" });
                return;
            }

            const reservas = await this.reservaFacade.listarReservasPorUsuario(req.user._id);
            res.status(200).json(reservas);
        } catch (error) {
            console.error("Error al listar reservas por usuario:", error);
            res.status(500).json({ error: "Error al listar reservas por usuario" });
        }
    }

    eliminarReserva = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idReserva = req.params.id;
            const reservaEliminada = await this.reservaFacade.eliminarReserva(idReserva);
            if (reservaEliminada) {
                res.status(200).json({ message: "Reserva cancelada exitosamente" });
            } else {
                res.status(404).json({ error: "Reserva no encontrada" });
            }
        } catch (error) {
            console.error("Error al eliminar reserva:", error);
            res.status(500).json({ error: "Error al eliminar reserva" });
        }
    }

    listarReservasPorVuelo = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idVuelo = req.params.id_vuelo;
            const reservas = await this.reservaFacade.listarReservasPorVuelo(idVuelo);
            res.status(200).json(reservas);
        } catch (error) {
            console.error("Error al listar reservas por vuelo:", error);
            res.status(500).json({ error: "Error al listar reservas por vuelo" });
        }
    }
}