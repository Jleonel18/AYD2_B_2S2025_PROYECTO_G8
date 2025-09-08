import { useState, useEffect } from 'react';

const VuelosPage = () => {
  const [flights, setFlights] = useState([]);
  const [newFlight, setNewFlight] = useState({ origin: '', destination: '', departure: '', arrival: '', status: 'Planificado' });
  const [error, setError] = useState(null);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const statusColors = {
    Planificado: "blue-500",
    Iniciado: "green-500",
    "En tiempo": "green-500",
    Retrasado: "orange-500",
    Cancelado: "red-500",
    Aterrizado: "purple-500",
  };

  useEffect(() => {
    const fetchFlights = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setFlights(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchFlights();
  }, []);

  const handleCreateFlight = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/vuelos/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newFlight),
      });
      if (!response.ok) throw new Error('Failed to create flight');
      const data = await response.json();
      setFlights([...flights, data]);
      setNewFlight({ origin: '', destination: '', departure: '', arrival: '', status: 'Planificado' });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) throw new Error('Failed to update status');
      const updatedFlight = await response.json();
      setFlights(flights.map(flight => flight.id === id ? updatedFlight : flight));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleCancelFlight = async (id) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelado' }),
      });
      if (!response.ok) throw new Error('Failed to cancel flight');
      const updatedFlight = await response.json();
      setFlights(flights.map(flight => flight.id === id ? updatedFlight : flight));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEditFlight = (flight) => {
    console.log('Edit flight:', flight);
    // Implement edit logic here, e.g., open a form to edit flight details and send a PUT request
  };

  if (error) return <div className="ml-64 p-6 text-red-500">Error: {error}</div>;

  return (
    <div className="ml-64 p-6">
      <h1 className="text-2xl font-bold mb-4">Vuelos</h1>
      <form onSubmit={handleCreateFlight} className="mb-4">
        <input
          type="text"
          value={newFlight.origin}
          onChange={(e) => setNewFlight({ ...newFlight, origin: e.target.value })}
          placeholder="Origen"
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          value={newFlight.destination}
          onChange={(e) => setNewFlight({ ...newFlight, destination: e.target.value })}
          placeholder="Destino"
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          value={newFlight.departure}
          onChange={(e) => setNewFlight({ ...newFlight, departure: e.target.value })}
          placeholder="Salida (e.g., 18-08-2025 14:00)"
          className="mr-2 p-2 border rounded"
          required
        />
        <input
          type="text"
          value={newFlight.arrival}
          onChange={(e) => setNewFlight({ ...newFlight, arrival: e.target.value })}
          placeholder="Llegada (e.g., 18-08-2025 15:00)"
          className="mr-2 p-2 border rounded"
          required
        />
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
          Nuevo vuelo
        </button>
      </form>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">ID</th>
            <th className="p-2 border">Origen</th>
            <th className="p-2 border">Destino</th>
            <th className="p-2 border">Salida</th>
            <th className="p-2 border">Llegada</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {flights.map((flight) => (
            <tr key={flight.id} className="border">
              <td className="p-2 border">{flight.id}</td>
              <td className="p-2 border">{flight.origin}</td>
              <td className="p-2 border">{flight.destination}</td>
              <td className="p-2 border">{flight.departure}</td>
              <td className="p-2 border">{flight.arrival}</td>
              <td className="p-2 border">
                <span className={`px-2 py-1 rounded text-white bg-${statusColors[flight.status]}`}>
                  {flight.status}
                </span>
              </td>
              <td className="p-2 border">
                <button
                  onClick={() => setSelectedFlight(flight)}
                  className="mr-2 text-blue-500 hover:text-blue-700 text-2xl"
                >
                  👁️
                </button>
                <button
                  onClick={() => handleEditFlight(flight)}
                  className="mr-2 text-yellow-500 hover:text-yellow-700 text-2xl"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleCancelFlight(flight.id)}
                  className="text-red-500 hover:text-red-700 text-2xl"
                >
                  ❌
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-sm text-gray-600">
        <span className="mr-2">Planificado</span>
        <span className="px-2 py-1 rounded text-white bg-blue-500 mr-2">■</span>
        <span className="mr-2">Iniciado</span>
        <span className="px-2 py-1 rounded text-white bg-green-500 mr-2">■</span>
        <span className="mr-2">En tiempo</span>
        <span className="px-2 py-1 rounded text-white bg-green-500 mr-2">■</span>
        <span className="mr-2">Retrasado</span>
        <span className="px-2 py-1 rounded text-white bg-orange-500 mr-2">■</span>
        <span className="mr-2">Cancelado</span>
        <span className="px-2 py-1 rounded text-white bg-red-500 mr-2">■</span>
        <span className="mr-2">Aterrizado</span>
        <span className="px-2 py-1 rounded text-white bg-purple-500">■</span>
      </div>

      {selectedFlight && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg">
            <h2 className="text-xl font-bold mb-4">Detalles del Vuelo</h2>
            <p><strong>ID:</strong> {selectedFlight.id}</p>
            <p><strong>Origen:</strong> {selectedFlight.origin}</p>
            <p><strong>Destino:</strong> {selectedFlight.destination}</p>
            <p><strong>Salida:</strong> {selectedFlight.departure}</p>
            <p><strong>Llegada:</strong> {selectedFlight.arrival}</p>
            <p><strong>Estado:</strong> {selectedFlight.status}</p>
            <button
              onClick={() => setSelectedFlight(null)}
              className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Cerrar
            </button>
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
      )}
    </div>
  );
};

export default VuelosPage;