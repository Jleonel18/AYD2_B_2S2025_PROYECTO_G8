import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
const apiUrl = import.meta.env.VITE_API_URL

const Login = () => {
  
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [email, setEmail] = useState('');

  const handleLogin = async () => {

    if(!user || !password) {
      toast.error("Por favor, complete todos los campos.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ usuario: user, contrasena: password }),
      });

      const data = await response.json()

      if(response.status === 200) {
        sessionStorage.setItem('token', data.token);
        localStorage.setItem('token', data.token);
        sessionStorage.setItem('user', JSON.stringify(data.usuario));
        localStorage.setItem('user', JSON.stringify(data.usuario));
        toast.success("Inicio de sesión exitoso");
        if(data.usuario.tipo === 'operaciones'){
          navigate('/dashboard-admin');
        }else if(data.usuario.tipo === 'piloto'){
          navigate('/pilotos');
        }else {
          navigate('/mainpage');
        }
      }else {
        toast.error(data.message || "Error al iniciar sesión");
      }

    }catch(error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Error al iniciar sesión, por favor intente de nuevo.");
    }
  }

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEmail('');
  };

  const handleForgotPassword = async () => {
    if (!email) {
      toast.error("Por favor, ingrese su correo electrónico.");
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users/recuperar-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ correo: email }),
      });

      const data = await response.json();

      if (response.status === 200) {
        toast.success(data.message || "Se ha enviado un enlace de restablecimiento a su correo.");
        closeModal();
      } else {
        toast.error(data.error || "Error al enviar la solicitud de restablecimiento.");
      }
    } catch (error) {
      console.error("Error al enviar la solicitud de restablecimiento:", error);
      toast.error("Error al enviar la solicitud, por favor intente de nuevo.");
    }
  };

  const redirectToRegister = () => {
    navigate('/register');
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-[#333446]">
        <img src="../images/plane.png" alt="Background" className="object-cover w-full h-full" />
      </div>
      <div className="w-1/2 bg-[#EAEFEF] flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold text-[#333446] text-center mb-6">Iniciar Sesión</h2>
          <div className="mb-4">
            <label className="block text-[#333446] text-sm mb-2" htmlFor="user">Usuario</label>
            <input
              type="text"
              id="user"
              value={user}
              onChange={(e) => setUser(e.target.value)}
              className="w-full p-2 border border-[#7F8CAA] rounded"
              placeholder="ejemplo"
            />
          </div>
          <div className="mb-4">
            <label className="block text-[#333446] text-sm mb-2" htmlFor="password">Contraseña</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border border-[#7F8CAA] rounded"
              placeholder='********'
            />
          </div>
          <button
            className="w-full bg-[#333446] text-white p-2 rounded hover:bg-[#7F8CAA] transition"
            onClick={handleLogin}
          >
            Iniciar sesión
          </button>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm cursor-pointer hover:text-[#333446]" onClick={openModal}>
            ¿Olvidaste tu contraseña?
          </p>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm cursor-pointer hover:text-[#333446]" onClick={redirectToRegister}>
            Regístrate
          </p>
        </div>
      </div>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-md bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-2xl font-bold text-[#333446] text-center mb-6">Restablecer Contraseña</h2>
            <div className="mb-4">
              <label className="block text-[#333446] text-sm mb-2" htmlFor="email">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border border-[#7F8CAA] rounded"
                placeholder="correo@ejemplo.com"
              />
            </div>
            <div className="flex justify-between">
              <button
                className="bg-[#7F8CAA] text-white p-2 rounded hover:bg-[#333446] transition"
                onClick={handleForgotPassword}
              >
                Enviar
              </button>
              <button
                className="bg-gray-300 text-[#333446] p-2 rounded hover:bg-gray-400 transition"
                onClick={closeModal}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;