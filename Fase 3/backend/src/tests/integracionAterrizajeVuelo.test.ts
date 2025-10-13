import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { VueloService } from '../core/repository/services/VueloService';
import { UserService } from '../core/repository/services/UserService';
import { ReservaService } from '../core/repository/services/ReservaService';
import { AvionService } from '../core/repository/services/AvionService';
import { VueloController } from '../modules/flights/controllers/vueloController';
import { EstadoVuelo } from '../core/observer/observador';
import { AuthRequest } from '../types/auth-request';
import { tokenAuth } from '../middleware/authMiddleware';
import { ReservaFacade } from '../core/facade/ReservaFacade';
import { EstadoReserva } from '../types/reservas';

// Mock de dependencias
jest.mock('../core/repository/services/VueloService');
jest.mock('../core/repository/services/UserService');
jest.mock('../core/repository/services/ReservaService');
jest.mock('../core/repository/services/AvionService');
jest.mock('../core/facade/ReservaFacade');
jest.mock('../middleware/authMiddleware');

const app = express();
app.use(express.json());

// Usuario piloto mock
const mockPiloto = {
  _id: '507f1f77bcf86cd799439011',
  nombre: 'Carlos Piloto',
  correo: 'piloto@example.com',
  tipo: 'piloto',
  usuario: 'piloto123',
  horasVuelo: 1500,
  edad: 35,
  telefono: '1234567890',
  direccion: 'Av. Aviación 123',
  genero: 'Masculino',
  fecha_nacimiento: new Date('1989-05-15'),
  dpi: '1234567890123',
  vuelos: [],
} as any;

// Configurar secreto JWT
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'secreto';

// Endpoint de login simulado
app.post('/api/users/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (usuario === 'piloto123' && contrasena === '1234') {
    const token = jwt.sign(mockPiloto, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return res.status(200).json({ usuario: mockPiloto, token });
  }
  return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
});

// Instanciar servicios mockeados
const vueloService = new VueloService({} as any);
const userService = new UserService({} as any);
const avionService = new AvionService({} as any);
const reservaService = new ReservaService({} as any, userService);
const reservaFacade = new ReservaFacade(vueloService, avionService, reservaService);
const vueloController = new VueloController(
  vueloService,
  avionService,
  reservaService,
  userService,
  reservaFacade
);

// Endpoint bajo prueba
app.put(
  '/api/vuelos/:id',
  tokenAuth,
  vueloController.actualizarEstadoVuelo.bind(vueloController)
);

// Mock del middleware de autenticación
const mockTokenAuth = tokenAuth as jest.Mock;

