import request from 'supertest';
import express, { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { VueloService } from '../core/repository/services/VueloService';
import { UserService } from '../core/repository/services/UserService';
import { ReservaService } from '../core/repository/services/ReservaService';
import { VueloController } from '../modules/flights/controllers/vueloController';
import { EstadoVuelo } from '../../src/core/observer/observador';
import { AuthRequest } from '../types/auth-request';
import { tokenAuth, authorizeRoles } from '../middleware/authMiddleware';
import { UserRepository } from '../core/repository/repositories/UserRepository';
import { ReservaRepository } from '../core/repository/repositories/ReservaRepository';
import { VueloRepository } from '../core/repository/repositories/VueloRepository';
import { AvionRepository } from '../core/repository/repositories/AvionRepository';
import { AvionService } from '../core/repository/services/AvionService';
import { ReservaFacade } from '../core/facade/ReservaFacade';
import { EstadoReserva } from '../../src/types/reservas';

// Mock de dependencias
jest.mock('../core/repository/services/VueloService');
jest.mock('../core/repository/services/UserService');
jest.mock('../core/repository/services/ReservaService');
jest.mock('../core/facade/ReservaFacade');
jest.mock('../middleware/authMiddleware', () => ({
  tokenAuth: jest.fn(),
  authorizeRoles: jest.fn(),
}));

const app = express();
app.use(express.json());

// Simular el endpoint de login
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  nombre: 'Piloto Pérez',
  correo: 'piloto@example.com',
  tipo: 'piloto',
  usuario: 'piloto',
  edad: 35,
  telefono: '1234567890',
  direccion: 'Calle Falsa 123',
  genero: 'Masculino',
  fecha_nacimiento: new Date('1989-01-01'),
  dpi: '1234567890123',
  horasVuelo: 1000,
  vuelos: [],
} as any;

app.post('/api/users/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (!usuario || !contrasena) {
    return res.status(400).json({ message: 'Faltan datos' });
  }
  if (usuario === 'piloto' && contrasena === '1234') {
    const token = jwt.sign(mockUser, 'secreto', { expiresIn: '1h' });
    return res.status(200).json({
      usuario: mockUser,
      token,
    });
  }
  return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
});

// Instanciar dependencias mockeadas
const vueloRepository = new VueloRepository();
const userRepository = new UserRepository();
const avionRepository = new AvionRepository();
const vueloService = new VueloService(vueloRepository);
const userService = new UserService(userRepository);
const avionService = new AvionService(avionRepository);
const reservaRepository = new ReservaRepository();
const reservaService = new ReservaService(reservaRepository, userService);
const reservaFacade = new ReservaFacade(vueloService, avionService, reservaService);
const vueloController = new VueloController(vueloService, avionService, reservaService, userService, reservaFacade);

// Configurar el endpoint de actualizar estado con los middlewares reales
app.put('/api/vuelos/:id', tokenAuth, vueloController.actualizarEstadoVuelo.bind(vueloController));

// Mock de middlewares
const mockTokenAuth = tokenAuth as jest.Mock;
const mockAuthorizeRoles = authorizeRoles as jest.Mock;

// Mock de servicios
const mockObtenerVuelo = jest.spyOn(vueloService, 'obtenerVuelo');
const mockActualizarEstadoVuelo = jest.spyOn(vueloService, 'actualizarEstadoVuelo');
const mockSumarHorasVueloPiloto = jest.spyOn(userService, 'sumarHorasVueloPiloto');
const mockAgregarPuntosYVueloAlHistorial = jest.spyOn(userService, 'agregarPuntosYVueloAlHistorial');
const mockAgregarVueloAlHistorial = jest.spyOn(userService, 'agregarVueloAlHistorial');
const mockListarReservasPorVuelo = jest.spyOn(reservaService, 'listarReservasPorVuelo');
const mockCambiarEstadoReserva = jest.spyOn(reservaFacade, 'cambiarEstadoReserva');
const mockObtenerUsuario = jest.spyOn(userService, 'obtenerUsuario');


