import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {

  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
            <label className="block text-[#333446] text-sm mb-2" htmlFor="email">Correo</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border border-[#7F8CAA] rounded"
              placeholder="ejemplo@ejemplo.com"
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
            />
          </div>
          <button
            className="w-full bg-[#333446] text-white p-2 rounded hover:bg-[#7F8CAA] transition"
          >
            Iniciar sesión
          </button>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm">
            ¿Olvidaste tu contraseña?
          </p>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm" onClick={redirectToRegister}>
            Regístrate
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;