import React, { useState, useEffect } from 'react';
import NavbarComponent from '../components/navbarComponent';
import { useNavigate } from 'react-router-dom';

const apiUrl = import.meta.env.VITE_API_URL;

const MainPage = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState({});
  const [aircrafts, setAircrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const hasToken = !!sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isPasajero = hasToken && user.tipo === 'pasajero';
  const navigate = useNavigate();

  useEffect(() => {
    setLoading(true);
    fetch(`${apiUrl}/vuelos/planificados`, {
      headers: hasToken ? { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } : {},
    })
      .then((response) => response.json())
      .then((data) => {
        setFlights(data);
        const airportIds = [...new Set(data.flatMap(flight => [flight.origen, flight.destino]))];
        const aircraftIds = [...new Set(data.map(flight => flight.aeronave))];
        return Promise.all([
          ...airportIds.map(id =>
            fetch(`${apiUrl}/aeropuertos/${id}`, {
              headers: hasToken ? { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } : {},
            })
              .then(res => res.json())
              .then(airport => ({ id, nombre: airport.nombre || airport.name || id }))
              .catch(error => {
                console.error(`Error fetching airport ${id}:`, error);
                return { id, nombre: id };
              })
          ),
          ...aircraftIds.map(id =>
            fetch(`${apiUrl}/aviones/${id}`, {
              headers: hasToken ? { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` } : {},
            })
              .then(res => res.json())
              .then(aircraft => ({ id, modelo: aircraft.modelo || aircraft.model || id }))
              .catch(error => {
                console.error(`Error fetching aircraft ${id}:`, error);
                return { id, modelo: id };
              })
          )
        ]);
      })
      .then(results => {
        const newAirports = results
          .filter(r => 'nombre' in r)
          .reduce((acc, { id, nombre }) => ({ ...acc, [id]: nombre }), {});
        const newAircrafts = results
          .filter(r => 'modelo' in r)
          .reduce((acc, { id, modelo }) => ({ ...acc, [id]: modelo }), {});
        setAirports(newAirports);
        setAircrafts(newAircrafts);
      })
      .catch((error) => console.error('Error fetching flights or airports/aircrafts:', error))
      .finally(() => setLoading(false));
  }, []);

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).replace(/ de /g, ' ');
  };

  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const navigateToReservar = (id) => {
    navigate('/reservar?id_vuelo=' + id);
  };

  const handleDetailsClick = (flight) => {
    setSelectedFlight(flight);
    setIsDetailModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedFlight(null);
  };

  const getFlightTitle = (flight) => {
    const origen = airports[flight.origen] || 'Cargando...';
    const destino = airports[flight.destino] || 'Cargando...';
    return `${origen} → ${destino}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#EAEFEF]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F8CAA] mx-auto mb-4"></div>
          <p className="text-[#333446]">Cargando vuelos...</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <NavbarComponent />
      <div className="flex flex-col items-center bg-[#EAEFEF] p-6 min-h-screen">
        {/* Header Section */}
        <div className="w-full max-w-6xl mb-8">
          <h1 className="text-3xl font-bold text-[#333446] mb-2">Vuelos Disponibles</h1>
          <p className="text-[#7F8CAA]">Encuentra y reserva tu próximo vuelo</p>
        </div>

        {/* Filters Section */}
        {/* <div className="flex mb-6 w-full max-w-6xl">
          <button className="bg-[#7F8CAA] hover:bg-[#6c7a8a] text-white px-6 py-2 rounded-lg mr-3 transition-colors">
            Filtros
          </button>
          <button className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-6 py-2 rounded-lg transition-colors">
            Francia
          </button>
          <button className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-6 py-2 rounded-lg ml-auto transition-colors">
            Buscar
          </button>
        </div> */}

        {/* Flights Grid */}
        <div className="grid gap-6 w-full max-w-6xl">
          {flights.map((flight) => (
            <div key={flight._id} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden">
              <div className="flex">
                {/* Flight Info Section */}
                <div className="flex-1 p-6">
                  {/* Flight Title */}
                  <div className="mb-4">
                    <h2 className="text-2xl font-bold text-[#333446] mb-2">
                      {getFlightTitle(flight)}
                    </h2>
                    <p className="text-[#7F8CAA] text-sm">
                      {aircrafts[flight.aeronave] || 'Cargando...'}
                    </p>
                  </div>

                  {/* Flight Details Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Salida</p>
                        <p className="font-semibold text-[#333446]">{formatTime(flight.fecha_salida)}</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Fecha</p>
                        <p className="font-semibold text-[#333446]">
                          {new Date(flight.fecha_salida).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                        <svg className="w-5 h-5 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Precio</p>
                        <p className="font-semibold text-[#333446]">Consultar</p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    {isPasajero && (
                      <button
                        onClick={() => navigateToReservar(flight._id)}
                        className="bg-[#7F8CAA] hover:bg-[#6c7a8a] text-white px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        Reservar Ahora
                      </button>
                    )}
                    <button 
                      onClick={() => handleDetailsClick(flight)}
                      className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-6 py-2 rounded-lg transition-colors font-medium"
                    >
                      Ver Detalles
                    </button>
                  </div>
                </div>

                {/* Image Section */}
                <div className="w-80 h-48 md:h-auto">
                  <img
                    src="https://www.eurosky-solutions.com/wp-content/uploads/2021/11/vuelo-charter.jpg"
                    alt={getFlightTitle(flight)}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Login Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-xl w-full max-w-md mx-4">
            <h2 className="text-2xl font-bold mb-4 text-[#333446]">
              Necesitas iniciar sesión
            </h2>
            <p className="text-[#7F8CAA] mb-6">
              Por favor, inicia sesión para reservar un vuelo.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-6 py-2 rounded-lg transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Flight Details Modal */}
      {isDetailModalOpen && selectedFlight && (
        <div className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="bg-[#333446] text-white p-6 rounded-t-xl">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold mb-2">
                    {getFlightTitle(selectedFlight)}
                  </h2>
                  <p className="text-[#B8CFCE]">Detalles del Vuelo</p>
                </div>
                <button
                  onClick={closeDetailModal}
                  className="text-white hover:text-[#B8CFCE] transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {/* Flight Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <h3 className="text-lg font-semibold text-[#333446] mb-2">Información del Vuelo</h3>
                  </div>
                  
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <div>
                      <p className="text-sm text-[#7F8CAA]">ID del Vuelo</p>
                      <p className="font-medium text-[#333446]">{selectedFlight._id}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                    </svg>
                    <div>
                      <p className="text-sm text-[#7F8CAA]">Aeronave</p>
                      <p className="font-medium text-[#333446]">{aircrafts[selectedFlight.aeronave] || 'Cargando...'}</p>
                    </div>
                  </div>

                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <div>
                      <p className="text-sm text-[#7F8CAA]">Precio</p>
                      <p className="font-medium text-[#333446]">Consultar disponibilidad</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-b border-gray-200 pb-3">
                    <h3 className="text-lg font-semibold text-[#333446] mb-2">Horarios</h3>
                  </div>
                  
                  <div className="bg-[#EAEFEF] p-4 rounded-lg">
                    <div className="flex items-center mb-3">
                      <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Fecha de Salida</p>
                        <p className="font-semibold text-[#333446]">{formatDate(selectedFlight.fecha_salida)}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Hora de Salida</p>
                        <p className="font-semibold text-[#333446]">{formatTime(selectedFlight.fecha_salida)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Route Information */}
              <div className="mb-6">
                <div className="border-b border-gray-200 pb-3 mb-4">
                  <h3 className="text-lg font-semibold text-[#333446]">Ruta</h3>
                </div>
                <div className="flex items-center justify-center">
                  <div className="text-center">
                    <div className="bg-[#7F8CAA] text-white p-3 rounded-full mb-2 mx-auto w-fit">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-[#333446]">{airports[selectedFlight.origen] || 'Cargando...'}</p>
                    <p className="text-sm text-[#7F8CAA]">Origen</p>
                  </div>
                  
                  <div className="mx-8">
                    <svg className="w-12 h-6 text-[#B8CFCE]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                  
                  <div className="text-center">
                    <div className="bg-[#B8CFCE] text-[#333446] p-3 rounded-full mb-2 mx-auto w-fit">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <p className="font-semibold text-[#333446]">{airports[selectedFlight.destino] || 'Cargando...'}</p>
                    <p className="text-sm text-[#7F8CAA]">Destino</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 justify-end">
                <button
                  onClick={closeDetailModal}
                  className="bg-gray-300 hover:bg-gray-400 text-[#333446] px-6 py-2 rounded-lg transition-colors"
                >
                  Cerrar
                </button>
                {isPasajero && (
                  <button
                    onClick={() => {
                      closeDetailModal();
                      navigateToReservar(selectedFlight._id);
                    }}
                    className="bg-[#7F8CAA] hover:bg-[#6c7a8a] text-white px-6 py-2 rounded-lg transition-colors font-medium"
                  >
                    Reservar Vuelo
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;