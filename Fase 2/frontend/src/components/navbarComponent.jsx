import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const NavbarComponent = () => {
  let user = {};
  const navigate = useNavigate()
  let role = '';
  const hasToken = !!sessionStorage.getItem('token');

  if (hasToken) {
    try {
      user = JSON.parse(sessionStorage.getItem('user') || '{}');
      role = user.tipo || '';
    } catch (error) {
      console.error('Error parsing user data from sessionStorage:', error);
    }
  }

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const navigateMainPage = () => {
    navigate('/')
  }

  return (
    <nav className="flex justify-between items-center p-4 bg-[#333446] text-white relative z-50">
      <div className="text-2xl font-bold cursor-pointer" onClick={navigateMainPage}>AirFlow System</div>
      <div className="flex items-center">
        {hasToken && role === 'pasajero' && (
          <div className="flex space-x-4 mr-4">
            <NavLink
              to="/reservas"
              end
              className={({ isActive }) => {
                console.log('NavLink /reservas isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-2 py-1 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Mis Reservas
            </NavLink>
            {/* <NavLink
              end
              className={({ isActive }) => {
                console.log('NavLink /vuelos isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-2 py-1 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Mis Vuelos
            </NavLink> */}
            <NavLink
              to="/historial"
              end
              className={({ isActive }) => {
                console.log('NavLink /historial isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-2 py-1 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Historial
            </NavLink>
            <NavLink
              to="/puntos"
              end
              className={({ isActive }) => {
                console.log('NavLink /puntos isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-2 py-1 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Puntos
            </NavLink>
          </div>
        )}
        {hasToken && role === 'operaciones' && (
          <div className="flex space-x-4 mr-4">
            <NavLink
              to="/tripulacion"
              end
              className={({ isActive }) => {
                console.log('NavLink /tripulacion isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-2 py-1 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Tripulación
            </NavLink>
            <NavLink
              to="/aeropuertos"
              end
              className={({ isActive }) => {
                console.log('NavLink /aeropuertos isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-2 py-1 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Aeropuertos
            </NavLink>
          </div>
        )}
        <div className="relative">
          {hasToken ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-white px-4 py-2 mr-2 rounded hover:text-[#7F8CAA] focus:outline-none transition duration-200"
              >
                {user.nombre || 'Usuario'}
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#333446] rounded-lg shadow-lg z-50">
                  <NavLink
                    to="/profile"
                    end
                    className={({ isActive }) => {
                      console.log('NavLink /profile isActive:', isActive);
                      return `block px-4 py-2 text-white hover:bg-[#7F8CAA] rounded-t-lg transition duration-200 ${
                        isActive ? 'bg-[#7F8CAA] font-semibold' : ''
                      }`;
                    }}
                    onClick={() => setIsDropdownOpen(false)}
                  >
                    Mi Perfil
                  </NavLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsDropdownOpen(false);
                    }}
                    className="block w-full text-left px-4 py-2 text-white hover:bg-[#7F8CAA] rounded-b-lg transition duration-200"
                  >
                    Cerrar Sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <NavLink
              to="/login"
              end
              className={({ isActive }) => {
                console.log('NavLink /login isActive:', isActive);
                return `text-white hover:text-[#7F8CAA] px-4 py-2 mr-2 rounded transition duration-200 ${
                  isActive ? 'text-[#7F8CAA] font-semibold bg-[#7F8CAA]/30' : ''
                }`;
              }}
            >
              Iniciar sesión
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  );
};

export default NavbarComponent;