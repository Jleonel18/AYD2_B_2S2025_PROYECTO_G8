import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import NavbarComponent from '../components/navbarComponent';
import { getUserInfo } from '../utils/auth';
const apiUrl = import.meta.env.VITE_API_URL;

const Historial = () => {
  const [vuelos, setVuelos] = useState([]);
  const [aviones, setAviones] = useState({});
  const [aeropuertos, setAeropuertos] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [selectedVuelo, setSelectedVuelo] = useState(null);

  // Fetch flight history, airports, and aircrafts
  useEffect(() => {
    const userInfo = getUserInfo();
    setUserInfo(userInfo);

    const fetchData = async () => {
      try {
        if (!userInfo || userInfo.tipo !== 'pasajero') {
          throw new Error('Acceso denegado: Solo los pasajeros pueden ver el historial');
        }

        const token = sessionStorage.getItem('token') || localStorage.getItem('token');
        if (!token) {
          throw new Error('No se encontró el token de autenticación');
        }

        // Fetch flight history
        const vuelosResponse = await fetch(`${apiUrl}/users/historial-vuelos`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!vuelosResponse.ok) {
          throw new Error(`Error HTTP: ${vuelosResponse.status} ${vuelosResponse.statusText}`);
        }
        const vuelosData = await vuelosResponse.json();
        if (!vuelosData.vuelos || !Array.isArray(vuelosData.vuelos)) {
          throw new Error('Datos de vuelos en formato incorrecto');
        }
        setVuelos(vuelosData.vuelos);

        // Fetch airport details
        const airportIds = [...new Set(vuelosData.vuelos.flatMap((vuelo) => [vuelo.origen, vuelo.destino]))];
        const airportsData = await Promise.all(
          airportIds.map(async (id) => {
            const response = await fetch(`${apiUrl}/aeropuertos/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const airport = await response.json();
              return { id, nombre: `${airport.nombre} (${airport.codigoIATA})` };
            }
            return { id, nombre: id };
          })
        );
        setAeropuertos(airportsData.reduce((acc, { id, nombre }) => ({ ...acc, [id]: nombre }), {}));

        // Fetch aircraft details
        const aircraftIds = [...new Set(vuelosData.vuelos.map((vuelo) => vuelo.aeronave))];
        const aircraftsData = await Promise.all(
          aircraftIds.map(async (id) => {
            const response = await fetch(`${apiUrl}/aviones/${id}`, {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });
            if (response.ok) {
              const aircraft = await response.json();
              return { id, modelo: `${aircraft.modelo} (${aircraft.numeroSerie})` };
            }
            return { id, modelo: id };
          })
        );
        setAviones(aircraftsData.reduce((acc, { id, modelo }) => ({ ...acc, [id]: modelo }), {}));
      } catch (error) {
        console.error('Error al obtener datos:', error);
        setError(error.message);
        toast.error(`Error: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Format date and time
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

  // Format time only
  const formatTime = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Format date only
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

  // Get flight title
  const getFlightTitle = (vuelo) => {
    const origen = aeropuertos[vuelo.origen] || 'Cargando...';
    const destino = aeropuertos[vuelo.destino] || 'Cargando...';
    return `${origen} → ${destino}`;
  };

  // Handle details click
  const handleDetailsClick = (vuelo) => {
    setSelectedVuelo(vuelo);
    setIsDetailModalOpen(true);
  };

  // Close detail modal
  const closeDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedVuelo(null);
  };

  if (isLoading) {
    return (
        <>
            <NavbarComponent />
            <div className="flex items-center justify-center min-h-screen bg-[#EAEFEF]">
                <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7F8CAA] mx-auto mb-4"></div>
                <p className="text-[#333446]">Cargando historial de vuelos...</p>
                </div>
            </div>
        </>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#EAEFEF]">
      <NavbarComponent />
      <div className="flex flex-col items-center p-6">
        <div className="w-full max-w-6xl mb-8">
          <h1 className="text-3xl font-bold text-[#333446] mb-2">Historial de Vuelos</h1>
          <p className="text-[#7F8CAA]">Revisa los vuelos que has tomado</p>
        </div>

        {error ? (
          <p className="text-red-600 text-center">Error: {error}</p>
        ) : !userInfo || userInfo.tipo !== 'pasajero' ? (
          <p className="text-red-600 text-center">Acceso denegado: Solo los pasajeros pueden ver el historial</p>
        ) : vuelos.length === 0 ? (
          <p className="text-[#7F8CAA] text-center">No tienes vuelos en tu historial.</p>
        ) : (
          <div className="grid gap-6 w-full max-w-6xl">
            {vuelos.map((vuelo) => (
              <div
                key={vuelo._id}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden"
              >
                <div className="flex flex-col md:flex-row">
                  {/* Flight Info Section */}
                  <div className="flex-1 p-6">
                    <div className="mb-4">
                      <h2 className="text-2xl font-bold text-[#333446] mb-2">{getFlightTitle(vuelo)}</h2>
                      <p className="text-[#7F8CAA] text-sm">{aviones[vuelo.aeronave] || 'Cargando...'}</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center">
                        <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-[#7F8CAA]">Salida</p>
                          <p className="font-semibold text-[#333446]">{formatTime(vuelo.fecha_salida)}</p>
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
                          <p className="font-semibold text-[#333446]">{formatDate(vuelo.fecha_salida)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <div className="bg-[#EAEFEF] p-2 rounded-lg mr-3">
                          <svg className="w-5 h-5 text-[#7F8CAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm text-[#7F8CAA]">Estado</p>
                          <p className="font-semibold text-[#333446]">{vuelo.estado}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleDetailsClick(vuelo)}
                        className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-6 py-2 rounded-lg transition-colors font-medium"
                      >
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                  {/* Image Section */}
                  <div className="w-full md:w-80 h-48 md:h-auto">
                    <img
                      src="https://www.eurosky-solutions.com/wp-content/uploads/2021/11/vuelo-charter.jpg"
                      alt={getFlightTitle(vuelo)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Flight Details Modal */}
        {isDetailModalOpen && selectedVuelo && (
          <div className="fixed inset-0 bg-black/30 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Modal Header */}
              <div className="bg-[#333446] text-white p-6 rounded-t-xl">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-2xl font-bold mb-2">{getFlightTitle(selectedVuelo)}</h2>
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
                        <p className="font-medium text-[#333446]">{selectedVuelo._id}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Aeronave</p>
                        <p className="font-medium text-[#333446]">{aviones[selectedVuelo.aeronave] || 'Cargando...'}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-1.447-.894L15 4m0 13V4m-6 3l6-3" />
                      </svg>
                      <div>
                        <p className="text-sm text-[#7F8CAA]">Estado</p>
                        <p className="font-medium text-[#333446]">{selectedVuelo.estado}</p>
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
                          <p className="font-semibold text-[#333446]">{formatDate(selectedVuelo.fecha_salida)}</p>
                        </div>
                      </div>
                      <div className="flex items-center mb-3">
                        <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-[#7F8CAA]">Hora de Salida</p>
                          <p className="font-semibold text-[#333446]">{formatTime(selectedVuelo.fecha_salida)}</p>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <svg className="w-5 h-5 text-[#7F8CAA] mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm text-[#7F8CAA]">Hora de Llegada</p>
                          <p className="font-semibold text-[#333446]">{formatTime(selectedVuelo.fecha_llegada)}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
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
                      <p className="font-semibold text-[#333446]">{aeropuertos[selectedVuelo.origen] || 'Cargando...'}</p>
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
                      <p className="font-semibold text-[#333446]">{aeropuertos[selectedVuelo.destino] || 'Cargando...'}</p>
                      <p className="text-sm text-[#7F8CAA]">Destino</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={closeDetailModal}
                    className="bg-gray-300 hover:bg-gray-400 text-[#333446] px-6 py-2 rounded-lg transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Historial;