import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, formatCurrency, formatNumberInput, parseNumberInput } from '../../utils/formatters';
import { HiOutlinePlus, HiOutlineTrash, HiOutlineCash, HiOutlineFilter } from 'react-icons/hi';

const Ingresos = () => {
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ monto: '', fecha: '', descripcion: '' });
  const [filterTipo, setFilterTipo] = useState('');
  const [error, setError] = useState('');

  const fetchIngresos = async () => {
    try {
      const params = {};
      if (filterTipo) params.tipo = filterTipo;
      const res = await api.get('/ingresos', { params });
      setIngresos(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadIngresos = async () => {
      try {
        const params = {};
        if (filterTipo) params.tipo = filterTipo;
        const res = await api.get('/ingresos', { params });
        setIngresos(res.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadIngresos();
  }, [filterTipo]);

  const total = ingresos.reduce((sum, i) => sum + parseFloat(i.monto || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form, monto: parseNumberInput(form.monto) };
      await api.post('/ingresos', data);
      setShowModal(false);
      setForm({ monto: '', fecha: '', descripcion: '' });
      fetchIngresos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al crear ingreso');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/ingresos/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchIngresos();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Ingresos</h1>
          <p className="text-dark-400 mt-1">Total: <span className="text-emerald-400 font-semibold">{formatCurrency(total)}</span></p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="btn-success flex items-center gap-2">
          <HiOutlinePlus className="text-lg" /> Ingreso Manual
        </button>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <HiOutlineFilter className="text-dark-500" />
          <select value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)} className="select-field max-w-xs">
            <option value="">Todos los tipos</option>
            <option value="automatico">Automáticos (pagos)</option>
            <option value="manual">Manuales</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : ingresos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineCash className="text-4xl text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No hay ingresos registrados</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Monto</th>
                  <th className="table-header">Descripción</th>
                  <th className="table-header">Tipo</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {ingresos.map((ingreso) => (
                  <tr key={ingreso.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="table-cell">{formatDate(ingreso.fecha)}</td>
                    <td className="table-cell font-medium text-emerald-400">{formatCurrency(ingreso.monto)}</td>
                    <td className="table-cell text-dark-300">{ingreso.descripcion || '-'}</td>
                    <td className="table-cell">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                        ingreso.tipo === 'automatico'
                          ? 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                          : 'bg-violet-500/20 text-violet-400 border-violet-500/30'
                      }`}>
                        {ingreso.tipo === 'automatico' ? 'Automático' : 'Manual'}
                      </span>
                    </td>
                    <td className="table-cell text-right">
                      {ingreso.tipo === 'manual' ? (
                        <button onClick={() => setDeleteConfirm(ingreso)}
                          className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <HiOutlineTrash />
                        </button>
                      ) : (
                        <span className="text-dark-600 text-xs">Auto</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Ingreso Manual">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Monto *</label>
            <input type="text" value={form.monto} onChange={(e) => setForm({ ...form, monto: formatNumberInput(e.target.value) })}
              className="input-field" required placeholder="1.000" />
          </div>
          <div>
            <label className="label-field">Fecha *</label>
            <input type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="input-field" placeholder="Descripción del ingreso" />
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-success flex-1">Registrar Ingreso</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Eliminar Ingreso" message="¿Eliminar este ingreso manual?" />
    </div>
  );
};

export default Ingresos;
