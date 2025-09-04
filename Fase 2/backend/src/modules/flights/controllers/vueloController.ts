import { Request, Response } from "express";
import { VueloService } from "../../../core/repository/services/VueloService";
import { IVuelo } from "../../../core/repository/models/Vuelo";
import { Types } from "mongoose";

// Tipo para los datos de entrada desde req.body (sin propiedades de Document)
interface VueloInput {
  origen: string;
  destino: string;
  fecha_salida: string; // Formato ISO desde el cuerpo
  fecha_llegada: string;
  aeronave: string; // ID como string
  estado?: string; // Opcional, si viene del cuerpo
  tripulacion: {
    piloto_id: string;
    copiloto_id: string;
    sobrecargos?: string[];
  };
}

export class VueloController {
  constructor(private readonly vueloService: VueloService) {}

  crearVuelo = async (req: Request, res: Response) => {
    try {
      const { origen, destino, fecha_salida, fecha_llegada, aeronave, estado, tripulacion } = req.body as VueloInput;

      // Validaciones básicas según el enunciado
      if (!origen || !destino || !fecha_salida || !fecha_llegada || !aeronave || !tripulacion?.piloto_id || !tripulacion?.copiloto_id) {
        return res.status(400).json({ error: "Faltan datos requeridos para crear el vuelo" });
      }

      // Construir datos parciales para el servicio
      const vueloData = {
        origen,
        destino,
        fecha_salida: new Date(fecha_salida),
        fecha_llegada: new Date(fecha_llegada),
        aeronave: new Types.ObjectId(aeronave),
        estado: estado ? new Types.ObjectId(estado) : new Types.ObjectId(), // Estado inicial
        tripulacion: {
          piloto_id: new Types.ObjectId(tripulacion.piloto_id),
          copiloto_id: new Types.ObjectId(tripulacion.copiloto_id),
          sobrecargos: tripulacion.sobrecargos?.map((id: string) => new Types.ObjectId(id)) || [],
        },
      };

      const nuevoVuelo = await this.vueloService.crearVuelo(vueloData); // Pasa como Partial<IVuelo>
      res.status(201).json(nuevoVuelo);
    } catch (error) {
      res.status(400).json({ error: (error as Error).message });
    }
  };

  obtenerVuelo = async (req: Request, res: Response) => {
    try {
      const vuelo = await this.vueloService.obtenerVuelo(req.params.id);
      if (!vuelo) {
        return res.status(404).json({ error: "Vuelo no encontrado" });
      }
      res.json(vuelo);
    } catch (error) {
      res.status(500).json({ error: "Error en el servidor" });
    }
  };

  listarVuelos = async (req: Request, res: Response) => {
    try {
      const vuelos = await this.vueloService.listarVuelos();
      res.json(vuelos);
    } catch (error) {
      res.status(500).json({ error: "Error al listar vuelos" });
    }
  };

  cancelarVuelo = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const vuelo = await this.vueloService.obtenerVuelo(id);
      if (!vuelo) {
        return res.status(404).json({ error: "Vuelo no encontrado" });
      }
      // Actualizar estado a "Cancelado" (necesitarías un ID de estado "Cancelado")
      const estadoCancelado = new Types.ObjectId(); // Reemplaza con el ID real de "Cancelado"
      const vueloCancelado = await this.vueloService.crearVuelo({ ...vuelo, estado: estadoCancelado });
      res.json(vueloCancelado);
    } catch (error) {
      res.status(500).json({ error: "Error al cancelar el vuelo" });
    }
  };

  // Método para que pilotos/copilotos actualicen el estado
  actualizarEstadoVuelo = async (req: Request, res: Response) => {
    try {
      const id = req.params.id;
      const { estado } = req.body as { estado: string };
      if (!estado) {
        return res.status(400).json({ error: "Estado requerido" });
      }
      const vuelo = await this.vueloService.obtenerVuelo(id);
      if (!vuelo) {
        return res.status(404).json({ error: "Vuelo no encontrado" });
      }
      // Validar que el usuario sea piloto o copiloto (lógica de autenticación pendiente)
      const vueloActualizado = await this.vueloService.crearVuelo({ ...vuelo, estado: new Types.ObjectId(estado) });
      res.json(vueloActualizado);
    } catch (error) {
      res.status(500).json({ error: "Error al actualizar el estado" });
    }
  };
}