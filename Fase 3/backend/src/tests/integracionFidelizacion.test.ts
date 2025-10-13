import request from 'supertest';
import express from 'express';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import { UsuarioController } from '../modules/users/controllers/usuarioController';
import { tokenAuth, authorizeRoles } from '../middleware/authMiddleware';

// --- MOCKS: servicio simulado, sin tocar DB ---
const usuarioServiceMock = {
  puntosPorHorasDeVuelo: jest.fn(),
} as unknown as any;

const vueloServiceMock = {} as any;
const avionesServiceMock = {} as any;

const usuarioController = new UsuarioController(
  usuarioServiceMock,
  vueloServiceMock,
  avionesServiceMock
);

const app = express();
app.use(express.json());

// Simular endpoint de login (para generar token)
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  correo: 'operaciones@example.com',
  nombre: 'Operador',
  tipo: 'operaciones',
};

process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret';

app.post('/api/users/login', (req, res) => {
  const { usuario, contrasena } = req.body;
  if (usuario === 'op' && contrasena === '1234') {
    const token = jwt.sign(mockUser, process.env.JWT_SECRET!, { expiresIn: '1h' });
    return res.status(200).json({ usuario: mockUser, token });
  }
  return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
});

// Ruta bajo prueba
app.patch(
  '/api/pasajeros/puntos',
  tokenAuth,
  authorizeRoles('operaciones'),
  usuarioController.sumarPuntosPorHorasVuelo.bind(usuarioController)
);

describe('PATCH /api/pasajeros/puntos - sumarPuntosPorHorasVuelo', () => {
  const ids = [
    new mongoose.Types.ObjectId().toString(),
    new mongoose.Types.ObjectId().toString(),
  ];

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    if (mongoose.connection && mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  });

  it('debería sumar puntos correctamente para varios IDs y devolver detalles', async () => {
    const usuarioActualizado1 = {
      _id: ids[0],
      nombre: 'Alice',
      usuario: 'alice123',
      puntos: 500,
      tipo: 'tripulacion',
    };
    const usuarioActualizado2 = {
      _id: ids[1],
      nombre: 'Bob',
      usuario: 'bob123',
      puntos: 700,
      tipo: 'tripulacion',
    };

    (usuarioServiceMock.puntosPorHorasDeVuelo as jest.Mock)
      .mockResolvedValueOnce(usuarioActualizado1)
      .mockResolvedValueOnce(usuarioActualizado2);

    const loginResp = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'op', contrasena: '1234' });
    const token = loginResp.body.token;

    const horas = 3.6; // truncadas a 3 -> puntos = 300
    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids, horas });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty(
      'message',
      'Procesamiento de horas de vuelo completado'
    );
    expect(Array.isArray(response.body.resultados)).toBe(true);
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).toHaveBeenCalledTimes(2);
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).toHaveBeenCalledWith(ids[0], 300);
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).toHaveBeenCalledWith(ids[1], 300);

    expect(response.body.resultados).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: usuarioActualizado1._id,
          message: expect.stringContaining('Se agregaron 3 horas de vuelo'),
          tripulacion: expect.objectContaining({
            id: usuarioActualizado1._id,
            nombre: usuarioActualizado1.nombre,
            puntos: usuarioActualizado1.puntos,
          }),
        }),
        expect.objectContaining({
          id: usuarioActualizado2._id,
          tripulacion: expect.objectContaining({
            id: usuarioActualizado2._id,
            nombre: usuarioActualizado2.nombre,
          }),
        }),
      ])
    );
  });

  it('debería manejar IDs no encontrados (parcial)', async () => {
    (usuarioServiceMock.puntosPorHorasDeVuelo as jest.Mock)
      .mockResolvedValueOnce({
        _id: ids[0],
        nombre: 'Alice',
        usuario: 'alice123',
        puntos: 400,
        tipo: 'tripulacion',
      })
      .mockResolvedValueOnce(null);

    const loginResp = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'op', contrasena: '1234' });
    const token = loginResp.body.token;

    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids, horas: 2 });

    expect(response.status).toBe(200);
    expect(response.body.resultados).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: ids[0], tripulacion: expect.any(Object) }),
        expect.objectContaining({
          id: ids[1],
          error: 'Miembro de tripulación no encontrado',
        }),
      ])
    );
  });

  it('debería devolver 400 si horas inválidas', async () => {
    const loginResp = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'op', contrasena: '1234' });
    const token = loginResp.body.token;

    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids, horas: 0 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({
      error: 'Debe proporcionar un número válido de horas mayor que 0',
    });
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 400 si ids inválidos', async () => {
    const loginResp = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'op', contrasena: '1234' });
    const token = loginResp.body.token;

    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids: [], horas: 2 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'Debe proporcionar una lista válida de IDs' });
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 401 si no se proporciona token', async () => {
    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .send({ ids, horas: 2 });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token no proporcionado' });
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 403 si el usuario no tiene rol operaciones', async () => {
    const nonOpUser = { _id: '507f1f77bcf86cd799439011', tipo: 'pasajero' };
    const token = jwt.sign(nonOpUser, process.env.JWT_SECRET!, { expiresIn: '1h' });

    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids, horas: 2 });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'No tienes permisos para esta acción' });
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).not.toHaveBeenCalled();
  });

  it('debería devolver 500 si el servicio lanza error', async () => {
    (usuarioServiceMock.puntosPorHorasDeVuelo as jest.Mock).mockRejectedValue(
      new Error('DB error')
    );

    const loginResp = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'op', contrasena: '1234' });
    const token = loginResp.body.token;

    const response = await request(app)
      .patch('/api/pasajeros/puntos')
      .set('Authorization', `Bearer ${token}`)
      .send({ ids, horas: 2 });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({
      error: 'Error al procesar puntos por horas de vuelo',
    });
    expect(usuarioServiceMock.puntosPorHorasDeVuelo).toHaveBeenCalled();
  });
});
