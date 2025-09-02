import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {

  const navigate = useNavigate();
  const [fullName, setFullName] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [issueCountry, setIssueCountry] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [address, setAddress] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const redirectToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-[#333446]">
        <img src="../images/plane.png" alt="Background" className="object-cover w-full h-full" />
      </div>
      <div className="w-1/2 bg-[#EAEFEF] flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg shadow-lg w-96">
          <h2 className="text-2xl font-bold text-[#333446] text-center mb-6">Crear cuenta</h2>
          <div className="mb-4">
            <label className="block text-[#333446] text-sm mb-2">Datos personales</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-2 border border-[#7F8CAA] rounded mb-2"
              placeholder="Nombre completo"
            />
            <div className="flex space-x-2">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-1/2 p-2 border border-[#7F8CAA] rounded"
                placeholder="Fecha de nacimiento"
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-1/2 p-2 border border-[#7F8CAA] rounded"
              >
                <option value="">Genero</option>
                <option value="male">Masculino</option>
                <option value="female">Femenino</option>
                <option value="other">Otro</option>
              </select>
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[#333446] text-sm mb-2">Datos Pasaporte</label>
            <input
              type="text"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="w-full p-2 border border-[#7F8CAA] rounded mb-2"
              placeholder="Numero de pasaporte"
            />
            <div className="flex space-x-2">
              <input
                type="text"
                value={issueCountry}
                onChange={(e) => setIssueCountry(e.target.value)}
                className="w-1/2 p-2 border border-[#7F8CAA] rounded"
                placeholder="Pais de emisión"
              />
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-1/2 p-2 border border-[#7F8CAA] rounded"
                placeholder="Fecha vencimiento"
              />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-[#333446] text-sm mb-2">Datos de contacto</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-2 border border-[#7F8CAA] rounded mb-2"
              placeholder="Dirección"
            />
            <div className="flex space-x-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-1/2 p-2 border border-[#7F8CAA] rounded"
                placeholder="Correo electrónico"
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-1/2 p-2 border border-[#7F8CAA] rounded"
                placeholder="Teléfono"
              />
            </div>
          </div>
          <button
            className="w-full bg-[#333446] text-white p-2 rounded hover:bg-[#7F8CAA] transition"
          >
            Crear cuenta
          </button>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm" onClick={redirectToLogin}>
            ¿Ya tienes cuenta? Inicia sesión
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;