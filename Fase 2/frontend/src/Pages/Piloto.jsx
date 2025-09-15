import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';

const PilotFlightsPage = () => {
  const [flights, setFlights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [delayTime, setDelayTime] = useState('');
  const [airports, setAirports] = useState([]);
  const [aircrafts, setAircrafts] = useState([]);
  const [workers, setWorkers] = useState([]);

  const statusOptions = [
    { value: 'Planificado', label: 'Planificado', color: 'text-blue-500' },
    { value: 'Iniciado', label: 'Iniciado', color: 'text-green-500' },
    { value: 'En tiempo', label: 'En tiempo', color: 'text-green-500' },
    { value: 'Retrasado', label: 'Retrasado', color: 'text-orange-500' },
    { value: 'Aterrizado', label: 'Aterrizado', color: 'text-purple-500' },
    { value: 'Cancelado', label: 'Cancelado', color: 'text-red-500' }
  ];

  useEffect(() => {
    fetchPilotFlights();
    fetchReferenceData();
  }, []);

  const fetchPilotFlights = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      if (!token || !user) {
        toast.error('No se encontró información de sesión');
        return;
      }

      const response = await fetch(`http://localhost:3000/api/vuelos/piloto/${user._id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setFlights(data);
      } else {
        toast.error('Error al obtener los vuelos');
      }
    } catch (error) {
      console.error('Error fetching pilot flights:', error);
      toast.error('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const fetchReferenceData = async () => {
    const token = sessionStorage.getItem('token');
    try {
      // Fetch airports
      const airportsResponse = await fetch('http://localhost:3000/api/aeropuertos/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (airportsResponse.ok) {
        setAirports(await airportsResponse.json());
      }

      // Fetch aircrafts
      const aircraftsResponse = await fetch('http://localhost:3000/api/aviones/', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (aircraftsResponse.ok) {
        setAircrafts(await aircraftsResponse.json());
      }

      // Fetch workers
      const workersResponse = await fetch('http://localhost:3000/api/users/trabajadores', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (workersResponse.ok) {
        const data = await workersResponse.json();
        setWorkers(data.trabajadores);
      }
    } catch (error) {
      console.error('Error fetching reference data:', error);
    }
  };

  const getStatusColor = (estado) => {
    const status = statusOptions.find(s => s.value === estado);
    return status ? status.color : 'text-gray-500';
  };

  const getAirportName = (airportId) => {
    const airport = airports.find(a => a._id === airportId);
    return airport ? airport.nombre : airportId;
  };

  const getAircraftModel = (aircraftId) => {
    const aircraft = aircrafts.find(a => a._id === aircraftId);
    return aircraft ? aircraft.modelo : aircraftId;
  };

  const getWorkerName = (workerId) => {
    const worker = workers.find(w => w._id === workerId);
    return worker ? worker.nombre : workerId;
  };

  const calculateFlightDuration = (salida, llegada, delayMinutes = 0) => {
    const start = new Date(salida);
    const end = new Date(llegada);
    const durationMs = end.getTime() - start.getTime() + (delayMinutes * 60 * 1000);
    return Math.round(durationMs / (1000 * 60 * 60 * 100)) / 100; // Horas con 2 decimales
  };

  const handleStatusChange = (flight) => {
    setSelectedFlight(flight);
    setNewStatus('');
    setDelayTime('');
    setShowStatusModal(true);
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) {
      toast.error('Selecciona un estado');
      return;
    }

    if (newStatus === 'Retrasado' && (!delayTime || delayTime <= 0)) {
      toast.error('Ingresa el tiempo de retraso en minutos');
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user'));

      const payload = {
        nuevoEstado: newStatus,
        ...(newStatus === 'Retrasado' && { tiempoRetraso: parseInt(delayTime) }),
        ...(newStatus === 'Aterrizado' && {
          tiempoVuelo: calculateFlightDuration(
            selectedFlight.fecha_salida,
            selectedFlight.fecha_llegada,
            selectedFlight.tiempoRetraso || 0
          ),
          pilotoId: user._id,
          aeronaveId: selectedFlight.aeronave
        })
      };

      const response = await fetch(`http://localhost:3000/api/vuelos/${selectedFlight._id}/estado`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedFlight = await response.json();
        setFlights(prev => prev.map(f => f._id === selectedFlight._id ? updatedFlight : f));
        toast.success('Estado actualizado correctamente');
        setShowStatusModal(false);
        
        if (newStatus === 'Aterrizado') {
          toast.success(`Vuelo completado. Tiempo de vuelo: ${payload.tiempoVuelo} horas`);
        }
      } else {
        const errorText = await response.text();
        toast.error(errorText || 'Error al actualizar el estado');
      }
    } catch (error) {
      console.error('Error updating flight status:', error);
      toast.error('Error de conexión');
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Cargando vuelos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Mis Vuelos Asignados</h1>
        <p className="text-gray-600">Gestiona el estado de tus vuelos asignados</p>
      </div>

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-4 border-b-2 border-gray-300">ID Vuelo</th>
              <th className="p-4 border-b-2 border-gray-300">Origen</th>
              <th className="p-4 border-b-2 border-gray-300">Destino</th>
              <th className="p-4 border-b-2 border-gray-300">Salida</th>
              <th className="p-4 border-b-2 border-gray-300">Llegada</th>
              <th className="p-4 border-b-2 border-gray-300">Aeronave</th>
              <th className="p-4 border-b-2 border-gray-300">Estado</th>
              <th className="p-4 border-b-2 border-gray-300">Retraso</th>
              <th className="p-4 border-b-2 border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {flights.length === 0 ? (
              <tr>
                <td colSpan="9" className="p-8 text-center text-gray-500">
                  No tienes vuelos asignados
                </td>
              </tr>
            ) : (
              flights.map((flight) => (
                <tr key={flight._id} className="hover:bg-gray-100 transition duration-150">
                  <td className="p-4 border-b border-gray-200 font-mono text-sm">
                    {flight._id.slice(-8)}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {getAirportName(flight.origen)}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {getAirportName(flight.destino)}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {new Date(flight.fecha_salida).toLocaleString()}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {new Date(flight.fecha_llegada).toLocaleString()}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {getAircraftModel(flight.aeronave)}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    <span className={getStatusColor(flight.estado)}>{flight.estado}</span>
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {flight.tiempoRetraso ? `${flight.tiempoRetraso} min` : '-'}
                  </td>
                  <td className="p-4 border-b border-gray-200">
                    {flight.estado !== 'Aterrizado' && flight.estado !== 'Cancelado' && (
                      <button
                        onClick={() => handleStatusChange(flight)}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition duration-200"
                      >
                        Cambiar Estado
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Leyenda de estados */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        {statusOptions.map((status) => (
          <span key={status.value} className={status.color}>
            ● {status.label}
          </span>
        ))}
      </div>

      {/* Modal para cambio de estado */}
      {showStatusModal && selectedFlight && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-sm">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Cambiar Estado del Vuelo
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Vuelo: {getAirportName(selectedFlight.origen)} → {getAirportName(selectedFlight.destino)}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Estado actual: <span className={getStatusColor(selectedFlight.estado)}>
                  {selectedFlight.estado}
                </span>
              </p>
            </div>

            <div className="mb-4">
              <label className="block mb-2 text-gray-700 font-semibold">
                Nuevo Estado
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecciona un estado</option>
                {statusOptions
                  .filter(status => status.value !== selectedFlight.estado)
                  .map((status) => (
                    <option key={status.value} value={status.value}>
                      {status.label}
                    </option>
                  ))}
              </select>
            </div>

            {newStatus === 'Retrasado' && (
              <div className="mb-4">
                <label className="block mb-2 text-gray-700 font-semibold">
                  Tiempo de Retraso (minutos)
                </label>
                <input
                  type="number"
                  value={delayTime}
                  onChange={(e) => setDelayTime(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ej: 30"
                  min="1"
                />
              </div>
            )}

            {newStatus === 'Aterrizado' && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700">
                  ℹ️ Al marcar como aterrizado, se calculará automáticamente el tiempo de vuelo 
                  y se actualizarán los registros del piloto y la aeronave.
                </p>
                {selectedFlight.tiempoRetraso && (
                  <p className="text-sm text-green-700 mt-1">
                    Tiempo de retraso incluido: {selectedFlight.tiempoRetraso} minutos
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition duration-200"
              >
                Cancelar
              </button>
              <button
                onClick={handleStatusUpdate}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
              >
                Actualizar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PilotFlightsPage;