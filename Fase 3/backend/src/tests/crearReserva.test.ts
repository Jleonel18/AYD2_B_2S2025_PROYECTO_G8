// src/tests/crearReserva.test.ts
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth-request';
import { EstadoReserva } from '../types/reservas.js';

// Increase timeout for the suite
jest.setTimeout(40000); // 40 segundos

// Crear una instancia del servidor para controlarlo
let server: any;

// Mock de middlewares
jest.mock('../middleware/authMiddleware', () => ({
  tokenAuth: jest.fn().mockImplementation((req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    next();
  }),
  authorizeRoles: jest.fn().mockImplementation(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

// Mock de ReservaFacade
jest.mock('../core/facade/ReservaFacade', () => {
  const getMockIReserva = () => ({
    _id: { toString: () => 'mock-reserva-id' },
    id_usuario: 'mock-user-id',
    id_vuelo: 'mock-flight-id',
    asientos: ['1A'],
    estado: EstadoReserva.pendiente_checkin,
    codigo_reserva: 'RSV-MOCK',
    fecha_reserva: new Date(),
  });

  return {
    ReservaFacade: jest.fn().mockImplementation(() => ({
      crearReserva: jest.fn().mockImplementation(async (reserva: any) => {
        if (!reserva.id_vuelo || !reserva.asiento) {
          throw new Error('Faltan datos requeridos');
        }
        const vueloService = new (jest.requireMock('../core/repository/services/VueloService').VueloService)();
        const avionService = new (jest.requireMock('../core/repository/services/AvionService').AvionService)();
        const reservaService = new (jest.requireMock('../core/repository/services/ReservaService').ReservaService)();

        const vueloExiste = await vueloService.obtenerVuelo(reserva.id_vuelo.toString());
        if (!vueloExiste) {
          throw new Error('El vuelo no existe');
        }

        const avionExiste = { _id: { toString: () => 'mock-avion-id' }, capacidadMaxima: 200 };
        if (!avionExiste) {
          throw new Error('El avión asociado al vuelo no existe');
        }

        const reservasExistentes: ReturnType<typeof getMockIReserva>[] = await reservaService.listarReservasPorVuelo(vueloExiste._id.toString());
        const reservasActivas = reservasExistentes.filter((r: ReturnType<typeof getMockIReserva>) => r.estado !== EstadoReserva.cancelada);
        const asientosReservados = reservasActivas.flatMap((r: ReturnType<typeof getMockIReserva>) => r.asientos || []);

        const conflicto = (reserva.asientos || [reserva.asiento]).filter((asiento: string) => asientosReservados.includes(asiento));
        if (conflicto.length > 0) {
          throw new Error(`Los asientos ${conflicto.join(', ')} ya están reservados para este vuelo`);
        }

        const totalAsientosReservados = reservasExistentes.reduce((acc: number, r: ReturnType<typeof getMockIReserva>) => acc + (r.asientos?.length || 1), 0);
        if (totalAsientosReservados + (reserva.asientos?.length || 1) > avionExiste.capacidadMaxima) {
          throw new Error('No hay suficientes asientos disponibles en el avión para esta reserva');
        }

        reserva.codigo_reserva = 'RSV-' + Math.random().toString(36).substring(2, 8).toUpperCase();
        reserva.fecha_reserva = new Date();
        reserva.estado = EstadoReserva.pendiente_checkin;

        return await reservaService.crearReserva(reserva);
      }),
      obtenerReserva: jest.fn(),
      listarReservasPorUsuario: jest.fn(),
      eliminarReserva: jest.fn(),
      listarReservasPorVuelo: jest.fn(),
      hacerCheckIn: jest.fn(),
      cambiarEstadoReserva: jest.fn(),
      obtenerAsientosReservados: jest.fn(),
    }))
  };
});

// Mock de ReservaService
jest.mock('../core/repository/services/ReservaService', () => ({
  ReservaService: jest.fn().mockImplementation(() => ({
    crearReserva: jest.fn().mockImplementation(async (reserva: any) => {
      return {
        _id: { toString: () => 'mock-reserva-id' },
        id_usuario: reserva.id_usuario,
        id_vuelo: reserva.id_vuelo,
        asientos: reserva.asientos || [reserva.asiento],
        estado: reserva.estado,
        codigo_reserva: reserva.codigo_reserva,
        fecha_reserva: reserva.fecha_reserva,
      };
    }),
    listarReservasPorVuelo: jest.fn().mockResolvedValue([]),
  })),
}));

// Mock de VueloService
jest.mock('../core/repository/services/VueloService', () => ({
  VueloService: jest.fn().mockImplementation(() => ({
    obtenerVuelo: jest.fn().mockImplementation(async (id: string) => {
      if (id === '507f1f77bcf86cd799439011') {
        return { _id: { toString: () => id }, aeronave: { toString: () => 'mock-avion-id' }, estado: 'PLANIFICADO' };
      }
      return null;
    }),
  })),
}));

// Mock de AvionService
jest.mock('../core/repository/services/AvionService', () => ({
  AvionService: jest.fn().mockImplementation(() => ({
    getAvionById: jest.fn().mockImplementation(async (id: string) => {
      if (id === 'mock-avion-id') {
        return { _id: { toString: () => id }, capacidadMaxima: 200 };
      }
      return null;
    }),
  })),
}));

// Mock de UserService
jest.mock('../core/repository/services/UserService', () => ({
  UserService: jest.fn().mockImplementation(() => ({
    obtenerUsuario: jest.fn().mockImplementation(async (id: string) => {
      if (id === '507f1f77bcf86cd799439011') {
        return { _id: { toString: () => id }, nombre: 'Juan Pérez', correo: 'juan@example.com' };
      }
      return null;
    }),
  })),
}));

// Mock de utilidades externas
jest.mock('../utils/qr', () => ({
  generarCodigoQR: jest.fn().mockResolvedValue('mock-qr-code'),
}));
jest.mock('../utils/send_email', () => ({
  enviarCorreoReservaEstado: jest.fn().mockResolvedValue(undefined),
  enviarCorreoCancelacion: jest.fn().mockResolvedValue(undefined),
}));

// Obtenemos las referencias a los mocks
const mockTokenAuth = jest.requireMock('../middleware/authMiddleware').tokenAuth as jest.Mock;
const mockCrearReservaFacade = jest.requireMock('../core/facade/ReservaFacade').ReservaFacade().crearReserva;
const mockObtenerUsuario = jest.requireMock('../core/repository/services/UserService').UserService().obtenerUsuario;
const mockObtenerVuelo = jest.requireMock('../core/repository/services/VueloService').VueloService().obtenerVuelo;
const { generarCodigoQR } = jest.requireMock('../utils/qr');
const { enviarCorreoReservaEstado } = jest.requireMock('../utils/send_email');

// Iniciar y detener el servidor
beforeAll((done) => {
  server = app.listen(0, done); // Puerto dinámico
});

afterEach(async () => {
  await new Promise(resolve => setTimeout(resolve, 100)); // Limpieza de handles
});

afterAll(async () => {
  if (server) {
    await new Promise(resolve => server.close(resolve)); // Cierre del servidor
  }
  await mongoose.connection.close(); // Cierre de la conexión a Mongoose
});

describe('POST /api/reservas - Crear reserva', () => {
  const ruta = '/api/reservas';
  const mockToken = 'mock-token';
  const mockUserId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    mockTokenAuth.mockReset();
    mockCrearReservaFacade.mockReset();
    mockObtenerUsuario.mockReset();
    mockObtenerVuelo.mockReset();
    generarCodigoQR.mockReset();
    enviarCorreoReservaEstado.mockReset();
    jest.clearAllMocks();
  });

  test('debe devolver 500 si faltan datos requeridos', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = { id: mockUserId, usuario: 'user', tipo: 'pasajero', nombre: 'Juan', correo: 'juan@example.com' };
      next();
    });

    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({});

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('Faltan datos requeridos');
  });

  test('debe devolver 500 si falla la obtención del usuario', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = { id: 'invalid-user-id', usuario: 'user', tipo: 'pasajero', nombre: 'Juan', correo: 'juan@example.com' };
      next();
    });

    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ id_vuelo: mockUserId, asiento: '1A' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('El usuario asociado a la reserva no existe');
  });

  test('debe devolver 500 si el vuelo no existe', async () => {
    mockTokenAuth.mockImplementationOnce((req: AuthRequest, res: Response, next: NextFunction) => {
      req.user = { id: mockUserId, usuario: 'user', tipo: 'pasajero', nombre: 'Juan', correo: 'juan@example.com' };
      next();
    });

    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ id_vuelo: 'invalid-flight-id', asiento: '1A' });

    expect(response.status).toBe(500);
    expect(response.body.error).toBe('El vuelo no existe');
  });
});