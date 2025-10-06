import { NavLink, useNavigate } from 'react-router-dom';

const Sidebar = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="fixed w-64 h-full bg-[#333446] text-white flex flex-col">
      <div className="text-2xl font-bold mx-auto py-2">AirFlow System</div>
      <ul className="mt-6 flex-1">
        <NavLink
          to="/dashboard-admin"
          className={({ isActive }) =>
            `text-white block ${isActive ? 'bg-[#7F8CAA]' : ''}`
          }
        >
          <li className="px-4 py-2 hover:bg-[#7F8CAA]">
            Dashboard
          </li>
        </NavLink>
        <NavLink
          to="/vuelos"
          className={({ isActive }) =>
            `text-white block ${isActive ? 'bg-[#7F8CAA]' : ''}`
          }
        >
          <li data-cy="sidebar-vuelos" className="px-4 py-2 hover:bg-[#7F8CAA]">
            Vuelos
          </li>
        </NavLink>
        <NavLink
          to="/tripulacion"
          className={({ isActive }) =>
            `text-white block ${isActive ? 'bg-[#7F8CAA]' : ''}`
          }
        >
          <li className="px-4 py-2 hover:bg-[#7F8CAA]">
            Tripulación
          </li>
        </NavLink>
        <NavLink
          to="/usuarios"
          className={({ isActive }) =>
            `text-white block ${isActive ? 'bg-[#7F8CAA]' : ''}`
          }
        >
          <li className="px-4 py-2 hover:bg-[#7F8CAA]">
            Usuarios
          </li>
        </NavLink>
        <NavLink
          to="/aviones"
          className={({ isActive }) =>
            `text-white block ${isActive ? 'bg-[#7F8CAA]' : ''}`
          }
        >
          <li data-cy="sidebar-aviones" className="px-4 py-2 hover:bg-[#7F8CAA]">
            Flota Aérea
          </li>
        </NavLink>
        <NavLink
          to="/aeropuertos"
          className={({ isActive }) =>
            `text-white block ${isActive ? 'bg-[#7F8CAA]' : ''}`
          }
        >
          <li className="px-4 py-2 hover:bg-[#7F8CAA]">
            Aeropuertos
          </li>
        </NavLink>
      </ul>
      <button
        className="mt-auto w-full text-center py-2 bg-blue-500 hover:bg-blue-600 text-white"
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>
    </div>
  );
};

export default Sidebar;