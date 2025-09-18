import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Added for navigation after logout

const apiUrl = import.meta.env.VITE_API_URL;

const PilotView = () => {
  const [flights, setFlights] = useState([]);
  const [pilotInfo, setPilotInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updatingFlight, setUpdatingFlight] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDelayModal, setShowDelayModal] = useState(false);
  const [selectedFlightForDelay, setSelectedFlightForDelay] = useState(null);
  const [delayHours, setDelayHours] = useState('');
  const [delayMinutes, setDelayMinutes] = useState('');
  const navigate = useNavigate(); // Added for navigation

  // Estados disponibles para cambio
  const availableStates = [
    'Planificado',
    'Iniciado', 
    'En tiempo',
    'Retrasado',
    'Aterrizado',
    'Cancelado'
  ];

  useEffect(() => {
    fetchPilotFlights();
    fetchPilotInfo();
  }, []);

  const fetchPilotInfo = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${apiUrl}/users/`, {
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
      const response = await fetch(`${apiUrl}/vuelos`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const allFlights = await response.json();
        const userResponse = await fetch(`${apiUrl}/users/`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (userResponse.ok) {
          const userData = await userResponse.json();
          const pilotId = userData._id;
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

  const handleLogout = async () => {
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${apiUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        sessionStorage.removeItem('token');
        navigate('/login');
      } else {
        setErrorMessage('Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error during logout:', error);
      setErrorMessage('Error de conexión al cerrar sesión');
    }
  };

  const calculateFlightHours = (fechaSalida, fechaLlegada) => {
    const salida = new Date(fechaSalida);
    const llegada = new Date(fechaLlegada);
    const diffMs = llegada.getTime() - salida.getTime();
    const diffHours = Math.round((diffMs / (1000 * 60 * 60)) * 100) / 100;
    return diffHours;
  };

  const updateFlightStatus = async (flightId, newStatus, delayTime = 0) => {
    const token = sessionStorage.getItem('token');
    setUpdatingFlight(flightId);
    
    try {
      const response = await fetch(`${apiUrl}/vuelos/${flightId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: newStatus }),
      });

      if (response.ok) {
        const updatedFlight = await response.json();
        
        if (newStatus === 'Aterrizado') {
          const normalFlightHours = calculateFlightHours(
            updatedFlight.fecha_salida, 
            updatedFlight.fecha_llegada
          );
          const currentFlight = flights.find(f => f._id === flightId);
          const delayHours = currentFlight?.tiempoRetraso || 0;
          const totalFlightHours = normalFlightHours + delayHours;
          
          console.log('Horas normales:', normalFlightHours);
          console.log('Horas de retraso:', delayHours);
          console.log('Total a sumar:', totalFlightHours);
          
          await updateAircraftFlightHours(updatedFlight.aeronave, totalFlightHours);
          
          const retrasoText = delayHours > 0 ? 
            ` (${normalFlightHours} hrs normales + ${delayHours} hrs de retraso)` : '';
          setSuccessMessage(`Vuelo completado. Se sumaron ${totalFlightHours} horas de vuelo${retrasoText}.`);
        } else if (newStatus === 'Retrasado') {
          if (delayTime > 0) {
            await updateFlightDelay(flightId, delayTime);
            setSuccessMessage(`Vuelo marcado como retrasado. Se agregaron ${delayTime} horas de retraso.`);
          } else {
            setSuccessMessage(`Estado del vuelo actualizado a: ${newStatus}`);
          }
        } else if (newStatus === 'En tiempo') {
          await updateFlightDelay(flightId, 0, true);
          setSuccessMessage(`Vuelo marcado como "En tiempo". Se resetó el tiempo de retraso.`);
        } else {
          setSuccessMessage(`Estado del vuelo actualizado a: ${newStatus}`);
        }
        
        setFlights(prevFlights => 
          prevFlights.map(flight => {
            if (flight._id === flightId) {
              let updatedFlightData = { ...flight, estado: newStatus };
              
              if (newStatus === 'Retrasado' && delayTime > 0) {
                updatedFlightData.tiempoRetraso = (flight.tiempoRetraso || 0) + delayTime;
              } else if (newStatus === 'En tiempo') {
                updatedFlightData.tiempoRetraso = 0;
              }
              
              return updatedFlightData;
            }
            return flight;
          })
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

  const updateFlightDelay = async (flightId, delayHours, resetDelay = false) => {
    const token = sessionStorage.getItem('token');
    
    try {
      let newTotalDelay;
      
      if (resetDelay) {
        newTotalDelay = 0;
      } else {
        const flight = flights.find(f => f._id === flightId);
        const currentDelay = flight?.tiempoRetraso || 0;
        newTotalDelay = currentDelay + delayHours;
      }
      
      const response = await fetch(`${apiUrl}/vuelos/${flightId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tiempoRetraso: newTotalDelay }),
      });
      
      if (!response.ok) {
        console.error('Error al actualizar tiempo de retraso');
      }
    } catch (error) {
      console.error('Error updating flight delay:', error);
    }
  };

  const handleDelaySubmit = (e) => {
    e.preventDefault();
    const hours = parseFloat(delayHours) || 0;
    const minutes = parseFloat(delayMinutes) || 0;
    const totalDelayHours = hours + (minutes / 60);
    
    if (totalDelayHours > 0 && selectedFlightForDelay) {
      updateFlightStatus(selectedFlightForDelay._id, 'Retrasado', totalDelayHours);
      setShowDelayModal(false);
      setSelectedFlightForDelay(null);
      setDelayHours('');
      setDelayMinutes('');
    } else {
      setErrorMessage('Por favor ingresa un tiempo de retraso válido');
    }
  };

  const handleStatusChange = (flight, newStatus) => {
    if (newStatus === 'Retrasado') {
      setSelectedFlightForDelay(flight);
      setShowDelayModal(true);
    } else {
      updateFlightStatus(flight._id, newStatus);
    }
  };

  const updatePilotFlightHours = async (pilotId, hours) => {
    const token = sessionStorage.getItem('token');
    
    try {
      const response = await fetch(`${apiUrl}/users/pilotos/${pilotId}/horas-vuelo`, {
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
      const response = await fetch(`${apiUrl}/aviones/${aircraftId}/horas-vuelo`, {
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
    const statusTransitions = {
      'Planificado': ['Iniciado', 'Cancelado', 'Retrasado'],
      'Iniciado': ['En tiempo', 'Retrasado', 'Aterrizado'],
      'En tiempo': ['Aterrizado', 'Retrasado'],
      'Retrasado': ['Aterrizado', 'En tiempo'],
      'Aterrizado': [],
      'Cancelado': []
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
      <div className="mb-6 flex justify-between items-center">
        <div>
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
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Cerrar Sesión
        </button>
      </div>

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
                                handleStatusChange(flight, e.target.value);
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">
                          <div>{flightDuration} hrs (programadas)</div>
                          {flight.tiempoRetraso && flight.tiempoRetraso > 0 && (
                            <div className="text-orange-600 font-medium">
                              +{flight.tiempoRetraso.toFixed(2)} hrs retraso
                            </div>
                          )}
                          {flight.tiempoRetraso && flight.tiempoRetraso > 0 && (
                            <div className="text-blue-600 font-medium text-xs">
                              Total: {(flightDuration + flight.tiempoRetraso).toFixed(2)} hrs
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDelayModal && selectedFlightForDelay && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-96 max-w-90vw">
            <h2 className="text-xl font-bold mb-4 text-gray-800">
              Tiempo de Retraso
            </h2>
            
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Vuelo: {selectedFlightForDelay.origen} → {selectedFlightForDelay.destino}
              </p>
              {selectedFlightForDelay.tiempoRetraso > 0 && (
                <p className="text-sm text-orange-600">
                  Retraso actual: {selectedFlightForDelay.tiempoRetraso} horas
                </p>
              )}
            </div>
            
            <form onSubmit={handleDelaySubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tiempo de retraso adicional:
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="23"
                      step="1"
                      placeholder="Horas"
                      value={delayHours}
                      onChange={(e) => setDelayHours(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500">Horas</span>
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      min="0"
                      max="59"
                      step="1"
                      placeholder="Minutos"
                      value={delayMinutes}
                      onChange={(e) => setDelayMinutes(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-xs text-gray-500">Minutos</span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowDelayModal(false);
                    setSelectedFlightForDelay(null);
                    setDelayHours('');
                    setDelayMinutes('');
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500"
                >
                  Confirmar Retraso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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