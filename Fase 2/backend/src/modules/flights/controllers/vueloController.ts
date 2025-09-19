import { Request, Response } from "express";
import { VueloService } from "../../../core/repository/services/VueloService.js";
import { IVuelo } from "../../../core/repository/models/Vuelo.js";
import { Types } from "mongoose";
import { EstadoVuelo } from "../../../core/observer/observador.js";
import { AvionService } from "../../../core/repository/services/AvionService.js";
import { ReservaService } from "../../../core/repository/services/ReservaService.js";
import { UserService } from "../../../core/repository/services/UserService.js";



export class VueloController {
  constructor(private readonly vueloService: VueloService, private readonly avionService: AvionService, private readonly reservaService: ReservaService, private readonly userService: UserService) {}

  crearVuelo = async (req: Request, res: Response) => {
  try {
    const { origen, destino, fecha_salida, fecha_llegada, aeronave, tripulacion } = req.body;

    // Validaciones básicas
    if (!origen || !destino || !fecha_salida || !fecha_llegada || !aeronave || !tripulacion?.piloto_id || !tripulacion?.copiloto_id) {
      return res.status(400).json({ error: 'Faltan datos requeridos para crear el vuelo' });
    }

    // Validar y convertir fechas
    const fechaSalida = new Date(fecha_salida);
    const fechaLlegada = new Date(fecha_llegada);
    if (isNaN(fechaSalida.getTime()) || isNaN(fechaLlegada.getTime()) || fechaSalida >= fechaLlegada) {
      return res.status(400).json({ error: 'Fechas inválidas o fecha_salida debe ser anterior a fecha_llegada' });
    }

    // Validar y convertir IDs
    let origenId: Types.ObjectId;
    let destinoId: Types.ObjectId;
    let aeronaveId: Types.ObjectId;
    let pilotoId: Types.ObjectId;
    let copilotoId: Types.ObjectId;
    let sobrecargosIds: Types.ObjectId[] = [];

    try {
      origenId = new Types.ObjectId(origen);
      destinoId = new Types.ObjectId(destino);
      aeronaveId = new Types.ObjectId(aeronave);
      pilotoId = new Types.ObjectId(tripulacion.piloto_id);
      copilotoId = new Types.ObjectId(tripulacion.copiloto_id);
      if (tripulacion.sobrecargos && Array.isArray(tripulacion.sobrecargos)) {
        sobrecargosIds = tripulacion.sobrecargos.map((id: string) => new Types.ObjectId(id));
      }
    } catch (castError) {
      return res.status(400).json({ error: 'IDs inválidos (deben ser ObjectIds válidos de 24 caracteres hex)' });
    }

    // Construir datos del vuelo
    const vueloData = {
      origen: origenId,
      destino: destinoId,
      fecha_salida: fechaSalida,
      fecha_llegada: fechaLlegada,
      aeronave: aeronaveId,
      estado: EstadoVuelo.PLANIFICADO,
      tripulacion: {
        piloto_id: pilotoId,
        copiloto_id: copilotoId,
        sobrecargos: sobrecargosIds,
      },
    };

    // Verificar disponibilidad
    if (!(await this.vueloService.verificarDisponibilidadTrabajador(tripulacion.piloto_id, fechaSalida, fechaLlegada))) {
      return res.status(400).json({ error: 'El piloto ya tiene un vuelo asignado en la misma fecha' });
    }

    if (!(await this.vueloService.verificarDisponibilidadTrabajador(tripulacion.copiloto_id, fechaSalida, fechaLlegada))) {
      return res.status(400).json({ error: 'El copiloto ya tiene un vuelo asignado en la misma fecha' });
    }

    if (tripulacion.sobrecargos && Array.isArray(tripulacion.sobrecargos)) {
      const disponibilidades = await Promise.all(
        tripulacion.sobrecargos.map((sobrecargoId: string) =>
          this.vueloService.verificarDisponibilidadTrabajador(sobrecargoId, fechaSalida, fechaLlegada)
        )
      );
      const sobrecargoNoDisponible = tripulacion.sobrecargos.find(
        (_: string, index: number) => !disponibilidades[index]
      );
      if (sobrecargoNoDisponible) {
        const sobrecargoNombre = await this.userService.obtenerUsuario(sobrecargoNoDisponible);
        return res.status(400).json({ error: `El sobrecargo ${sobrecargoNombre?.nombre} ya tiene un vuelo asignado en la misma fecha` });
      }
    }

    if(!(await this.avionService.getEstadoAvion(aeronave))) {
      return res.status(400).json({ error: 'El avión no existe' });
    }

    const estadoAvion = await this.avionService.getEstadoAvion(aeronave);
    if(estadoAvion === 'Fuera de servicio' || estadoAvion === 'Mantenimiento') {
      return res.status(400).json({ error: 'El avión está fuera de servicio o en mantenimiento y no puede ser asignado a un vuelo' });
    }

    if(!(await this.vueloService.verificarDisponibilidadAvion(aeronave, fechaSalida, fechaLlegada))) {
      return res.status(400).json({ error: 'El avión ya tiene un vuelo asignado en la misma fecha' });
    }

    if(!(await this.avionService.avionEstaEnAeropuerto(aeronave, origen))) {
      return res.status(400).json({ error: 'El avión no está en un aeropuerto para iniciar el vuelo' });
    }

    // Crear el vuelo

    const nuevoVuelo = await this.vueloService.crearVuelo(vueloData);
    return res.status(201).json(nuevoVuelo);
  } catch (error) {
    console.error('Error en crearVuelo:', error);
    const message = (error as Error).message;
    if (message.includes('ya tiene') || message.includes('inválid') || message.includes('Faltan')) {
      return res.status(400).json({ error: message });
    }
    return res.status(500).json({ error: 'Error interno en el servidor' });
  }
};