describe('PUT /api/vuelos/:id - Actualizar estado de vuelo', () => {
  const ruta = '/api/vuelos';
  const mockVueloId = '507f1f77bcf86cd799439011';
  const mockPilotoId = '507f1f77bcf86cd799439012';
  const mockCopilotoId = '507f1f77bcf86cd799439013';
  const mockSobrecargoId = '507f1f77bcf86cd799439014';
  const mockPasajeroId = '507f1f77bcf86cd799439015';
  const mockAvionId = '507f1f77bcf86cd799439016';

  const mockVuelo = {
    _id: new mongoose.Types.ObjectId(mockVueloId),
    origen: 'MEX',
    destino: 'JFK',
    fecha_salida: new Date('2025-10-01T10:00:00Z'),
    fecha_llegada: new Date('2025-10-01T12:00:00Z'),
    aeronave: new mongoose.Types.ObjectId(mockAvionId),
    tripulacion: {
      piloto_id: new mongoose.Types.ObjectId(mockPilotoId),
      copiloto_id: new mongoose.Types.ObjectId(mockCopilotoId),
      sobrecargos: [new mongoose.Types.ObjectId(mockSobrecargoId)],
    },
    estado: EstadoVuelo.EN_TIEMPO,
    duracion: 120, // Duración en minutos
    numero_vuelo: 'AM123',
    capacidad: 200,
    fecha_checkin: new Date(),
  } as any;

  const mockReserva = {
    _id: new mongoose.Types.ObjectId(),
    id_usuario: new mongoose.Types.ObjectId(mockPasajeroId),
    id_vuelo: new mongoose.Types.ObjectId(mockVueloId),
    asientos_reservados: 1,
    asientos: ['1A'],
    fecha_reserva: new Date('2025-09-01T00:00:00Z'),
    estado: EstadoReserva.pendiente_abordaje,
    codigo_reserva: 'RSV-ABC123',
    maletas: [],
    fecha_checkin: new Date(),
  } as any;

  const mockReservaActualizada = {
    ...mockReserva,
    _id: mockReserva._id.toString(),
    id_usuario: mockPasajeroId,
    id_vuelo: mockVueloId,
    estado: EstadoReserva.abordado,
  };

  const mockUsuario = {
    _id: mockPasajeroId,
    nombre: 'Pasajero Prueba',
    correo: 'pasajero@example.com',
    tipo: 'pasajero',
    usuario: 'pasajero1',
    edad: 30,
    telefono: '9876543210',
    direccion: 'Avenida Siempre Viva 456',
    genero: 'Femenino',
    fecha_nacimiento: new Date('1995-01-01'),
    dpi: '9876543210987',
    puntos: 0,
    vuelos: [],
    pasaporte: {
      numero: 'ABC123456',
      fecha_vencimiento: new Date('2030-01-01'),
      pais_emision: 'Mexico',
    },
    verificacion_email: true,
  } as any;

  beforeEach(() => {
    jest.clearAllMocks();
    mockTokenAuth.mockImplementation((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });
    mockAuthorizeRoles.mockImplementation(() => (req: Request, res: Response, next: NextFunction) => next());
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  test('debe devolver 400 si el estado es inválido', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });

    const response = await request(app)
      .put(`${ruta}/${mockVueloId}`)
      .set('Authorization', `Bearer mock-token`)
      .send({ estado: 'INVALIDO' });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Estado inválido. Solo se permite 'Iniciado', 'Cancelado', 'Retrasado' o 'Aterrizado'");
    expect(mockObtenerVuelo).not.toHaveBeenCalled();
  });

  test('debe devolver 400 si falta el estado', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });

    const response = await request(app)
      .put(`${ruta}/${mockVueloId}`)
      .set('Authorization', `Bearer mock-token`)
      .send({});

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Estado inválido. Solo se permite 'Iniciado', 'Cancelado', 'Retrasado' o 'Aterrizado'");
    expect(mockObtenerVuelo).not.toHaveBeenCalled();
  });

  test('debe devolver 404 si el vuelo no existe', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });

    mockObtenerVuelo.mockResolvedValueOnce(null);

    const response = await request(app)
      .put(`${ruta}/${mockVueloId}`)
      .set('Authorization', `Bearer mock-token`)
      .send({ estado: EstadoVuelo.INICIADO });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Vuelo no encontrado');
    expect(mockObtenerVuelo).toHaveBeenCalledWith(mockVueloId);
    expect(mockActualizarEstadoVuelo).not.toHaveBeenCalled();
  });

  test('debe actualizar el estado exitosamente sin horas de vuelo si no es ATERRIZADO', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });

    mockObtenerVuelo.mockResolvedValueOnce(mockVuelo);
    mockActualizarEstadoVuelo.mockResolvedValueOnce({ ...mockVuelo, estado: EstadoVuelo.INICIADO });

    const response = await request(app)
      .put(`${ruta}/${mockVueloId}`)
      .set('Authorization', `Bearer mock-token`)
      .send({ estado: EstadoVuelo.INICIADO });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ estado: EstadoVuelo.INICIADO }));
    expect(mockObtenerVuelo).toHaveBeenCalledWith(mockVueloId);
    expect(mockActualizarEstadoVuelo).toHaveBeenCalledWith(mockVueloId, EstadoVuelo.INICIADO);
    expect(mockSumarHorasVueloPiloto).not.toHaveBeenCalled();
    expect(mockAgregarPuntosYVueloAlHistorial).not.toHaveBeenCalled();
    expect(mockAgregarVueloAlHistorial).not.toHaveBeenCalled();
  });

  test('debe actualizar el estado a ATERRIZADO y sumar horas de vuelo', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });

    const vueloForResponse = {
      ...mockVuelo,
      _id: mockVueloId,
      aeronave: mockAvionId,
      tripulacion: {
        piloto_id: mockPilotoId,
        copiloto_id: mockCopilotoId,
        sobrecargos: [mockSobrecargoId],
      },
      estado: EstadoVuelo.ATERRIZADO,
    };

    mockObtenerVuelo.mockResolvedValueOnce(mockVuelo);
    mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloForResponse);
    mockListarReservasPorVuelo.mockResolvedValueOnce([
      {
        ...mockReserva,
        id_usuario: mockPasajeroId,
        id_vuelo: mockVueloId,
      },
    ]);
    mockSumarHorasVueloPiloto.mockResolvedValueOnce(null);
    mockAgregarPuntosYVueloAlHistorial.mockResolvedValueOnce(null);
    mockAgregarVueloAlHistorial.mockResolvedValueOnce(null);
    mockCambiarEstadoReserva.mockResolvedValueOnce(mockReservaActualizada);
    mockObtenerUsuario.mockResolvedValueOnce(mockUsuario);
    //generarCodigoQR.mockResolvedValueOnce('mocked-qr-code');
    //enviarCorreoReservaEstado.mockResolvedValueOnce(undefined);

    const response = await request(app)
      .put(`${ruta}/${mockVueloId}`)
      .set('Authorization', `Bearer mock-token`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    console.log('Respuesta:', response.body);

    const duracionMs = mockVuelo.fecha_llegada.getTime() - mockVuelo.fecha_salida.getTime();
    const duracionHoras = Math.round((duracionMs / (1000 * 60 * 60)) * 100) / 100;
    const puntosPorVuelo = Math.floor(duracionHoras * 100);

    expect(response.status).toBe(200);
    expect(response.body).toEqual(expect.objectContaining({ estado: EstadoVuelo.ATERRIZADO }));
    expect(mockObtenerVuelo).toHaveBeenCalledWith(mockVueloId);
    expect(mockActualizarEstadoVuelo).toHaveBeenCalledWith(mockVueloId, EstadoVuelo.ATERRIZADO);
    expect(mockSumarHorasVueloPiloto).toHaveBeenCalledTimes(2);
    expect(mockSumarHorasVueloPiloto).toHaveBeenCalledWith(mockPilotoId, duracionHoras);
    expect(mockSumarHorasVueloPiloto).toHaveBeenCalledWith(mockCopilotoId, duracionHoras);
    expect(mockListarReservasPorVuelo).toHaveBeenCalledWith(mockVueloId);
    // expect(mockCambiarEstadoReserva).toHaveBeenCalledWith(mockReserva._id.toString());
    // expect(mockObtenerUsuario).toHaveBeenCalledWith(mockPasajeroId);
    expect(mockAgregarPuntosYVueloAlHistorial).toHaveBeenCalledWith(mockPasajeroId, mockVueloId, puntosPorVuelo);
    expect(mockAgregarVueloAlHistorial).toHaveBeenCalledTimes(3);
    expect(mockAgregarVueloAlHistorial).toHaveBeenCalledWith(mockPilotoId, mockVueloId);
    expect(mockAgregarVueloAlHistorial).toHaveBeenCalledWith(mockCopilotoId, mockVueloId);
    expect(mockAgregarVueloAlHistorial).toHaveBeenCalledWith(mockSobrecargoId, mockVueloId);
  });

  test('debe devolver 404 si el vuelo no existe en ATERRIZADO', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = mockUser;
      next();
    });

    mockObtenerVuelo.mockResolvedValueOnce(null);

    const response = await request(app)
      .put(`${ruta}/${mockVueloId}`)
      .set('Authorization', `Bearer mock-token`)
      .send({ estado: EstadoVuelo.ATERRIZADO });

    expect(response.status).toBe(404);
    expect(response.body.error).toBe('Vuelo no encontrado');
    expect(mockObtenerVuelo).toHaveBeenCalledWith(mockVueloId);
    expect(mockActualizarEstadoVuelo).not.toHaveBeenCalled();
  });
});