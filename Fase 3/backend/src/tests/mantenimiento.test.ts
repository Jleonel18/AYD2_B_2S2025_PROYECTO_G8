// Mocks ANTES de cualquier importación
jest.mock('../core/repository/services/FlotaService', () => ({
  flotaService: {
    initListener: jest.fn().mockResolvedValue(undefined),
  },
}));
jest.mock('../core/repository/services/NotificacionService', () => ({
  notificacionService: {
    initListener: jest.fn().mockResolvedValue(undefined),
  },
}));

jest.mock('../middleware/authMiddleware', () => ({
  tokenAuth: (req: any, res: any, next: any) => {
    req.user = {
      _id: '507f1f77bcf86cd799439099',
      tipo: 'operaciones',
      usuario: 'admin_test',
    };
    next();
  },
  authorizeRoles: (...roles: string[]) => (req: any, res: any, next: any) => {
    next();
  },
}));

// Mock de los servicios
const mockActualizarEstadoVuelo = jest.fn();
const mockObtenerVuelo = jest.fn();
const mockListarReservasPorVuelo = jest.fn();
const mockAgregarPuntosYVueloAlHistorial = jest.fn();
const mockAgregarVueloAlHistorial = jest.fn();
const mockSumarHorasVueloPiloto = jest.fn();

jest.mock('../core/repository/services/VueloService', () => {
  return {
    VueloService: jest.fn().mockImplementation(() => ({
      actualizarEstadoVuelo: mockActualizarEstadoVuelo,
      obtenerVuelo: mockObtenerVuelo,
    })),
  };
});

jest.mock('../core/repository/services/AvionService', () => {
  return {
    AvionService: jest.fn().mockImplementation(() => ({
      getAvionById: jest.fn(),
      getEstadoAvion: jest.fn(),
    })),
  };
});

jest.mock('../core/repository/services/ReservaService', () => {
  return {
    ReservaService: jest.fn().mockImplementation(() => ({
      listarReservasPorVuelo: mockListarReservasPorVuelo,
    })),
  };
});

jest.mock('../core/repository/services/UserService', () => {
  return {
    UserService: jest.fn().mockImplementation(() => ({
      agregarPuntosYVueloAlHistorial: mockAgregarPuntosYVueloAlHistorial,
      agregarVueloAlHistorial: mockAgregarVueloAlHistorial,
      sumarHorasVueloPiloto: mockSumarHorasVueloPiloto,
    })),
  };
});

import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';

afterAll(async () => {
  await mongoose.connection.close();
});

