import React, { useState, useEffect } from 'react';

const VuelosPage = () => {
  const [flights, setFlights] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [airports, setAirports] = useState([]);
  const [workers, setWorkers] = useState({ pilots: [], cabinCrew: [] });
  const [aircrafts, setAircrafts] = useState([]);
  const [formData, setFormData] = useState({
    origen: '',
    destino: '',
    fecha_salida: '',
    fecha_llegada: '',
    aeronave: '',
    piloto_id: '',
    copiloto_id: '',
    sobrecargos: [],
  });
  const [errorMessage, setErrorMessage] = useState('');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [maxSobrecargos, setMaxSobrecargos] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const token = sessionStorage.getItem('token');
      if (!token) console.error('No token found in sessionStorage');
      try {
        // Fetch flights
        const flightsResponse = await fetch('http://localhost:3000/api/vuelos', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (flightsResponse.ok) {
          const data = await flightsResponse.json();
          setFlights(data);
        } else {
          console.error('Failed to fetch flights:', await flightsResponse.text());
        }

        // Fetch airports
        const airportsResponse = await fetch('http://localhost:3000/api/aeropuertos/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (airportsResponse.ok) {
          const data = await airportsResponse.json();
          setAirports(data);
        } else {
          console.error('Failed to fetch airports:', await airportsResponse.text());
        }

        // Fetch workers
        const workersResponse = await fetch('http://localhost:3000/api/users/trabajadores', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (workersResponse.ok) {
          const data = await workersResponse.json();
          const pilots = data.trabajadores.filter(w => w.tipo === 'piloto');
          const cabinCrew = data.trabajadores.filter(w => w.tipo === 'sobrecargo');
          setWorkers({ pilots, cabinCrew });
        } else {
          console.error('Failed to fetch workers:', await workersResponse.text());
        }

        // Fetch aircrafts
        const aircraftsResponse = await fetch('http://localhost:3000/api/aviones/', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
        if (aircraftsResponse.ok) {
          const data = await aircraftsResponse.json();
          setAircrafts(data);
        } else {
          console.error('Failed to fetch aircrafts:', await aircraftsResponse.text());
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const getStatusColor = (estado) => {
    switch (estado) {
      case 'Planificado': return 'text-blue-500';
      case 'Iniciado': return 'text-green-500';
      case 'En tiempo': return 'text-green-500';
      case 'Retrasado': return 'text-orange-500';
      case 'Cancelado': return 'text-red-500';
      case 'Aterrizado': return 'text-purple-500';
      default: return 'text-gray-500';
    }
  };

  // Helper function to get airport name by ID
  const getAirportName = (airportId) => {
    const airport = airports.find(a => a._id === airportId);
    return airport ? airport.nombre : airportId;
  };

  // Helper function to get aircraft model by ID
  const getAircraftModel = (aircraftId) => {
    const aircraft = aircrafts.find(a => a._id === aircraftId);
    return aircraft ? aircraft.modelo : aircraftId;
  };

  // Helper function to get worker name by ID
  const getWorkerName = (workerId) => {
    const worker = [...workers.pilots, ...workers.cabinCrew].find(w => w._id === workerId);
    return worker ? worker.nombre : workerId;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let newFormData = { ...formData, [name]: value };
    if (name === 'aeronave') {
      const selectedAircraft = aircrafts.find(a => a._id === value);
      if (selectedAircraft) {
        const req = Math.ceil(selectedAircraft.capacidadMaxima / 50);
        setMaxSobrecargos(req);
        newFormData.sobrecargos = Array(req).fill('');
      } else {
        setMaxSobrecargos(0);
        newFormData.sobrecargos = [];
      }
    }
    setFormData(newFormData);
  };

  const handleSobrecargoChange = (index, value) => {
    const newSobrecargos = [...formData.sobrecargos];
    newSobrecargos[index] = value;
    setFormData((prev) => ({ ...prev, sobrecargos: newSobrecargos }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    if (formData.piloto_id && formData.piloto_id === formData.copiloto_id) {
      setErrorMessage('El piloto y el copiloto deben ser diferentes.');
      return;
    }
    if (formData.aeronave) {
      const assignedSobrecargos = formData.sobrecargos.filter(id => id);
      if (assignedSobrecargos.length !== maxSobrecargos) {
        setErrorMessage(`Debes asignar exactamente ${maxSobrecargos} sobrecargos.`);
        return;
      }
      const uniqueSobrecargos = new Set(assignedSobrecargos);
      if (uniqueSobrecargos.size !== maxSobrecargos) {
        setErrorMessage('Los sobrecargos deben ser únicos, sin duplicados.');
        return;
      }
    }
    const tripulacion = {
      piloto_id: formData.piloto_id,
      copiloto_id: formData.copiloto_id,
      sobrecargos: formData.sobrecargos.filter(id => id),
    };

    const payload = {
      origen: formData.origen,
      destino: formData.destino,
      fecha_salida: formData.fecha_salida + 'Z',
      fecha_llegada: formData.fecha_llegada + 'Z',
      aeronave: formData.aeronave,
      estado: 'Planificado',
      tripulacion,
    };

    try {
      const response = await fetch('http://localhost:3000/api/vuelos', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newFlight = await response.json();
        setFlights((prev) => [...prev, newFlight]);
        setShowForm(false);
        setFormData({
          origen: '',
          destino: '',
          fecha_salida: '',
          fecha_llegada: '',
          aeronave: '',
          piloto_id: '',
          copiloto_id: '',
          sobrecargos: [],
        });
        setErrorMessage('');
        setMaxSobrecargos(0);
      } else {
        const errorText = await response.text();
        setErrorMessage(errorText || 'Error desconocido al crear el vuelo');
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage('Error de conexión al crear el vuelo');
    }
  };

  const handleViewDetails = (flight) => {
    setSelectedFlight(flight);
    setShowDetails(true);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Lista de Vuelos</h1>
        <button onClick={() => setShowForm(true)} className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
          + Nuevo Vuelo
        </button>
      </div>
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-200 text-gray-700">
            <tr>
              <th className="p-4 border-b-2 border-gray-300">ID</th>
              <th className="p-4 border-b-2 border-gray-300">Origen</th>
              <th className="p-4 border-b-2 border-gray-300">Destino</th>
              <th className="p-4 border-b-2 border-gray-300">Salida</th>
              <th className="p-4 border-b-2 border-gray-300">Llegada</th>
              <th className="p-4 border-b-2 border-gray-300">Aeronave</th>
              <th className="p-4 border-b-2 border-gray-300">Estado</th>
              <th className="p-4 border-b-2 border-gray-300">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {flights.map((flight) => (
              <tr key={flight._id} className="hover:bg-gray-100 transition duration-150">
                <td className="p-4 border-b border-gray-200">{flight._id}</td>
                <td className="p-4 border-b border-gray-200">{getAirportName(flight.origen)}</td>
                <td className="p-4 border-b border-gray-200">{getAirportName(flight.destino)}</td>
                <td className="p-4 border-b border-gray-200">{new Date(flight.fecha_salida).toLocaleString()}</td>
                <td className="p-4 border-b border-gray-200">{new Date(flight.fecha_llegada).toLocaleString()}</td>
                <td className="p-4 border-b border-gray-200">{getAircraftModel(flight.aeronave)}</td>
                <td className="p-4 border-b border-gray-200">
                  <span className={getStatusColor(flight.estado)}>{flight.estado}</span>
                </td>
                <td className="p-4 border-b border-gray-200 text-center">
                  <button onClick={() => handleViewDetails(flight)} className="text-blue-500 mr-3 hover:text-blue-700"><span role="img" aria-label="view">👁️</span></button>
                  <button className="text-red-500 hover:text-red-700"><span role="img" aria-label="delete">❌</span></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-4 text-sm text-gray-600 flex space-x-4">
        <span className="text-blue-500">Planificado</span>
        <span className="text-green-500">Iniciado</span>
        <span className="text-green-500">En tiempo</span>
        <span className="text-orange-500">Retrasado</span>
        <span className="text-red-500">Cancelado</span>
        <span className="text-purple-500">Aterrizado</span>
      </div>

      {showForm && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Nuevo Vuelo</h2>
            {errorMessage && (
              <div className="mb-4 p-4 bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg flex justify-between items-center">
                <span>{errorMessage}</span>
                <button
                  onClick={() => setErrorMessage('')}
                  className="ml-4 text-yellow-700 hover:text-yellow-900"
                >
                  <span role="img" aria-label="close">✖️</span>
                </button>
              </div>
            )}
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block mb-2 text-gray-700">Origen</label>
                  <select
                    name="origen"
                    value={formData.origen}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un aeropuerto</option>
                    {airports.map((airport) => (
                      <option key={airport._id} value={airport._id}>
                        {airport.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Destino</label>
                  <select
                    name="destino"
                    value={formData.destino}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un aeropuerto</option>
                    {airports.map((airport) => (
                      <option key={airport._id} value={airport._id}>
                        {airport.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Fecha Salida (ISO)</label>
                  <input
                    type="datetime-local"
                    name="fecha_salida"
                    value={formData.fecha_salida}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Fecha Llegada (ISO)</label>
                  <input
                    type="datetime-local"
                    name="fecha_llegada"
                    value={formData.fecha_llegada}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Aeronave</label>
                  <select
                    name="aeronave"
                    value={formData.aeronave}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona una aeronave</option>
                    {aircrafts.map((aircraft) => (
                      <option key={aircraft._id} value={aircraft._id}>
                        {aircraft.modelo}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Piloto</label>
                  <select
                    name="piloto_id"
                    value={formData.piloto_id}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un piloto</option>
                    {workers.pilots.map((pilot) => (
                      <option key={pilot._id} value={pilot._id}>
                        {pilot.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block mb-2 text-gray-700">Copiloto</label>
                  <select
                    name="copiloto_id"
                    value={formData.copiloto_id}
                    onChange={handleInputChange}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Selecciona un copiloto</option>
                    {workers.pilots.map((pilot) => (
                      <option key={pilot._id} value={pilot._id}>
                        {pilot.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="mt-6">
                {formData.sobrecargos.length > 0 && (
                  <>
                    <label className="block mb-2 text-gray-700">Sobrecargos (requeridos: {maxSobrecargos})</label>
                    {formData.sobrecargos.map((sobrecargo, index) => {
                      const availableCrew = workers.cabinCrew.filter((crew) =>
                        !formData.sobrecargos.some((id, i) => i !== index && id === crew._id)
                      );
                      return (
                        <select
                          key={index}
                          value={sobrecargo}
                          onChange={(e) => handleSobrecargoChange(index, e.target.value)}
                          className="w-full p-3 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Selecciona un sobrecargo</option>
                          {availableCrew.map((crew) => (
                            <option key={crew._id} value={crew._id}>
                              {crew.nombre}
                            </option>
                          ))}
                        </select>
                      );
                    })}
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-end sticky bottom-0 bg-white pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => { setShowForm(false); setErrorMessage(''); }}
                  className="bg-gray-500 text-white px-6 py-2 rounded-lg mr-4 hover:bg-gray-600 transition duration-200"
                >
                  Cancelar
                </button>
                <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-200">
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDetails && selectedFlight && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/30 bg-opacity-50 flex items-center justify-center overflow-y-auto">
          <div className="bg-white p-6 rounded-lg w-3/4 max-h-[85vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Detalles del Vuelo</h2>
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-gray-700"><strong>ID:</strong> {selectedFlight._id}</p>
                <p className="text-gray-700"><strong>Origen:</strong> {getAirportName(selectedFlight.origen)}</p>
                <p className="text-gray-700"><strong>Destino:</strong> {getAirportName(selectedFlight.destino)}</p>
                <p className="text-gray-700"><strong>Salida:</strong> {new Date(selectedFlight.fecha_salida).toLocaleString()}</p>
                <p className="text-gray-700"><strong>Llegada:</strong> {new Date(selectedFlight.fecha_llegada).toLocaleString()}</p>
                <p className="text-gray-700"><strong>Aeronave:</strong> {getAircraftModel(selectedFlight.aeronave)}</p>
                <p className="text-gray-700"><strong>Estado:</strong> <span className={getStatusColor(selectedFlight.estado)}>{selectedFlight.estado}</span></p>
                <p className="text-gray-700"><strong>Creado:</strong> {new Date(selectedFlight.createdAt).toLocaleString()}</p>
                <p className="text-gray-700"><strong>Actualizado:</strong> {new Date(selectedFlight.updatedAt).toLocaleString()}</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-gray-800">Tripulación</h3>
                <p className="text-gray-700"><strong>Piloto:</strong> {getWorkerName(selectedFlight.tripulacion.piloto_id)}</p>
                <p className="text-gray-700"><strong>Copiloto:</strong> {getWorkerName(selectedFlight.tripulacion.copiloto_id)}</p>
                <p className="text-gray-700"><strong>Sobrecargos:</strong> {selectedFlight.tripulacion.sobrecargos.map(id => getWorkerName(id)).join(', ')}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetails(false)}
                className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition duration-200"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VuelosPage;