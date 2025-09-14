import { Request, Response } from "express"
import { AuthRequest } from "../../../middleware/authMiddleware"
import { ReservaService } from "../../../core/repository/services/ReservaService";
import { ReservaFacade } from "../../../core/facade/ReservaFacade";
import { generarCodigoQR } from "../../../utils/qr";
import { enviarCorreoActualizacionReserva, enviarQRReserva } from "../../../utils/send_email";
import { UserService } from "../../../core/repository/services/UserService";
import { VueloService } from "../../../core/repository/services/VueloService";


export class ReservaController {

    constructor(private readonly reservaFacade: ReservaFacade, private readonly userService: UserService, private readonly vueloService: VueloService) {
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

            const qrCode = await generarCodigoQR(reservaCreada._id.toString())

            const usuario = await this.userService.obtenerUsuario(reservaCreada.id_usuario.toString());

            if(!usuario) {
                throw new Error("El usuario asociado a la reserva no existe");
            }

            await enviarQRReserva({ correoDestino: usuario.correo, nombre: usuario.nombre, codigo_reserva: reservaCreada.codigo_reserva, qrCode, estado: reservaCreada.estado });

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

            if(!reserva) {
                throw new Error("Reserva no encontrada");
            }

            const vuelo = await this.vueloService.obtenerVuelo(reserva.id_vuelo.toString());
            if (!vuelo) {
                throw new Error("El vuelo asociado a la reserva no existe");
            }

            if (reserva) {
                res.status(200).json({ reserva, vuelo });
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

            const reservas = await this.reservaFacade.listarReservasPorUsuario(req.user.id);
            res.status(200).json(reservas);
        } catch (error) {
            console.error("Error al listar reservas por usuario:", error);
            res.status(500).json({ error: "Error al listar reservas por usuario" });
        }
    }

    eliminarReserva = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idReserva = req.params.id;
            const reservaEliminada = await this.reservaFacade.eliminarReserva(idReserva, req.user.id);
            if (reservaEliminada) {
                res.status(200).json({ message: "Reserva cancelada exitosamente" });
            } else {
                res.status(404).json({ error: "Reserva no encontrada" });
            }
        } catch (error: any) {
            console.error("Error al eliminar reserva:", error);
            res.status(500).json({ error: error.message || "Error al eliminar reserva" });
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

    hacerCheckIn = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idReserva = req.params.id;
            const maletas = req.body.maletas; // Espera un array de maletas en el cuerpo de la solicitud

            const reservaActualizada = await this.reservaFacade.hacerCheckIn(idReserva, req.user.id, maletas);
            if (reservaActualizada) {

                const qrCode = await generarCodigoQR(reservaActualizada._id.toString())

                await enviarCorreoActualizacionReserva({ correoDestino: req.user.correo, nombre: req.user.nombre, codigo_reserva: reservaActualizada.codigo_reserva, qrCode: qrCode, estado: reservaActualizada.estado });

                res.status(200).json({ message: "Check-in realizado exitosamente", reserva: reservaActualizada });
            } else {
                res.status(404).json({ error: "Reserva no encontrada" });
            }
        } catch (error) {
            console.error("Error al hacer check-in:", error);
            res.status(500).json({ error: "Error al hacer check-in" });
        }
    }

    cambiarEstadoReserva = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idReserva = req.params.id;

            const reservaActualizada = await this.reservaFacade.cambiarEstadoReserva(idReserva);
            if (reservaActualizada) {
                const qrCode = await generarCodigoQR(reservaActualizada._id.toString())

                await enviarCorreoActualizacionReserva({ correoDestino: req.user.correo, nombre: req.user.nombre, codigo_reserva: reservaActualizada.codigo_reserva, qrCode: qrCode, estado: reservaActualizada.estado });
                res.status(200).json({ message: "Estado de reserva actualizado exitosamente", reserva: reservaActualizada });
            } else {
                res.status(404).json({ error: "Reserva no encontrada" });
            }
        } catch (error: any) {
            console.error("Error al cambiar estado de reserva:", error);
            res.status(500).json({ error: error.message || "Error al cambiar estado de reserva" });
        }
    }

    obtenerAsientosReservados = async (req: AuthRequest, res: Response): Promise<void> => {
        try {
            const idVuelo = req.params.id_vuelo;
            const asientos = await this.reservaFacade.obtenerAsientosReservados(idVuelo);
            res.status(200).json(asientos);
        } catch (error) {
            console.error("Error al obtener asientos reservados:", error);
            res.status(500).json({ error: "Error al obtener asientos reservados" });
        }
    }
}