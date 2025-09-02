import React from 'react';

const ProfileUser = () => {
  return (
    <div className="flex flex-col items-center bg-[#EAEFEF] p-6">
      <div className="flex items-center justify-between w-full max-w-md mb-6">
        <img
          src="https://c.superprof.com/i/a/24802214/11427094/600/20230217180414/expatriado-frances-viviendo-espana-ahora-ofrezco-mis-servicios-para-ensenar-frances-personas-todos-los-niveles.jpg"
          alt="Profile"
          className="w-32 h-32 rounded-lg object-cover"
        />
        <button className="bg-[#B8CFCE] text-[#333446] px-4 py-2 rounded hover:bg-[#7F8CAA] transition">
          Editar
        </button>
      </div>
      <div className="bg-[#333446] text-white p-6 rounded-lg w-full max-w-md">
        <div className="mb-4">
          <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
            Nombre Completo
          </button>
          <div className="bg-[#B8CFCE] h-8"></div>
        </div>
        <div className="mb-4">
          <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
            Fecha Nacimiento
          </button>
          <div className="bg-[#B8CFCE] h-8"></div>
        </div>
        <div className="mb-4">
          <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
            Genero
          </button>
          <div className="bg-[#B8CFCE] h-8"></div>
        </div>
        <div className="mb-4">
          <button className="w-full bg-[#7F8CAA] text-white py-2 rounded mb-2">
            Pasaporte
          </button>
          <div className="bg-[#B8CFCE] h-8"></div>
        </div>
      </div>
      <button className="mt-6 bg-[#7F8CAA] text-white px-4 py-2 rounded hover:bg-[#B8CFCE] transition">
        Cerrar Sesion
      </button>
    </div>
  );
};

export default ProfileUser;