describe('PUT /api/vuelos/:id - Aterrizaje de Vuelo', () => {
  const mockVueloId = new mongoose.Types.ObjectId().toString();
  const mockPilotoId = new mongoose.Types.ObjectId().toString();
  const mockCopilotoId = new mongoose.Types.ObjectId().toString();
  const mockSobrecargoId = new mongoose.Types.ObjectId().toString();
  const mockAvionId = new mongoose.Types.ObjectId().toString();
  const mockPasajeroId = new mongoose.Types.ObjectId().toString();

  const mockVuelo = {
    _id: new mongoose.Types.ObjectId(mockVueloId),
    origen: 'GUA',
    destino: 'MIA',
    fecha_salida: new Date('2025-10-13T08:00:00Z'),
    fecha_llegada: new Date('2025-10-13T12:00:00Z'), // 4 horas de vuelo
    aeronave: new mongoose.Types.ObjectId(mockAvionId),
    tripulacion: {
      piloto_id: new mongoose.Types.ObjectId(mockPilotoId),
      copiloto_id: new mongoose.Types.ObjectId(mockCopilotoId),
      sobrecargos: [new mongoose.Types.ObjectId(mockSobrecargoId)],
    },
    estado: EstadoVuelo.INICIADO,
    duracion: 240, // 4 horas en minutos
    numero_vuelo: 'AV101',
    capacidad: 180,
    fecha_checkin: new Date(),
    tiempoRetraso: 0,
  } as any;

  const mockVueloConRetraso = {
    ...mockVuelo,
    tiempoRetraso: 1.5, // 1.5 horas de retraso
  } as any;

  const mockReserva = {
    _id: new mongoose.Types.ObjectId(),
    id_usuario: new mongoose.Types.ObjectId(mockPasajeroId),
    id_vuelo: new mongoose.Types.ObjectId(mockVueloId),
    asientos_reservados: 1,
    asientos: ['12A'],
    fecha_reserva: new Date('2025-09-20T00:00:00Z'),
    estado: EstadoReserva.pendiente_abordaje,
    codigo_reserva: 'RSV-XYZ789',
    maletas: [],
    fecha_checkin: new Date(),
  } as any;

  const mockPasajero = {
    _id: mockPasajeroId,
    nombre: 'Ana Pasajera',
    correo: 'ana@example.com',
    tipo: 'pasajero',
    usuario: 'ana123',
    puntos: 500,
    vuelos: [],
  } as any;

  let token: string;

  beforeAll(async () => {
    const login = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'piloto123', contrasena: '1234' });
    token = login.body.token;
  });

  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configurar mock del middleware de autenticación
    mockTokenAuth.mockImplementation((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockPiloto;
      next();
    });
  });

  afterAll(async () => {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('debería aterrizar el vuelo exitosamente y sumar horas a piloto y copiloto', async () => {
    // Mock de servicios
    (vueloService.obtenerVuelo as jest.Mock).mockResolvedValue(mockVuelo);
    (vueloService.actualizarEstadoVuelo as jest.Mock).mockResolvedValue({
      ...mockVuelo,
      estado: EstadoVuelo.ATERRIZADO,
    });
    (reservaService.listarReservasPorVuelo as jest.Mock).mockResolvedValue([mockReserva]);
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(mockPasajero);
    (userService.sumarHorasVueloPiloto as jest.Mock).mockResolvedValue(null);
    (userService.agregarPuntosYVueloAlHistorial as jest.Mock).mockResolvedValue(null);
    (userService.agregarVueloAlHistorial as jest.Mock).mockResolvedValue(null);
    (reservaFacade.cambiarEstadoReserva as jest.Mock).mockResolvedValue({
      ...mockReserva,
      estado: EstadoReserva.abordado,
    });

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    // Calcular duración esperada (4 horas)
    const duracionMs = mockVuelo.fecha_llegada.getTime() - mockVuelo.fecha_salida.getTime();
    const duracionHoras = Math.round((duracionMs / (1000 * 60 * 60)) * 100) / 100;

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        estado: EstadoVuelo.ATERRIZADO,
      })
    );

    // Verificar que se actualizó el estado del vuelo
    expect(vueloService.obtenerVuelo).toHaveBeenCalledWith(mockVueloId);
    expect(vueloService.actualizarEstadoVuelo).toHaveBeenCalledWith(
      mockVueloId,
      EstadoVuelo.ATERRIZADO
    );

    // Verificar que se sumaron las horas al piloto y copiloto
    expect(userService.sumarHorasVueloPiloto).toHaveBeenCalledTimes(2);
    expect(userService.sumarHorasVueloPiloto).toHaveBeenCalledWith(
      mockPilotoId,
      duracionHoras
    );
    expect(userService.sumarHorasVueloPiloto).toHaveBeenCalledWith(
      mockCopilotoId,
      duracionHoras
    );

    // Verificar que se agregó el vuelo al historial de la tripulación
    expect(userService.agregarVueloAlHistorial).toHaveBeenCalledTimes(3);
    expect(userService.agregarVueloAlHistorial).toHaveBeenCalledWith(
      mockPilotoId,
      mockVueloId
    );
    expect(userService.agregarVueloAlHistorial).toHaveBeenCalledWith(
      mockCopilotoId,
      mockVueloId
    );
    expect(userService.agregarVueloAlHistorial).toHaveBeenCalledWith(
      mockSobrecargoId,
      mockVueloId
    );
  });

  it('debería sumar horas normales + horas de retraso al aterrizar', async () => {
    (vueloService.obtenerVuelo as jest.Mock).mockResolvedValue(mockVueloConRetraso);
    (vueloService.actualizarEstadoVuelo as jest.Mock).mockResolvedValue({
      ...mockVueloConRetraso,
      estado: EstadoVuelo.ATERRIZADO,
    });
    (reservaService.listarReservasPorVuelo as jest.Mock).mockResolvedValue([]);
    (userService.sumarHorasVueloPiloto as jest.Mock).mockResolvedValue(null);
    (userService.agregarVueloAlHistorial as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    // Calcular horas totales: normales (4) + retraso (1.5) = 5.5 horas
    const duracionMs = mockVueloConRetraso.fecha_llegada.getTime() - 
                       mockVueloConRetraso.fecha_salida.getTime();
    const duracionHoras = Math.round((duracionMs / (1000 * 60 * 60)) * 100) / 100;

    expect(response.status).toBe(200);
    
    // Verificar que se sumaron las horas correctas (normales, sin retraso en este endpoint)
    expect(userService.sumarHorasVueloPiloto).toHaveBeenCalledWith(
      mockPilotoId,
      duracionHoras
    );
    expect(userService.sumarHorasVueloPiloto).toHaveBeenCalledWith(
      mockCopilotoId,
      duracionHoras
    );
  });

  it('debería agregar puntos a los pasajeros al aterrizar', async () => {
    (vueloService.obtenerVuelo as jest.Mock).mockResolvedValue(mockVuelo);
    (vueloService.actualizarEstadoVuelo as jest.Mock).mockResolvedValue({
      ...mockVuelo,
      estado: EstadoVuelo.ATERRIZADO,
    });
    (reservaService.listarReservasPorVuelo as jest.Mock).mockResolvedValue([mockReserva]);
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(mockPasajero);
    (userService.sumarHorasVueloPiloto as jest.Mock).mockResolvedValue(null);
    (userService.agregarPuntosYVueloAlHistorial as jest.Mock).mockResolvedValue(null);
    (userService.agregarVueloAlHistorial as jest.Mock).mockResolvedValue(null);
    (reservaFacade.cambiarEstadoReserva as jest.Mock).mockResolvedValue({
      ...mockReserva,
      estado: EstadoReserva.abordado,
    });

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    // Calcular puntos (4 horas * 100 = 400 puntos)
    const duracionMs = mockVuelo.fecha_llegada.getTime() - mockVuelo.fecha_salida.getTime();
    const duracionHoras = Math.round((duracionMs / (1000 * 60 * 60)) * 100) / 100;
    const puntos = Math.floor(duracionHoras * 100);

    expect(response.status).toBe(200);
    
    // Verificar que se agregaron puntos al pasajero
    expect(userService.agregarPuntosYVueloAlHistorial).toHaveBeenCalledWith(
      mockPasajeroId,
      mockVueloId,
      puntos
    );

    // Verificar que se cambió el estado de la reserva
    expect(reservaFacade.cambiarEstadoReserva).toHaveBeenCalledWith(
      mockReserva._id.toString()
    );
  });

  it('debería devolver 404 si el vuelo no existe', async () => {
    (vueloService.obtenerVuelo as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Vuelo no encontrado');
    expect(vueloService.obtenerVuelo).toHaveBeenCalledWith(mockVueloId);
    expect(vueloService.actualizarEstadoVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si el estado es inválido', async () => {
    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: 'ESTADO_INVALIDO' });

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Estado inválido');
    expect(vueloService.obtenerVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si falta el estado', async () => {
    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Estado inválido');
    expect(vueloService.obtenerVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 401 si no se proporciona token', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response) => {
      return res.status(401).json({ message: 'Token no proporcionado' });
    });

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Token no proporcionado');
    expect(vueloService.obtenerVuelo).not.toHaveBeenCalled();
  });

  it('debería manejar múltiples pasajeros y sumar puntos a todos', async () => {
    const mockReserva2 = {
      ...mockReserva,
      _id: new mongoose.Types.ObjectId(),
      id_usuario: new mongoose.Types.ObjectId(),
      asientos: ['12B'],
    };

    const mockPasajero2 = {
      ...mockPasajero,
      _id: mockReserva2.id_usuario.toString(),
      nombre: 'Luis Pasajero',
      correo: 'luis@example.com',
    };

    (vueloService.obtenerVuelo as jest.Mock).mockResolvedValue(mockVuelo);
    (vueloService.actualizarEstadoVuelo as jest.Mock).mockResolvedValue({
      ...mockVuelo,
      estado: EstadoVuelo.ATERRIZADO,
    });
    (reservaService.listarReservasPorVuelo as jest.Mock).mockResolvedValue([
      mockReserva,
      mockReserva2,
    ]);
    (userService.obtenerUsuario as jest.Mock)
      .mockResolvedValueOnce(mockPasajero)
      .mockResolvedValueOnce(mockPasajero2);
    (userService.sumarHorasVueloPiloto as jest.Mock).mockResolvedValue(null);
    (userService.agregarPuntosYVueloAlHistorial as jest.Mock).mockResolvedValue(null);
    (userService.agregarVueloAlHistorial as jest.Mock).mockResolvedValue(null);
    (reservaFacade.cambiarEstadoReserva as jest.Mock).mockResolvedValue({
      ...mockReserva,
      estado: EstadoReserva.abordado,
    });

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    expect(response.status).toBe(200);
    
    // Verificar que se procesaron ambos pasajeros
    expect(userService.agregarPuntosYVueloAlHistorial).toHaveBeenCalledTimes(2);
    expect(reservaFacade.cambiarEstadoReserva).toHaveBeenCalledTimes(2);
  });

  it('debería devolver 500 si ocurre un error en el servidor', async () => {
    (vueloService.obtenerVuelo as jest.Mock).mockRejectedValue(
      new Error('Error de conexión a BD')
    );

    const response = await request(app)
      .put(`/api/vuelos/${mockVueloId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Error al actualizar el estado del vuelo');
    expect(vueloService.obtenerVuelo).toHaveBeenCalled();
  });
});