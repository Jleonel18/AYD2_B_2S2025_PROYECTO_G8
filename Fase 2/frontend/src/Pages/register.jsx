import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
const apiUrl = import.meta.env.VITE_API_URL
import imagen_avion from '../assets/plane.png';

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
  const [dpi, setDPI] = useState('');

  const redirectToLogin = () => {
    navigate('/login');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar fecha de nacimiento (futura y edad mínima de 18 años)
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    if (birthDateObj >= today) {
      toast.error('La fecha de nacimiento no puede ser en el futuro');
      return;
    }
    const ageDiffMs = today - birthDateObj;
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18) {
      toast.error('La edad debe ser mayor o igual a 18 años');
      return;
    }

    // Validar correo
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast.error('Correo inválido');
      return;
    }

    // Validar teléfono
    if (phone.length < 8) {
      toast.error('El teléfono debe tener al menos 8 caracteres');
      return;
    }

    // Validar DPI
    if (dpi && dpi.length < 13) {
      toast.error('El DPI debe tener al menos 13 caracteres');
      return;
    }

    // Validar pasaporte (no vencido)
    const expiryDateObj = new Date(expiryDate);
    if (expiryDateObj < today) {
      toast.error('El pasaporte no debe estar vencido');
      return;
    }

    try {
      const response = await fetch(`${apiUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tipo: 'pasajero',
          datos: {
            nombre: fullName,
            fecha_nacimiento: birthDate,
            edad: age,
            genero: gender,
            pasaporte: {
              numero: passportNumber,
              pais_emision: issueCountry,
              fecha_vencimiento: expiryDate
            },
            direccion: address,
            correo: email,
            telefono: phone,
            dpi,
          }
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Se han validado tus datos. Hemos enviado un correo. Por favor verifica tu cuenta.');
        redirectToLogin();
      } else {
        toast.error(data.message || 'Error en el registro');
      }
    } catch (error) {
      toast.error('Error en el registro');
      console.error('Error en el registro:', error);
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-1/2 bg-[#333446] flex items-center justify-center">
        <img src={imagen_avion} alt="Background" className="object-cover w-full h-full" />
      </div>
      <div className="w-1/2 bg-[#EAEFEF] flex items-center justify-center">
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-lg w-2/3">
          <h2 className="text-2xl font-bold text-[#333446] text-center mb-6">Crear cuenta</h2>
          <div className="mb-6">
            <label className="block text-[#333446] text-sm font-semibold mb-4">Datos personales</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-[#7F8CAA] rounded mb-4"
              placeholder="Nombre completo"
              required
            />
            <input
              type="text"
              value={dpi}
              onChange={(e) => setDPI(e.target.value)}
              className="w-full p-3 border border-[#7F8CAA] rounded mb-4"
              placeholder="Número de DPI"
              required
            />
            <div className="flex space-x-4 mb-4">
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-1/2 p-3 border border-[#7F8CAA] rounded"
                placeholder="Fecha de nacimiento"
                required
              />
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-1/2 p-3 border border-[#7F8CAA] rounded"
                required
              >
                <option value="">Género</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[#333446] text-sm font-semibold mb-4">Datos Pasaporte</label>
            <input
              type="text"
              value={passportNumber}
              onChange={(e) => setPassportNumber(e.target.value)}
              className="w-full p-3 border border-[#7F8CAA] rounded mb-4"
              placeholder="Número de pasaporte"
              required
            />
            <div className="flex space-x-4 mb-4">
              <input
                type="text"
                value={issueCountry}
                onChange={(e) => setIssueCountry(e.target.value)}
                className="w-1/2 p-3 border border-[#7F8CAA] rounded"
                placeholder="País de emisión"
                required
              />
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-1/2 p-3 border border-[#7F8CAA] rounded"
                placeholder="Fecha vencimiento"
                required
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-[#333446] text-sm font-semibold mb-4">Datos de contacto</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full p-3 border border-[#7F8CAA] rounded mb-4"
              placeholder="Dirección"
              required
            />
            <div className="flex space-x-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-1/2 p-3 border border-[#7F8CAA] rounded"
                placeholder="Correo electrónico"
                required
              />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-1/2 p-3 border border-[#7F8CAA] rounded"
                placeholder="Teléfono"
                required
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#7F8CAA] text-white p-3 rounded hover:bg-[#333446] transition duration-300"
          >
            Crear cuenta
          </button>
          <p className="text-[#7F8CAA] text-center mt-4 text-sm cursor-pointer hover:text-[#333446]" onClick={redirectToLogin}>
            ¿Ya tienes cuenta? Inicia sesión
          </p>
        </form>
      </div>
    </div>
  );
};

export default Register;