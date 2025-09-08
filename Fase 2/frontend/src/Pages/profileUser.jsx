import React, { useState, useEffect } from 'react';
import NavbarComponent from '../components/navbarComponent';
const apiUrl = import.meta.env.VITE_API_URL;

const ProfileUser = () => {
  const [user, setUser] = useState({});
  const hasToken = !!sessionStorage.getItem('token');

  useEffect(() => {
    if (hasToken) {
      const storedUser = JSON.parse(sessionStorage.getItem('user') || '{}');
      fetch(`${apiUrl}/users/${storedUser.id}`)
        .then((response) => response.json())
        .then((data) => setUser(data))
        .catch((error) => console.error('Error fetching user data:', error));
    }
  }, [hasToken]);

  const isPasajero = hasToken && user.tipo === 'pasajero';
  const showEditButton = isPasajero;
  console.log('User Data:', user);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  // Format the date if it exists
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div>
      <NavbarComponent />
      <div className="flex flex-col items-center bg-[#EAEFEF] p-6">
        <div className="flex items-center justify-between w-full max-w-md mb-6">
          <img
            src="https://c.superprof.com/i/a/24802214/11427094/600/20230217180414/expatriado-frances-viviendo-espana-ahora-ofrezco-mis-servicios-para-ensenar-frances-personas-todos-los-niveles.jpg"
            alt="Profile"
            className="w-32 h-32 rounded-lg object-cover"
          />
          {showEditButton && (
            <button className="bg-[#B8CFCE] text-[#333446] px-4 py-2 rounded hover:bg-[#7F8CAA] transition">
              Editar
            </button>
          )}
        </div>
        <div className="bg-[#333446] text-white p-6 rounded-lg w-full max-w-md">
          <div className="mb-4">
            <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
              Nombre Completo
            </button>
            <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
              {user.nombre || 'No especificado'}
            </div>
          </div>
          <div className="mb-4">
            <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
              Fecha Nacimiento
            </button>
            <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
              {formatDate(user.fecha_nacimiento) || 'No especificada'}
            </div>
          </div>
          <div className="mb-4">
            <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
              Genero
            </button>
            <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
              {user.genero || 'No especificado'}
            </div>
          </div>
          {isPasajero && (
            <div className="mb-4">
              <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
                Pasaporte
              </button>
              <div className="bg-[#B8CFCE] h-8 flex items-center px-2">
                {user.pasaporte?.numero || 'No especificado'}
              </div>
            </div>
          )}
        </div>
        <button
          onClick={handleLogout}
          className="mt-6 bg-[#7F8CAA] text-white px-4 py-2 rounded hover:bg-[#B8CFCE] transition"
        >
          Cerrar Sesion
        </button>
      </div>
    </div>
  );
};

export default ProfileUser;