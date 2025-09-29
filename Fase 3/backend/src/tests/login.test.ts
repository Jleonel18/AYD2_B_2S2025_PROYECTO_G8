// src/tests/login.test.ts
import request from 'supertest';
import app from '../app';
import mongoose from 'mongoose';
import { UserService } from '../core/repository/services/UserService';

// Mock de UserService
jest.mock('../core/repository/services/UserService', () => {
  const mockLogin = jest.fn(); // Definimos mockLogin dentro del factory
  return {
    UserService: jest.fn().mockImplementation(() => ({
      login: mockLogin,
    })),
  };
});

// Obtenemos la referencia a mockLogin después del jest.mock
const mockLogin = jest.requireMock('../core/repository/services/UserService').UserService().login;

// Cerrar conexiones después de todas las pruebas
afterAll(async () => {
  await mongoose.connection.close();
});

describe('POST /api/users/login - Login de usuarios', () => {
  const ruta = '/api/users/login';

  beforeEach(() => {
    mockLogin.mockReset(); // Limpiamos el mock antes de cada test
  });

  test('debe devolver 400 si faltan datos', async () => {
    const response = await request(app)
      .post(ruta)
      .send({ usuario: '', contrasena: '' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/faltan datos/i);
  });

  test('debe devolver 400 si usuario o contraseña son incorrectos', async () => {
    mockLogin.mockResolvedValueOnce(null);

    const response = await request(app)
      .post(ruta)
      .send({ usuario: 'inexistente', contrasena: 'malapass' });

    expect(response.status).toBe(400);
    expect(response.body.message).toMatch(/incorrectos/i);
  });

  test('debe devolver 403 si el usuario está inactivo', async () => {
    mockLogin.mockResolvedValueOnce({
      _id: '123',
      usuario: 'juan',
      tipo: 'pasajero',
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      activo: false,
    } as any);

    const response = await request(app)
      .post(ruta)
      .send({ usuario: 'juan', contrasena: '1234' });

    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/problema con tu cuenta/i);
  });

  test('debe devolver 200 y token si el login es exitoso', async () => {
    mockLogin.mockResolvedValueOnce({
      _id: '123',
      usuario: 'juan',
      tipo: 'pasajero',
      nombre: 'Juan Pérez',
      correo: 'juan@example.com',
      activo: true,
    } as any);

    const response = await request(app)
      .post(ruta)
      .send({ usuario: 'juan', contrasena: '1234' });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('usuario');
    expect(response.body).toHaveProperty('token');
    expect(response.body.usuario.usuario).toBe('juan');
  });

  test('debe devolver 500 si ocurre un error en el servidor', async () => {
    mockLogin.mockImplementationOnce(() => {
      throw new Error('Falla en la base de datos');
    });

    const response = await request(app)
      .post(ruta)
      .send({ usuario: 'juan', contrasena: '1234' });

    expect(response.status).toBe(500);
    expect(response.body.error).toMatch(/servidor/i);
  });
});