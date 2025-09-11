import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify'
const apiUrl = import.meta.env.VITE_API_URL

const Login = () => {
  
  const navigate = useNavigate();
  const [user, setUser] = useState('');
  const [password, setPassword] = useState('');

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
        sessionStorage.setItem('user', JSON.stringify(data.usuario));
        toast.success("Inicio de sesión exitoso");
        if(data.usuario.tipo === 'pasajero') {
          navigate('/mainpage');
        }else if(data.usuario.tipo === 'operaciones'){
          navigate('/dashboard-admin');
        }
      }else {
        toast.error(data.message || "Error al iniciar sesión");
      }

    }catch(error) {
      console.error("Error al iniciar sesión:", error);
      toast.error("Error al iniciar sesión, por favor intente de nuevo.");
    }
  }

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
          <p className="text-[#7F8CAA] text-center mt-4 text-sm cursor-pointer hover:text-[#333446]" onClick={() => toast.info("Funcionalidad no implementada")}>
            ¿Olvidaste tu contraseña?
          </p>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm cursor-pointer hover:text-[#333446]" onClick={redirectToRegister}>
            Regístrate
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;