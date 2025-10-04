import { useState, useEffect } from 'react';

const apiUrl = import.meta.env.VITE_API_URL;

const AvionesPage = () => {
  const [aviones, setAviones] = useState([]);
  const [aeropuertos, setAeropuertos] = useState([]); // Nuevo estado para aeropuertos
  const [newAvion, setNewAvion] = useState({
    modelo: '',
    capacidadMaxima: '',
    estado: 'Disponible',
    numeroSerie: '',
    horas_Vuelo: '',
    limite_horas: '',
    id_aeropuerto_actual: ''
  });
  const [editingAvion, setEditingAvion] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedAvion, setSelectedAvion] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const estadoColors = {
    'Disponible': 'green-500',
    'En vuelo': 'blue-500',
    'Mantenimiento': 'yellow-500',
    'Fuera de servicio': 'red-500',
    'Reservado': 'purple-500'
  };

  const estadoOptions = ['Disponible', 'En vuelo', 'Mantenimiento', 'Fuera de servicio', 'Reservado'];

  // Function to determine progress bar color based on percentage
  const getProgressBarColor = (percentage) => {
    if (percentage <= 50) return 'bg-green-500'; // Green for low usage
    if (percentage <= 75) return 'bg-yellow-500'; // Yellow for medium usage
    return 'bg-red-500'; // Red for high usage
  };

  useEffect(() => {
    fetchAviones();
    fetchAeropuertos(); // Cargar aeropuertos al iniciar
  }, []);

  const fetchAviones = async () => {
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/aviones/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al cargar los aviones');
      const data = await response.json();
      setAviones(data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para cargar aeropuertos
  const fetchAeropuertos = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/aeropuertos/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setAeropuertos(data);
      }
    } catch (err) {
      console.error('Error al cargar aeropuertos:', err);
    }
  };

  const handleCreateAvion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/aviones/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newAvion,
          capacidadMaxima: parseInt(newAvion.capacidadMaxima),
          horas_Vuelo: parseInt(newAvion.horas_Vuelo) || 0,
          limite_horas: parseInt(newAvion.limite_horas),
          id_aeropuerto_actual: newAvion.id_aeropuerto_actual || null
        }),
      });
      if (!response.ok) throw new Error('Error al crear el avión');
      const data = await response.json();
      setAviones([...aviones, data]);
      setNewAvion({
        modelo: '',
        capacidadMaxima: '',
        estado: 'Disponible',
        numeroSerie: '',
        horas_Vuelo: '',
        limite_horas: '',
        id_aeropuerto_actual: ''
      });
      setShowCreateForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEditAvion = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/aviones/${editingAvion._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...editingAvion,
          capacidadMaxima: parseInt(editingAvion.capacidadMaxima),
          horas_Vuelo: parseInt(editingAvion.horas_Vuelo),
          limite_horas: parseInt(editingAvion.limite_horas),
          id_aeropuerto_actual: editingAvion.id_aeropuerto_actual || null
        }),
      });
      if (!response.ok) throw new Error('Error al actualizar el avión');
      const updatedAvion = await response.json();
      setAviones(aviones.map(avion => avion._id === updatedAvion._id ? updatedAvion : avion));
      setEditingAvion(null);
      setShowEditForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAvion = async (id) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este avión?')) return;
    
    setLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const response = await fetch(`${apiUrl}/aviones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Error al eliminar el avión');
      setAviones(aviones.filter(avion => avion._id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openEditForm = (avion) => {
    setEditingAvion({ ...avion });
    setShowEditForm(true);
  };

  const getMantenimientoStatus = (horas_vuelo, limite_horas) => {
    const porcentaje = (horas_vuelo / limite_horas) * 100;
    if (porcentaje >= 90) return { color: 'text-red-600', text: 'Crítico' };
    if (porcentaje >= 75) return { color: 'text-yellow-600', text: 'Atención' };
    return { color: 'text-green-600', text: 'Normal' };
  };

  // Función para obtener el nombre del aeropuerto por ID
  const getAeropuertoNombre = (id) => {
    const aeropuerto = aeropuertos.find(a => a._id === id);
    return aeropuerto ? `${aeropuerto.nombre} (${aeropuerto.codigo})` : 'No asignado';
  };

  if (loading && aviones.length === 0) {
    return <div className="ml-64 p-6">Cargando aviones...</div>;
  }

  if (error) {
    return <div className="ml-64 p-6 text-red-500">Error: {error}</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Gestión de Aviones</h1>
        <button
          data-cy="nuevo-avion-button"
          onClick={() => setShowCreateForm(true)}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition duration-200"
        >
          + Nuevo Avión
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-green-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-green-800">Disponibles</h3>
          <p className="text-2xl font-bold text-green-600">
            {aviones.filter(a => a.estado === 'Disponible').length}
          </p>
        </div>
        <div className="bg-blue-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-blue-800">En Vuelo</h3>
          <p className="text-2xl font-bold text-blue-600">
            {aviones.filter(a => a.estado === 'En vuelo').length}
          </p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800">Mantenimiento</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {aviones.filter(a => a.estado === 'Mantenimiento').length}
          </p>
        </div>
        <div className="bg-gray-100 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800">Total</h3>
          <p className="text-2xl font-bold text-gray-600">{aviones.length}</p>
        </div>
      </div>

      {/* Tabla de aviones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Modelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Número de Serie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Capacidad
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Aeropuerto Actual
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Horas de Vuelo
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Mantenimiento
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {aviones.map((avion) => {
              const mantenimientoStatus = getMantenimientoStatus(avion.horas_Vuelo, avion.limite_horas);
              const percentage = (avion.horas_Vuelo / avion.limite_horas) * 100;
              return (
                <tr key={avion._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {avion.modelo}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {avion.numeroSerie}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {avion.capacidadMaxima} pasajeros
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white bg-${estadoColors[avion.estado]}`}>
                      {avion.estado}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {getAeropuertoNombre(avion.id_aeropuerto_actual)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {avion.horas_Vuelo} / {avion.limite_horas} hrs
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className={`${getProgressBarColor(percentage)} h-2 rounded-full`}
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`text-sm font-medium ${mantenimientoStatus.color}`}>
                      {mantenimientoStatus.text}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedAvion(avion)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Ver detalles"
                    >
                      👁️
                    </button>
                    <button
                      onClick={() => openEditForm(avion)}
                      className="text-yellow-600 hover:text-yellow-900"
                      title="Editar"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteAvion(avion._id)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal para crear avión */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Avión</h2>
            <form onSubmit={handleCreateAvion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={newAvion.modelo}
                  onChange={(e) => setNewAvion({ ...newAvion, modelo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={newAvion.numeroSerie}
                  onChange={(e) => setNewAvion({ ...newAvion, numeroSerie: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  value={newAvion.capacidadMaxima}
                  onChange={(e) => setNewAvion({ ...newAvion, capacidadMaxima: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={newAvion.estado}
                  onChange={(e) => setNewAvion({ ...newAvion, estado: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  {estadoOptions.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aeropuerto Actual
                </label>
                <select
                  value={newAvion.id_aeropuerto_actual}
                  onChange={(e) => setNewAvion({ ...newAvion, id_aeropuerto_actual: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar aeropuerto</option>
                  {aeropuertos.map(aeropuerto => (
                    <option key={aeropuerto._id} value={aeropuerto._id}>
                      {aeropuerto.nombre} ({aeropuerto.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas de Vuelo
                </label>
                <input
                  type="number"
                  value={newAvion.horas_Vuelo}
                  onChange={(e) => setNewAvion({ ...newAvion, horas_Vuelo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Horas
                </label>
                <input
                  type="number"
                  value={newAvion.limite_horas}
                  onChange={(e) => setNewAvion({ ...newAvion, limite_horas: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowCreateForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Creando...' : 'Crear Avión'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para editar avión */}
      {showEditForm && editingAvion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 max-h-screen overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Avión</h2>
            <form onSubmit={handleEditAvion}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Modelo
                </label>
                <input
                  type="text"
                  value={editingAvion.modelo}
                  onChange={(e) => setEditingAvion({ ...editingAvion, modelo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Número de Serie
                </label>
                <input
                  type="text"
                  value={editingAvion.numeroSerie}
                  onChange={(e) => setEditingAvion({ ...editingAvion, numeroSerie: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Capacidad Máxima
                </label>
                <input
                  type="number"
                  value={editingAvion.capacidadMaxima}
                  onChange={(e) => setEditingAvion({ ...editingAvion, capacidadMaxima: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado
                </label>
                <select
                  value={editingAvion.estado}
                  name="estado"
                  data-cy="select-estado"
                  onChange={(e) => setEditingAvion({ ...editingAvion, estado: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  {estadoOptions.map(estado => (
                    <option key={estado} value={estado}>{estado}</option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Aeropuerto Actual
                </label>
                <select
                  value={editingAvion.id_aeropuerto_actual || ''}
                  onChange={(e) => setEditingAvion({ ...editingAvion, id_aeropuerto_actual: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar aeropuerto</option>
                  {aeropuertos.map(aeropuerto => (
                    <option key={aeropuerto._id} value={aeropuerto._id}>
                      {aeropuerto.nombre} ({aeropuerto.codigo})
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Horas de Vuelo
                </label>
                <input
                  type="number"
                  value={editingAvion.horas_Vuelo}
                  onChange={(e) => setEditingAvion({ ...editingAvion, horas_Vuelo: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  min="0"
                />
              </div>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Límite de Horas
                </label>
                <input
                  type="number"
                  value={editingAvion.limite_horas}
                  onChange={(e) => setEditingAvion({ ...editingAvion, limite_horas: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                />
              </div>
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setEditingAvion(null);
                  }}
                  className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para ver detalles del avión */}
      {selectedAvion && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Detalles del Avión</h2>
            <div className="space-y-3">
              <div>
                <strong className="text-gray-700">ID:</strong>
                <p className="text-gray-600">{selectedAvion._id}</p>
              </div>
              <div>
                <strong className="text-gray-700">Modelo:</strong>
                <p className="text-gray-600">{selectedAvion.modelo}</p>
              </div>
              <div>
                <strong className="text-gray-700">Número de Serie:</strong>
                <p className="text-gray-600">{selectedAvion.numeroSerie}</p>
              </div>
              <div>
                <strong className="text-gray-700">Capacidad Máxima:</strong>
                <p className="text-gray-600">{selectedAvion.capacidadMaxima} pasajeros</p>
              </div>
              <div>
                <strong className="text-gray-700">Estado:</strong>
                <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full text-white bg-${estadoColors[selectedAvion.estado]} ml-2`}>
                  {selectedAvion.estado}
                </span>
              </div>
              <div>
                <strong className="text-gray-700">Aeropuerto Actual:</strong>
                <p className="text-gray-600">{getAeropuertoNombre(selectedAvion.id_aeropuerto_actual)}</p>
              </div>
              <div>
                <strong className="text-gray-700">Horas de Vuelo:</strong>
                <p className="text-gray-600">{selectedAvion.horas_Vuelo} horas</p>
              </div>
              <div>
                <strong className="text-gray-700">Límite de Horas:</strong>
                <p className="text-gray-600">{selectedAvion.limite_horas} horas</p>
              </div>
              <div>
                <strong className="text-gray-700">Progreso de Mantenimiento:</strong>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                  <div
                    className={`${getProgressBarColor((selectedAvion.horas_Vuelo / selectedAvion.limite_horas) * 100)} h-2 rounded-full`}
                    style={{ width: `${(selectedAvion.horas_Vuelo / selectedAvion.limite_horas) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  {Math.round((selectedAvion.horas_Vuelo / selectedAvion.limite_horas) * 100)}% completado
                </p>
              </div>
            </div>
            <button
              onClick={() => setSelectedAvion(null)}
              className="mt-6 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvionesPage;