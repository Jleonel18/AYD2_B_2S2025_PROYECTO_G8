// src/tests/crearVuelo.test.ts
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { VueloService } from '../core/repository/services/VueloService';
import { AvionService } from '../core/repository/services/AvionService';
import { UserService } from '../core/repository/services/UserService';
import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../types/auth-request';
import { generarTokenVerificacion } from '../utils/utils';

// Mock de middlewares
jest.mock('../middleware/authMiddleware', () => ({
  tokenAuth: jest.fn().mockImplementation((req: AuthRequest, res: Response, next: NextFunction) => {
    req.user = {
      id: 'mock-id',
      usuario: 'mock-user',
      tipo: 'operaciones',
      nombre: 'Mock User',
      correo: 'mock@example.com',
    };
    next();
  }),
  authorizeRoles: jest.fn().mockImplementation(() => (req: Request, res: Response, next: NextFunction) => next()),
}));

// Mock de VueloService
jest.mock('../core/repository/services/VueloService', () => {
  const mockCrearVuelo = jest.fn();
  const mockVerificarDisponibilidadTrabajador = jest.fn();
  const mockVerificarDisponibilidadAvion = jest.fn();
  return {
    VueloService: jest.fn().mockImplementation(() => ({
      crearVuelo: mockCrearVuelo,
      verificarDisponibilidadTrabajador: mockVerificarDisponibilidadTrabajador,
      verificarDisponibilidadAvion: mockVerificarDisponibilidadAvion,
    })),
  };
});

// Mock de AvionService
jest.mock('../core/repository/services/AvionService', () => {
  const mockGetEstadoAvion = jest.fn();
  const mockAvionEstaEnAeropuerto = jest.fn();
  return {
    AvionService: jest.fn().mockImplementation(() => ({
      getEstadoAvion: mockGetEstadoAvion,
      avionEstaEnAeropuerto: mockAvionEstaEnAeropuerto,
    })),
  };
});

// Mock de UserService
jest.mock('../core/repository/services/UserService', () => {
  const mockObtenerUsuario = jest.fn();
  return {
    UserService: jest.fn().mockImplementation(() => ({
      obtenerUsuario: mockObtenerUsuario,
    })),
  };
});

// Obtenemos las referencias a los mocks
const mockCrearVuelo = jest.requireMock('../core/repository/services/VueloService').VueloService().crearVuelo;
const mockVerificarDisponibilidadTrabajador = jest.requireMock('../core/repository/services/VueloService').VueloService().verificarDisponibilidadTrabajador;
const mockVerificarDisponibilidadAvion = jest.requireMock('../core/repository/services/VueloService').VueloService().verificarDisponibilidadAvion;
const mockGetEstadoAvion = jest.requireMock('../core/repository/services/AvionService').AvionService().getEstadoAvion;
const mockAvionEstaEnAeropuerto = jest.requireMock('../core/repository/services/AvionService').AvionService().avionEstaEnAeropuerto;
const mockObtenerUsuario = jest.requireMock('../core/repository/services/UserService').UserService().obtenerUsuario;

// Cerrar conexiones después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/vuelos - Crear vuelo', () => {
  const ruta = '/api/vuelos';
  const mockToken = generarTokenVerificacion();
  // IDs válidos mockeados (24 caracteres hexadecimales)
  const mockId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    mockCrearVuelo.mockReset();
    mockVerificarDisponibilidadTrabajador.mockReset();
    mockVerificarDisponibilidadAvion.mockReset();
    mockGetEstadoAvion.mockReset();
    mockAvionEstaEnAeropuerto.mockReset();
    mockObtenerUsuario.mockReset();

    // Configuración base para todas las pruebas
    mockGetEstadoAvion.mockResolvedValue('Disponible');
    mockAvionEstaEnAeropuerto.mockResolvedValue(true);
  });

  test('debe devolver 400 si faltan datos requeridos', async () => {
    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({ origen: mockId, destino: mockId, fecha_salida: '2025-10-01', fecha_llegada: '2025-10-02' });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Faltan datos requeridos/i);
  });

  test('debe devolver 400 si las fechas son inválidas', async () => {
    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        origen: mockId,
        destino: mockId,
        fecha_salida: '2025-10-02',
        fecha_llegada: '2025-10-01',
        aeronave: mockId,
        tripulacion: { piloto_id: mockId, copiloto_id: mockId },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/Fechas inválidas/i);
  });

  test('debe devolver 400 si el piloto no está disponible', async () => {
    mockVerificarDisponibilidadTrabajador.mockResolvedValueOnce(false); // Piloto no disponible
    mockVerificarDisponibilidadAvion.mockResolvedValueOnce(true);
    mockCrearVuelo.mockResolvedValueOnce({ _id: mockId, estado: 'PLANIFICADO' }); // Simula creación

    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        origen: mockId,
        destino: mockId,
        fecha_salida: '2025-10-01',
        fecha_llegada: '2025-10-02',
        aeronave: mockId,
        tripulacion: { piloto_id: mockId, copiloto_id: mockId },
      });

    expect(response.status).toBe(400);
    expect(response.body.error).toMatch(/El piloto ya tiene un vuelo asignado/i);
  });

  test('debe devolver 201 si el vuelo se crea exitosamente', async () => {
    mockVerificarDisponibilidadTrabajador
      .mockResolvedValueOnce(true)
      .mockResolvedValueOnce(true); // Ambos tripulantes disponibles
    mockVerificarDisponibilidadAvion.mockResolvedValueOnce(true);
    mockCrearVuelo.mockResolvedValueOnce({ _id: mockId, estado: 'PLANIFICADO' });

    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        origen: mockId,
        destino: mockId,
        fecha_salida: '2025-10-01',
        fecha_llegada: '2025-10-02',
        aeronave: mockId,
        tripulacion: { piloto_id: mockId, copiloto_id: mockId },
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('_id');
    expect(response.body.estado).toBe('PLANIFICADO');
  });

  test('debe devolver 500 si ocurre un error en el servidor', async () => {
    mockVerificarDisponibilidadTrabajador.mockImplementation(() => {
      throw new Error('Error interno del servidor'); // Error genérico
    });
    mockVerificarDisponibilidadAvion.mockResolvedValueOnce(true);

    const response = await request(app)
      .post(ruta)
      .set('Authorization', `Bearer ${mockToken}`)
      .send({
        origen: mockId,
        destino: mockId,
        fecha_salida: '2025-10-01',
        fecha_llegada: '2025-10-02',
        aeronave: mockId,
        tripulacion: { piloto_id: mockId, copiloto_id: mockId },
      });

    expect(response.status).toBe(500);
    expect(response.body.error).toMatch(/Error interno en el servidor/i);
  });
});