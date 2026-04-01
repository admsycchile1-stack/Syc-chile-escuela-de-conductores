import React, { useEffect, useMemo, useState } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import {
  formatCurrency,
  formatDate,
  formatDecimalInput,
  formatNumberInput,
  parseDecimalInput,
  parseNumberInput,
} from '../../utils/formatters';
import { exportFuelReportToExcel } from '../../utils/excel';
import {
  HiOutlinePlus,
  HiOutlinePencil,
  HiOutlineTrash,
  HiOutlineTruck,
  HiOutlineCalendar,
  HiOutlineDownload,
  HiOutlineSearch,
} from 'react-icons/hi';

const initialForm = {
  fecha: '',
  patente: '',
  litros: '',
  precio_cargado: '',
  kilometros_recorridos: '',
};

const CombustibleList = () => {
  const [registros, setRegistros] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [filters, setFilters] = useState({
    patente: '',
    fecha_desde: '',
    fecha_hasta: '',
  });

  const fetchRegistros = async () => {
    try {
      const params = {};
      if (filters.patente) params.patente = filters.patente;
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;

      const res = await api.get('/combustible', { params });
      setRegistros(res.data);
    } catch (err) {
      console.error('Error al cargar combustible:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, [filters.patente, filters.fecha_desde, filters.fecha_hasta]);

  const resumen = useMemo(() => {
    const totalLitros = registros.reduce((sum, item) => sum + Number(item.litros || 0), 0);
    const totalPrecio = registros.reduce((sum, item) => sum + Number(item.precio_cargado || 0), 0);
    const totalKilometros = registros.reduce((sum, item) => sum + Number(item.kilometros_recorridos || 0), 0);

    return {
      totalLitros,
      totalPrecio,
      totalKilometros,
      rendimientoPromedio: totalLitros > 0 ? totalKilometros / totalLitros : 0,
    };
  }, [registros]);

  const openCreate = () => {
    setEditing(null);
    setForm(initialForm);
    setError('');
    setShowModal(true);
  };

  const openEdit = (registro) => {
    setEditing(registro);
    setForm({
      fecha: registro.fecha || '',
      patente: registro.patente || '',
      litros: formatDecimalInput(registro.litros),
      precio_cargado: formatNumberInput(registro.precio_cargado),
      kilometros_recorridos: formatNumberInput(registro.kilometros_recorridos),
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const data = {
        fecha: form.fecha,
        patente: form.patente.trim().toUpperCase(),
        litros: parseDecimalInput(form.litros),
        precio_cargado: parseNumberInput(form.precio_cargado),
        kilometros_recorridos: parseNumberInput(form.kilometros_recorridos),
      };

      if (editing) {
        await api.put(`/combustible/${editing.id}`, data);
      } else {
        await api.post('/combustible', data);
      }

      setShowModal(false);
      setForm(initialForm);
      fetchRegistros();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el registro');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/combustible/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchRegistros();
    } catch (err) {
      console.error('Error al eliminar registro:', err);
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Combustible</h1>
          <p className="text-dark-400 mt-1">Registro diario de carga y kilometraje por vehículo</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => exportFuelReportToExcel({ ...filters, registros })}
            className="btn-success flex items-center gap-2 justify-center"
            disabled={registros.length === 0}
          >
            <HiOutlineDownload className="text-lg" /> Exportar Excel
          </button>
          <button onClick={openCreate} className="btn-primary flex items-center gap-2 justify-center">
            <HiOutlinePlus className="text-lg" /> Nuevo Registro
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="glass-card p-5">
          <p className="text-dark-400 text-sm mb-2">Total litros</p>
          <p className="text-2xl font-bold text-white">{resumen.totalLitros.toFixed(2)} L</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-dark-400 text-sm mb-2">Total cargado</p>
          <p className="text-2xl font-bold text-emerald-400">{formatCurrency(resumen.totalPrecio)}</p>
        </div>
        <div className="glass-card p-5">
          <p className="text-dark-400 text-sm mb-2">Kilómetros recorridos</p>
          <p className="text-2xl font-bold text-blue-400">
            {new Intl.NumberFormat('es-CL').format(resumen.totalKilometros)} km
          </p>
        </div>
        <div className="glass-card p-5">
          <p className="text-dark-400 text-sm mb-2">Rendimiento promedio</p>
          <p className="text-2xl font-bold text-amber-400">{resumen.rendimientoPromedio.toFixed(2)} km/L</p>
        </div>
      </div>

      <div className="glass-card p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="relative">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text"
            value={filters.patente}
            onChange={(e) => setFilters((current) => ({ ...current, patente: e.target.value.toUpperCase() }))}
            className="input-field pl-10"
            placeholder="Buscar por patente..."
          />
        </div>
        <div className="relative">
          <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="date"
            value={filters.fecha_desde}
            onChange={(e) => setFilters((current) => ({ ...current, fecha_desde: e.target.value }))}
            className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <HiOutlineCalendar className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="date"
            value={filters.fecha_hasta}
            onChange={(e) => setFilters((current) => ({ ...current, fecha_hasta: e.target.value }))}
            className="input-field pl-10"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : registros.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineTruck className="text-4xl text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No hay registros de combustible</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Patente</th>
                  <th className="table-header">Litros</th>
                  <th className="table-header">Precio Cargado</th>
                  <th className="table-header">Km Recorridos</th>
                  <th className="table-header hidden xl:table-cell">Rendimiento</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {registros.map((registro) => (
                  <tr key={registro.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="table-cell">{formatDate(registro.fecha)}</td>
                    <td className="table-cell font-medium text-white">{registro.patente}</td>
                    <td className="table-cell text-dark-300">{Number(registro.litros || 0).toFixed(2)} L</td>
                    <td className="table-cell text-emerald-400 font-medium">{formatCurrency(registro.precio_cargado)}</td>
                    <td className="table-cell text-dark-300">
                      {new Intl.NumberFormat('es-CL').format(registro.kilometros_recorridos || 0)} km
                    </td>
                    <td className="table-cell hidden xl:table-cell text-amber-400">
                      {Number(registro.rendimiento_km_litro || 0).toFixed(2)} km/L
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(registro)}
                          className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="Editar"
                        >
                          <HiOutlinePencil className="text-lg" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(registro)}
                          className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Eliminar"
                        >
                          <HiOutlineTrash className="text-lg" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editing ? 'Editar Registro de Combustible' : 'Nuevo Registro de Combustible'}
      >
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Fecha *</label>
              <input
                type="date"
                value={form.fecha}
                onChange={(e) => setForm((current) => ({ ...current, fecha: e.target.value }))}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="label-field">Patente *</label>
              <input
                type="text"
                value={form.patente}
                onChange={(e) => setForm((current) => ({ ...current, patente: e.target.value.toUpperCase() }))}
                className="input-field uppercase"
                placeholder="ABCD12"
                required
              />
            </div>
            <div>
              <label className="label-field">Litros *</label>
              <input
                type="text"
                value={form.litros}
                onChange={(e) => setForm((current) => ({ ...current, litros: formatDecimalInput(e.target.value) }))}
                className="input-field"
                placeholder="42,5"
                required
              />
            </div>
            <div>
              <label className="label-field">Precio Cargado *</label>
              <input
                type="text"
                value={form.precio_cargado}
                onChange={(e) => setForm((current) => ({ ...current, precio_cargado: formatNumberInput(e.target.value) }))}
                className="input-field"
                placeholder="50.000"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="label-field">Kilómetros Recorridos del Día *</label>
              <input
                type="text"
                value={form.kilometros_recorridos}
                onChange={(e) => setForm((current) => ({ ...current, kilometros_recorridos: formatNumberInput(e.target.value) }))}
                className="input-field"
                placeholder="120"
                required
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              {editing ? 'Guardar Cambios' : 'Registrar'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Eliminar Registro"
        message={`¿Eliminar el registro de ${deleteConfirm?.patente || 'este vehículo'} del ${formatDate(deleteConfirm?.fecha)}?`}
      />
    </div>
  );
};

export default CombustibleList;
