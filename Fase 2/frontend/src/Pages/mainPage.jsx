import React, { useState, useEffect } from 'react';
import NavbarComponent from '../components/navbarComponent';

const apiUrl = import.meta.env.VITE_API_URL;

const MainPage = () => {
  const [flights, setFlights] = useState([]);
  const [airports, setAirports] = useState({});
  const [aircrafts, setAircrafts] = useState({});
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const hasToken = !!sessionStorage.getItem('token');
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const isPasajero = hasToken && user.tipo === 'pasajero';

  useEffect(() => {
    setLoading(true); // Inicia carga
    fetch(`${apiUrl}/vuelos`, {
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
              .then(aircraft => ({ id, modelo: aircraft.modelo || aircraft.model || id })) // Fallback a ID si no hay modelo
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
      .finally(() => setLoading(false)); // Finaliza carga
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

  const handleReserveClick = () => {
    if (!hasToken) {
      setIsModalOpen(true);
    } else {
      console.log('Proceeding with reservation');
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen bg-[#EAEFEF]">Cargando...</div>;
  }

  return (
    <div>
      <NavbarComponent />
      <div className="flex flex-col items-center bg-[#EAEFEF] p-6 min-h-screen">
        <div className="flex mb-4 w-full max-w-4xl">
          <button className="bg-[#7F8CAA] text-white px-4 py-2 rounded mr-2">Filtros</button>
          <button className="bg-[#B8CFCE] text-[#333446] px-4 py-2 rounded">Francia</button>
          <button className="bg-[#B8CFCE] text-[#333446] px-4 py-2 rounded ml-auto">Buscar</button>
        </div>
        <div className="space-y-4 w-full max-w-4xl">
          {flights.map((flight) => (
            <div key={flight._id} className="bg-[#333446] text-white p-4 rounded-lg flex items-center">
              <div className="w-2/3">
                <p>Vuelo: {airports[flight.origen] || 'Cargando...'} - {airports[flight.destino] || 'Cargando...'}</p>
                <p>Aeronave: {aircrafts[flight.aeronave] || 'Cargando...'}</p>
                <p>Horario: {formatDateTime(flight.fecha_salida)}</p>
                <p>Precio: No disponible</p>
                <div className="mt-2">
                  {isPasajero && (
                    <button
                      onClick={handleReserveClick}
                      className="bg-[#7F8CAA] hover:bg-[#6c7a8a] text-white px-4 py-2 rounded mr-2"
                    >
                      Reservar
                    </button>
                  )}
                  <button className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-4 py-2 rounded">Detalles</button>
                </div>
              </div>
              <img
                src="https://www.eurosky-solutions.com/wp-content/uploads/2021/11/vuelo-charter.jpg"
                alt={`${flight.origen}-${flight.destino}`}
                className="w-1/3 h-32 object-cover rounded-r-lg"
              />
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-2xl font-bold mb-4 text-[#333446]">
              Necesitas iniciar sesión
            </h2>
            <p className="text-[#333446] mb-4">
              Por favor, inicia sesión para reservar un vuelo.
            </p>
            <div className="flex justify-end">
              <button
                onClick={closeModal}
                className="bg-gray-300 text-[#333446] px-4 py-2 rounded hover:bg-gray-400 transition"
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

export default MainPage;