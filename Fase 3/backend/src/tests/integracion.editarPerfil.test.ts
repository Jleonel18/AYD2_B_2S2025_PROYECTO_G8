import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import { tokenAuth, authorizeRoles } from '../middleware/authMiddleware';
import { UsuarioController } from '../modules/users/controllers/usuarioController';
import { UserService } from '../core/repository/services/UserService';
import { VueloService } from '../core/repository/services/VueloService';
import { AvionService } from '../core/repository/services/AvionService';

// 🔹 Mock de dependencias
jest.mock('../core/repository/services/UserService');
jest.mock('../core/repository/services/VueloService');
jest.mock('../core/repository/services/AvionService');

const app = express();
app.use(express.json());

// 🔹 Mock usuario
const mockUser = {
  _id: '507f1f77bcf86cd799439011',
  usuario: 'juan',
  tipo: 'pasajero',
  nombre: 'Juan Pérez',
  correo: 'juan@example.com',
  activo: true,
};

// 🔹 Instanciar servicios mockeados
const userService = new UserService({} as any);
const vueloService = new VueloService({} as any);
const avionService = new AvionService({} as any);

// 🔹 Controlador
const usuarioController = new UsuarioController(userService, vueloService, avionService);

// 🔹 Endpoint de login simulado
app.post('/api/users/login', async (req, res) => {
  const { usuario, contrasena } = req.body;
  if (usuario === 'juan' && contrasena === '1234') {
    const token = jwt.sign(
      {
        id: mockUser._id,
        usuario: mockUser.usuario,
        tipo: mockUser.tipo,
        nombre: mockUser.nombre,
        correo: mockUser.correo,
      },
      'secreto',
      { expiresIn: '1h' }
    );
    return res.status(200).json({ usuario: mockUser, token });
  }
  return res.status(400).json({ message: 'Usuario o contraseña incorrectos' });
});

// 🔹 Endpoint real bajo prueba
app.put(
  '/api/users/perfil',
  tokenAuth,
  authorizeRoles('pasajero'),
  usuarioController.editarPerfil.bind(usuarioController)
);

describe('PUT /api/users/perfil', () => {
  let token: string;

  beforeAll(async () => {
    // Generar token una vez
    const login = await request(app)
      .post('/api/users/login')
      .send({ usuario: 'juan', contrasena: '1234' });
    token = login.body.token;
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  it('debería editar el perfil exitosamente', async () => {
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(mockUser);
    (userService.obtenerUsuarioPorCorreo as jest.Mock).mockResolvedValue(null);
    (userService.editarPerfil as jest.Mock).mockResolvedValue({
      ...mockUser,
      nombre: 'Juan Actualizado',
      telefono: '12345678',
    });

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({
        nombre: 'Juan Actualizado',
        telefono: '12345678',
      });

    expect(response.status).toBe(200);
    expect(response.body).toEqual(
      expect.objectContaining({
        nombre: 'Juan Actualizado',
        telefono: '12345678',
      })
    );
    expect(userService.editarPerfil).toHaveBeenCalledWith(
      mockUser._id,
      expect.objectContaining({
        nombre: 'Juan Actualizado',
        telefono: '12345678',
      })
    );
  });

  it('debería devolver 404 si el usuario no existe', async () => {
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(null);

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nuevo Nombre' });

    expect(response.status).toBe(404);
    expect(response.body).toEqual({ error: 'Usuario no encontrado' });
  });

  it('debería devolver 400 si el correo ya está en uso', async () => {
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(mockUser);
    (userService.obtenerUsuarioPorCorreo as jest.Mock).mockResolvedValue({ correo: 'otro@example.com' });

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ correo: 'nuevo@example.com' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'El correo ya está en uso' });
  });

  it('debería devolver 400 si la edad es menor a 18', async () => {
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ edad: 15 });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'La edad debe ser menor o igual a 18 años' });
  });

  it('debería devolver 400 si el correo es inválido', async () => {
    (userService.obtenerUsuario as jest.Mock).mockResolvedValue(mockUser);

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ correo: 'correo_invalido' });

    expect(response.status).toBe(400);
    expect(response.body).toEqual({ error: 'El correo ya está en uso' });
  });

  it('debería devolver 401 si no se proporciona token', async () => {
    const response = await request(app)
      .put('/api/users/perfil')
      .send({ nombre: 'Juan' });

    expect(response.status).toBe(401);
    expect(response.body).toEqual({ message: 'Token no proporcionado' });
  });

  it('debería devolver 403 si el token es inválido', async () => {
    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', 'Bearer invalid-token')
      .send({ nombre: 'Juan' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'Token no válido' });
  });

  it('debería devolver 403 si el usuario no tiene rol pasajero', async () => {
    const nonPassengerUser = {
      id: mockUser._id,
      usuario: mockUser.usuario,
      tipo: 'admin',
      nombre: mockUser.nombre,
      correo: mockUser.correo,
    };
    const adminToken = jwt.sign(nonPassengerUser, 'secreto', { expiresIn: '1h' });

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ nombre: 'Juan Actualizado' });

    expect(response.status).toBe(403);
    expect(response.body).toEqual({ message: 'No tienes permisos para esta acción' });
  });

  it('debería devolver 500 si ocurre un error en el servidor', async () => {
    (userService.obtenerUsuario as jest.Mock).mockRejectedValue(new Error('Error en DB'));

    const response = await request(app)
      .put('/api/users/perfil')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Juan' });

    expect(response.status).toBe(500);
    expect(response.body).toEqual({ error: 'Error en servidor' });
  });
});
