import { Link } from 'react-router-dom';

const Sidebar = () => {
  return (
    <div className="fixed w-64 h-full bg-gray-800 text-white">
      <h2 className="text-2xl p-4">AirFlow System</h2>
      <ul className="mt-6">
        <li className="px-4 py-2 hover:bg-gray-700">
          <Link to="/dashboard" className="text-white">Dashboard</Link>
        </li>
        <li className="px-4 py-2 bg-gray-700">
          <Link to="/vuelos" className="text-white">Vuelos</Link>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700">
          <Link to="/tripulacion" className="text-white">Triulación</Link>
        </li>
        <li className="px-4 py-2 hover:bg-gray-700">
          <Link to="/flota-aerea" className="text-white">Flota Aérea</Link>
        </li>
      </ul>
      <button className="mt-6 w-full text-center py-2 bg-blue-500 hover:bg-blue-600 text-white">
        Cerrar sesión
      </button>
    </div>
  );
};

export default Sidebar;