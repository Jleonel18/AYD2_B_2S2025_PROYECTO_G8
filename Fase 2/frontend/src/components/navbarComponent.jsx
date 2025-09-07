import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NavbarComponent = () => {
  let user = {};
  let role = '';
  const hasToken = !!sessionStorage.getItem('token');

  if (hasToken) {
    user = JSON.parse(sessionStorage.getItem('user') || '{}');
    role = user.tipo || '';
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    window.location.href = '/login';
  };

  //console.log('Role:', role, 'Is Pasajero:', role === 'pasajero', 'isDropdownOpen:', isDropdownOpen);

  return (
    <nav className="flex justify-between items-center p-4 bg-[#333446] text-white relative z-50">
      <div className="text-2xl font-bold">AirFlow System</div>
      <div className="flex items-center">
        {hasToken && role === 'pasajero' && (
          <div className="flex space-x-4 mr-4">
            <Link  className="text-white hover:text-[#7F8CAA]">Mis Vuelos</Link>
            <Link  className="text-white hover:text-[#7F8CAA]">Historial</Link>
            <Link  className="text-white hover:text-[#7F8CAA]">Puntos</Link>
          </div>
        )}
        <div className="relative">
          {hasToken ? (
            <div className="relative">
              <button
                onClick={() => {
                  //console.log('Toggling dropdown');
                  setIsDropdownOpen(!isDropdownOpen);
                }}
                className="text-white px-4  hover:text-[#7F8CAA] py-2 mr-2 rounded focus:outline-none"
              >
                {user.nombre || 'Usuario'}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#333446] rounded-lg shadow-lg z-50">
                  <Link
                    to="/profile"
                    className="block px-4 py-2 text-white hover:bg-[#7F8CAA] rounded-t-lg"
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-[#7F8CAA] rounded-b-lg"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="text-white hover:text-[#7F8CAA] px-4 py-2 mr-2 rounded">
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;