  obtenerVuelo = async (req: Request, res: Response) => {
    try {
      const vuelo = await this.vueloService.obtenerVuelo(req.params.id);

      if (!vuelo) {
        return res.status(404).json({ error: "Vuelo no encontrado" });
      }

      const avion = await this.avionService.getAvionById(vuelo.aeronave.toString());

      res.json({ vuelo, avion });
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

      if(EstadoVuelo.CANCELADO === vuelo.estado) {
        return res.status(400).json({ error: "El vuelo ya está cancelado" });
      }
      
      if(vuelo.estado !== EstadoVuelo.PLANIFICADO && vuelo.estado !== EstadoVuelo.RETRASADO) {
        return res.status(400).json({ error: "Solo se pueden cancelar vuelos en estado 'Planificado' o 'Retrasado'" });
      }

      await this.reservaService.cancelarReservasPorVuelo(id);
      const vueloCancelado = await this.vueloService.cancelarVuelo(id);
      res.json(vueloCancelado);
    } catch (error) {
      res.status(500).json({ error: "Error al cancelar el vuelo" });
    }
  };

  // Método para que pilotos/copilotos actualicen el estado
  // Método para que pilotos/copilotos actualicen el estado
actualizarEstadoVuelo = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const { estado } = req.body as { estado: string };

    // Agregar el estado retrasado
    if(estado !== EstadoVuelo.INICIADO && estado !== EstadoVuelo.CANCELADO && estado !== EstadoVuelo.RETRASADO && estado !== EstadoVuelo.ATERRIZADO && estado !== EstadoVuelo.EN_TIEMPO) {
      return res.status(400).json({ error: "Estado inválido. Solo se permite 'Iniciado', 'Cancelado', 'Retrasado' o 'Aterrizado'" });
    }

    if (!estado) {
      return res.status(400).json({ error: "Estado requerido" });
    }
    const vuelo = await this.vueloService.obtenerVuelo(id);
    if (!vuelo) {
      return res.status(404).json({ error: "Vuelo no encontrado" });
    }
    // Validar que el usuario sea piloto o copiloto (lógica de autenticación pendiente)
    const vueloActualizado = await this.vueloService.actualizarEstadoVuelo(id, estado);


    // Si el vuelo fue aterrizado, actualizar horas de vuelo del piloto y copiloto
    if (estado === EstadoVuelo.ATERRIZADO) {
      // Calcular duración del vuelo en horas a dos decimales
      const duracionMs = vuelo.fecha_llegada.getTime() - vuelo.fecha_salida.getTime();
      const duracionHoras = Math.round((duracionMs / (1000 * 60 * 60)) * 100) / 100; // Dos decimales
      await this.userService.sumarHorasVueloPiloto(vuelo.tripulacion.piloto_id.toString(), duracionHoras);
      await this.userService.sumarHorasVueloPiloto(vuelo.tripulacion.copiloto_id.toString(), duracionHoras);
      // Agregar vuelo al historial de pasajeros con reservas confirmadas
      const reservas = await this.reservaService.listarReservasPorVuelo(id);

      // Por cada hora de vuelo se otorga 100 puntos
      const puntosPorVuelo = Math.floor(duracionHoras * 100);

      for (const reserva of reservas) {
        await this.userService.agregarPuntosYVueloAlHistorial(reserva.id_usuario.toString(), id, puntosPorVuelo);
      }
  
      // Agregar vuelo al historial de la tripulación
      await this.userService.agregarVueloAlHistorial(vuelo.tripulacion.piloto_id.toString(), id);
      await this.userService.agregarVueloAlHistorial(vuelo.tripulacion.copiloto_id.toString(), id);
      for (const sobrecargoId of vuelo.tripulacion.sobrecargos) {
        await this.userService.agregarVueloAlHistorial(sobrecargoId.toString(), id);
      }
    }

    res.json(vueloActualizado);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el estado del vuelo" });
  }
};
}