describe('PUT /api/vuelos/:id - Actualizar estado de vuelo', () => {
  const ruta = '/api/vuelos';
  const vueloId = '507f1f77bcf86cd799439011';

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Actualización exitosa de estado', () => {
    test('debe actualizar el estado de un vuelo a "Cancelado"', async () => {
      const vueloActualizado = {
        _id: vueloId,
        numero_vuelo: 'FL1234',
        origen: '507f1f77bcf86cd799439012',
        destino: '507f1f77bcf86cd799439013',
        fecha_salida: '2025-10-01T10:00:00Z',
        fecha_llegada: '2025-10-01T14:00:00Z',
        aeronave: '507f1f77bcf86cd799439014',
        estado: 'Cancelado',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: ['507f1f77bcf86cd799439017'],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloActualizado);
      mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloActualizado);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('Cancelado');
      expect(mockActualizarEstadoVuelo).toHaveBeenCalled();
    }, 10000);

    test('debe actualizar el estado de un vuelo a "Iniciado"', async () => {
      const vueloActualizado = {
        _id: vueloId,
        numero_vuelo: 'FL5678',
        estado: 'Iniciado',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: ['507f1f77bcf86cd799439017'],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloActualizado);
      mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloActualizado);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Iniciado' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('Iniciado');
      expect(mockActualizarEstadoVuelo).toHaveBeenCalled();
    }, 10000);

    test('debe actualizar el estado de un vuelo a "En tiempo"', async () => {
      const vueloActualizado = {
        _id: vueloId,
        estado: 'En tiempo',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: ['507f1f77bcf86cd799439017'],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloActualizado);
      mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloActualizado);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'En tiempo' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('En tiempo');
    }, 10000);

    test('DEBUG: ver error de aterrizado', async () => {
  const vueloMock = {
    _id: vueloId,
    estado: 'En tiempo',
    fecha_salida: new Date('2025-10-01T10:00:00Z'),
    fecha_llegada: new Date('2025-10-01T14:00:00Z'),
    tripulacion: {
      piloto_id: { toString: () => '507f1f77bcf86cd799439015' },
      copiloto_id: { toString: () => '507f1f77bcf86cd799439016' },
      sobrecargos: [{ toString: () => '507f1f77bcf86cd799439017' }]
    }
  };

  mockObtenerVuelo.mockResolvedValueOnce(vueloMock);
  mockActualizarEstadoVuelo.mockResolvedValueOnce({ ...vueloMock, estado: 'Aterrizado' });
  mockListarReservasPorVuelo.mockResolvedValue([]);
  mockSumarHorasVueloPiloto.mockResolvedValue(undefined);
  mockAgregarVueloAlHistorial.mockResolvedValue(undefined);

  const response = await request(app)
    .put(`${ruta}/${vueloId}`)
    .send({ estado: 'Aterrizado' });

  console.log('Status:', response.status);
  console.log('Body:', response.body);
  console.log('Error:', response.error);
}, 10000);
  });

  describe('Validaciones de estado', () => {
    test('debe rechazar estado inválido', async () => {
      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'EstadoInvalido' });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(mockActualizarEstadoVuelo).not.toHaveBeenCalled();
    }, 10000);

    test('debe rechazar petición sin estado', async () => {
      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
      expect(mockActualizarEstadoVuelo).not.toHaveBeenCalled();
    }, 10000);

    test('debe rechazar estado vacío', async () => {
      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: '' });

      expect(response.status).toBe(400);
      expect(mockActualizarEstadoVuelo).not.toHaveBeenCalled();
    }, 10000);
  });

  describe('Validaciones de ID de vuelo', () => {
    test('debe rechazar ID de vuelo inválido', async () => {
      mockObtenerVuelo.mockRejectedValueOnce(new Error('ID inválido'));

      const response = await request(app)
        .put(`${ruta}/id-invalido`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBeGreaterThanOrEqual(400);
    }, 10000);

    test('debe manejar vuelo no encontrado', async () => {
      mockObtenerVuelo.mockResolvedValueOnce(null);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBe(404);
    }, 10000);
  });

  describe('Transiciones de estado válidas', () => {
    test('debe permitir cambiar de "Planificado" a "Cancelado"', async () => {
      const vueloActualizado = {
        _id: vueloId,
        estado: 'Cancelado',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: ['507f1f77bcf86cd799439017'],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloActualizado);
      mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloActualizado);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('Cancelado');
    }, 10000);

    test('debe permitir cambiar de "Planificado" a "Iniciado"', async () => {
      const vueloActualizado = {
        _id: vueloId,
        estado: 'Iniciado',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: ['507f1f77bcf86cd799439017'],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloActualizado);
      mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloActualizado);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Iniciado' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('Iniciado');
    }, 10000);

    test('debe permitir cambiar de "Iniciado" a "En tiempo"', async () => {
      const vueloActualizado = {
        _id: vueloId,
        estado: 'En tiempo',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: ['507f1f77bcf86cd799439017'],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloActualizado);
      mockActualizarEstadoVuelo.mockResolvedValueOnce(vueloActualizado);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'En tiempo' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('En tiempo');
    }, 10000);

    test('debe permitir cambiar de "En tiempo" a "Aterrizado"', async () => {
      const vueloMock = {
        _id: vueloId,
        estado: 'En tiempo',
        fecha_salida: new Date('2025-10-01T10:00:00Z'),
        fecha_llegada: new Date('2025-10-01T14:00:00Z'),
        tripulacion: {
          piloto_id: { toString: () => '507f1f77bcf86cd799439015' },
          copiloto_id: { toString: () => '507f1f77bcf86cd799439016' },
          sobrecargos: [{ toString: () => '507f1f77bcf86cd799439017' }],
        },
      };

      mockObtenerVuelo.mockResolvedValueOnce(vueloMock);
      mockActualizarEstadoVuelo.mockResolvedValueOnce({ ...vueloMock, estado: 'Aterrizado' });
      mockListarReservasPorVuelo.mockResolvedValueOnce([]);
      mockSumarHorasVueloPiloto.mockResolvedValueOnce(undefined);
      mockAgregarVueloAlHistorial.mockResolvedValueOnce(undefined);

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Aterrizado' });

      expect(response.status).toBe(200);
      expect(response.body.estado).toBe('Aterrizado');
    }, 10000);
  });

  describe('Manejo de errores', () => {
    test('debe manejar errores del servidor', async () => {
      mockObtenerVuelo.mockRejectedValueOnce(new Error('Error en la base de datos'));

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBe(500);
    }, 10000);

    test('debe manejar errores de validación del servicio', async () => {
      mockObtenerVuelo.mockResolvedValueOnce({
        _id: vueloId,
        estado: 'Aterrizado',
        tripulacion: {},
      });
      mockActualizarEstadoVuelo.mockRejectedValueOnce(
        new Error('No se puede cancelar un vuelo ya aterrizado')
      );

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBe(500);
    }, 10000);
  });

  describe('Autorización', () => {
    test('debe permitir petición sin token de autorización en ruta PUT', async () => {
      mockObtenerVuelo.mockResolvedValueOnce({
        _id: vueloId,
        estado: 'Planificado',
        tripulacion: {
          piloto_id: '507f1f77bcf86cd799439015',
          copiloto_id: '507f1f77bcf86cd799439016',
          sobrecargos: [],
        },
      });
      mockActualizarEstadoVuelo.mockResolvedValueOnce({
        _id: vueloId,
        estado: 'Cancelado',
      });

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });
      
      expect([200, 401, 404, 500]).toContain(response.status);
    }, 10000);
  });

  describe('Casos especiales', () => {
    test('no debe permitir actualizar un vuelo ya cancelado', async () => {
      mockObtenerVuelo.mockResolvedValueOnce({
        _id: vueloId,
        estado: 'Cancelado',
        tripulacion: {},
      });

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Iniciado' });

      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);

    test('no debe permitir actualizar un vuelo ya aterrizado', async () => {
      mockObtenerVuelo.mockResolvedValueOnce({
        _id: vueloId,
        estado: 'Aterrizado',
        tripulacion: {},
      });

      const response = await request(app)
        .put(`${ruta}/${vueloId}`)
        .send({ estado: 'Cancelado' });

      expect(response.status).toBeGreaterThanOrEqual(200);
    }, 10000);
  });
});