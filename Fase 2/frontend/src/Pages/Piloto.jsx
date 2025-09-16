import React, { useState, useEffect } from 'react';

const PilotView = () => {
  const [flights, setFlights] = useState([]);
  const [pilotInfo, setPilotInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingFlight, setUpdatingFlight] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Estados disponibles para cambio
  const availableStates = [
    'Planificado',
    'Iniciado', 
    'En tiempo',
    'Retrasado',
    'Aterrizado', // Equivalente a "Completado"
    'Cancelado'
  ];

  useEffect(() => {
    fetchPilotFlights();
    fetchPilotInfo();
  }, []);

  const fetchPilotInfo = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch('http://localhost:3000/api/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPilotInfo(data);
      }
    } catch (error) {
      console.error('Error fetching pilot info:', error);
    }
  };

  const fetchPilotFlights = async () => {
    const token = sessionStorage.getItem('token');
    setLoading(true);
    
    try {
      // Obtener todos los vuelos
      const response = await fetch('http://localhost:3000/api/vuelos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const allFlights = await response.json();
        
        // Obtener info del piloto para filtrar sus vuelos
        const userResponse = await fetch('http://localhost:3000/api/users/', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const pilotId = userData._id;
          
          // Filtrar solo los vuelos donde este piloto participa
          const pilotFlights = allFlights.filter(flight => 
            flight.tripulacion?.piloto_id === pilotId || 
            flight.tripulacion?.copiloto_id === pilotId
          );
          
          setFlights(pilotFlights);
        }
      } else {
        setErrorMessage('Error al cargar los vuelos');
      }
    } catch (error) {
      console.error('Error fetching flights:', error);
      setErrorMessage('Error de conexión al cargar los vuelos');
    } finally {
      setLoading(false);
    }
  };

  const calculateFlightHours = (fechaSalida, fechaLlegada) => {
    const salida = new Date(fechaSalida);
    const llegada = new Date(fechaLlegada);
    const diffMs = llegada.getTime() - salida.getTime();
    const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100; // Redondear a 2 decimales
    return diffHours;
  };

  const updateFlightStatus = async (flightId, newStatus) => {
    const token = sessionStorage.getItem('token');
    setUpdatingFlight(flightId);
    
    try {
      // Primero actualizamos el estado del vuelo
      const response = await fetch(`http://localhost:3000/api/vuelos/${flightId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (response.ok) {
        const updatedFlight = await response.json();
        
        // Si el vuelo se marca como "Aterrizado" (Completado), calculamos y sumamos las horas
        if (newStatus === 'Aterrizado') {
          const flightHours = calculateFlightHours(
            updatedFlight.fecha_salida, 
            updatedFlight.fecha_llegada
          );
          
          // Sumar horas al piloto actual
          if (pilotInfo && updatedFlight.tripulacion?.piloto_id === pilotInfo._id) {
            await updatePilotFlightHours(pilotInfo._id, flightHours);
          }
          
          // Si hay copiloto y es diferente, también sumarle las horas
          if (updatedFlight.tripulacion?.copiloto_id && 
              updatedFlight.tripulacion.copiloto_id !== pilotInfo._id) {
            await updatePilotFlightHours(updatedFlight.tripulacion.copiloto_id, flightHours);
          }
          
          // Sumar horas al avión
          await updateAircraftFlightHours(updatedFlight.aeronave, flightHours);
          
          setSuccessMessage(`Vuelo completado. Se sumaron ${flightHours} horas de vuelo.`);
        } else {
          setSuccessMessage(`Estado del vuelo actualizado a: ${newStatus}`);
        }
        
        // Actualizar la lista de vuelos
        setFlights(prevFlights => 
          prevFlights.map(flight => 
            flight._id === flightId 
              ? { ...flight, estado: newStatus }
              : flight
          )
        );
        
      } else {
        const errorText = await response.text();
        setErrorMessage(`Error al actualizar el vuelo: ${errorText}`);
      }
    } catch (error) {
      console.error('Error updating flight:', error);
      setErrorMessage('Error de conexión al actualizar el vuelo');
    } finally {
      setUpdatingFlight(null);
    }
  };

  const updatePilotFlightHours = async (pilotId, hours) => {
    const token = sessionStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/users/pilotos/${pilotId}/horas-vuelo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horas: hours }),
      });
      
      if (!response.ok) {
        console.error('Error al actualizar horas del piloto');
      }
    } catch (error) {
      console.error('Error updating pilot flight hours:', error);
    }
  };

  const updateAircraftFlightHours = async (aircraftId, hours) => {
    const token = sessionStorage.getItem('token');
    
    try {
      const response = await fetch(`http://localhost:3000/api/aviones/${aircraftId}/horas-vuelo`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ horas: hours }),
      });
      
      if (!response.ok) {
        console.error('Error al actualizar horas del avión');
      }
    } catch (error) {
      console.error('Error updating aircraft flight hours:', error);
    }
  };

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Planificado': return 'text-blue-500 bg-blue-50';
      case 'Iniciado': return 'text-green-500 bg-green-50';
      case 'En tiempo': return 'text-green-600 bg-green-100';
      case 'Retrasado': return 'text-orange-500 bg-orange-50';
      case 'Cancelado': return 'text-red-500 bg-red-50';
      case 'Aterrizado': return 'text-purple-500 bg-purple-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const canChangeStatus = (currentStatus) => {
    // Lógica de negocio: qué estados pueden cambiar a cuáles
    const statusTransitions = {
      'Planificado': ['Iniciado', 'Cancelado', 'Retrasado'],
      'Iniciado': ['En tiempo', 'Retrasado', 'Aterrizado'],
      'En tiempo': ['Aterrizado', 'Retrasado'],
      'Retrasado': ['Aterrizado', 'En tiempo'],
      'Aterrizado': [], // No se puede cambiar desde aterrizado
      'Cancelado': [] // No se puede cambiar desde cancelado
    };
    
    return statusTransitions[currentStatus] || [];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-gray-600">Cargando vuelos...</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Panel del Piloto</h1>
        {pilotInfo && (
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h2 className="text-lg font-semibold text-gray-700">
              Bienvenido, {pilotInfo.nombre}
            </h2>
            <p className="text-gray-600">
              Horas de vuelo: {pilotInfo.horasVuelo || 0} hrs
            </p>
          </div>
        )}
      </div>

      {/* Mensajes de estado */}
      {errorMessage && (
        <div className="mb-4 p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg flex justify-between items-center">
          <span>{errorMessage}</span>
          <button
            onClick={() => setErrorMessage('')}
            className="ml-4 text-red-700 hover:text-red-900"
          >
            ✖️
          </button>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 text-green-700 border border-green-200 rounded-lg flex justify-between items-center">
          <span>{successMessage}</span>
          <button
            onClick={() => setSuccessMessage('')}
            className="ml-4 text-green-700 hover:text-green-900"
          >
            ✖️
          </button>
        </div>
      )}

      {/* Lista de vuelos */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="px-6 py-4 bg-gray-100 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Mis Vuelos Asignados</h2>
        </div>
        
        {flights.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No tienes vuelos asignados actualmente.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vuelo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ruta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Horarios
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado Actual
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cambiar Estado
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Duración
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {flights.map((flight) => {
                  const availableTransitions = canChangeStatus(flight.estado);
                  const flightDuration = calculateFlightHours(flight.fecha_salida, flight.fecha_llegada);
                  
                  return (
                    <tr key={flight._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {flight._id.substring(0, 8)}...
                        </div>
                        <div className="text-sm text-gray-500">
                          {pilotInfo && flight.tripulacion?.piloto_id === pilotInfo._id ? 'Piloto' : 'Copiloto'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {flight.origen} → {flight.destino}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>Salida: {new Date(flight.fecha_salida).toLocaleString()}</div>
                          <div>Llegada: {new Date(flight.fecha_llegada).toLocaleString()}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(flight.estado)}`}>
                          {flight.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {availableTransitions.length > 0 && updatingFlight !== flight._id ? (
                          <select
                            className="text-sm border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value=""
                            onChange={(e) => {
                              if (e.target.value) {
                                updateFlightStatus(flight._id, e.target.value);
                              }
                            }}
                          >
                            <option value="">Cambiar a...</option>
                            {availableTransitions.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        ) : updatingFlight === flight._id ? (
                          <div className="text-sm text-gray-500">Actualizando...</div>
                        ) : (
                          <div className="text-sm text-gray-400">No modificable</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {flightDuration} hrs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Leyenda de estados */}
      <div className="mt-6 bg-white p-4 rounded-lg shadow-sm">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">Estados de Vuelo</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-blue-500 mr-2"></span>
            <span>Planificado - Vuelo programado</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-500 mr-2"></span>
            <span>Iniciado - Vuelo en progreso</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-green-600 mr-2"></span>
            <span>En tiempo - Sin retrasos</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-orange-500 mr-2"></span>
            <span>Retrasado - Fuera de horario</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-purple-500 mr-2"></span>
            <span>Aterrizado - Vuelo completado</span>
          </div>
          <div className="flex items-center">
            <span className="inline-block w-3 h-3 rounded-full bg-red-500 mr-2"></span>
            <span>Cancelado - Vuelo cancelado</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PilotView;