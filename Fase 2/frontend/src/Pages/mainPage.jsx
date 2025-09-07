import React from 'react';
import NavbarComponent from '../components/navbarComponent';

const MainPage = () => {
  return (<div>
      <NavbarComponent />
      <div className="flex flex-col items-center bg-[#EAEFEF] p-6 min-h-screen">
        <div className="flex mb-4 w-full max-w-4xl">
          <button className="bg-[#7F8CAA] text-white px-4 py-2 rounded mr-2">Filtros</button>
          <button className="bg-[#B8CFCE] text-[#333446] px-4 py-2 rounded">Francia</button>
          <button className="bg-[#B8CFCE] text-[#333446] px-4 py-2 rounded ml-auto">Buscar</button>
      </div>
      <div className="space-y-4 w-full max-w-4xl">
        <div className="bg-[#333446] text-white p-4 rounded-lg flex items-center">
          <div className="w-2/3">
            <p>Vuelo: Alemania</p>
            <p>Aerolínea: AE</p>
            <p>Horario: 21:00</p>
            <p>Precio: $200.00</p>
            <div className="mt-2">
              <button className="bg-[#7F8CAA] hover:bg-[#6c7a8a] text-white px-4 py-2 rounded mr-2">Reservar</button>
              <button className="bg-[#B8CFCE] hover:bg-[#a3b3b3] text-[#333446] px-4 py-2 rounded">Detalles</button>
            </div>
          </div>
          <img src="germany.jpg" alt="Germany" className="w-1/3 h-32 object-cover rounded-r-lg" />
        </div>
      </div>
    </div>
  </div>
  );
};

export default MainPage;