import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate, formatCurrency, formatNumberInput, parseNumberInput } from '../../utils/formatters';
import { buildFileUrl } from '../../utils/urls';
import {
  HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineTrendingDown,
  HiOutlineUpload, HiOutlineFilter, HiOutlineTag,
} from 'react-icons/hi';

const Egresos = () => {
  const [egresos, setEgresos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showCatModal, setShowCatModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [filterCategoria, setFilterCategoria] = useState('');
  const [form, setForm] = useState({ monto: '', fecha: '', categoria_id: '', descripcion: '' });
  const [archivoFile, setArchivoFile] = useState(null);
  const [catForm, setCatForm] = useState({ nombre: '' });
  const [error, setError] = useState('');
  const [catError, setCatError] = useState('');

  const fetchEgresos = async () => {
    try {
      const params = {};
      if (filterCategoria) params.categoria_id = filterCategoria;
      const res = await api.get('/egresos', { params });
      setEgresos(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  const fetchCategorias = async () => {
    try {
      const res = await api.get('/categorias');
      setCategorias(res.data);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    const loadEgresos = async () => {
      try {
        const params = {};
        if (filterCategoria) params.categoria_id = filterCategoria;
        const res = await api.get('/egresos', { params });
        setEgresos(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadEgresos();
  }, [filterCategoria]);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const total = egresos.reduce((sum, e) => sum + parseFloat(e.monto || 0), 0);

  const openCreate = () => {
    setEditing(null);
    setForm({ monto: '', fecha: '', categoria_id: '', descripcion: '' });
    setArchivoFile(null);
    setError('');
    setShowModal(true);
  };

  const openEdit = (egreso) => {
    setEditing(egreso);
    setForm({
      monto: egreso.monto ? formatNumberInput(egreso.monto) : '', fecha: egreso.fecha,
      categoria_id: egreso.categoria_id, descripcion: egreso.descripcion || '',
    });
    setArchivoFile(null);
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const formData = new FormData();
      formData.append('monto', parseNumberInput(form.monto));
      formData.append('fecha', form.fecha);
      formData.append('categoria_id', form.categoria_id);
      formData.append('descripcion', form.descripcion);
      if (archivoFile) formData.append('archivo', archivoFile);

      if (editing) {
        await api.put(`/egresos/${editing.id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/egresos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setShowModal(false);
      fetchEgresos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/egresos/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchEgresos();
    } catch (err) { console.error(err); setDeleteConfirm(null); }
  };

  const handleCatSubmit = async (e) => {
    e.preventDefault();
    setCatError('');
    try {
      await api.post('/categorias', catForm);
      setShowCatModal(false);
      setCatForm({ nombre: '' });
      fetchCategorias();
    } catch (err) {
      setCatError(err.response?.data?.error || 'Error al crear categoría');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Egresos</h1>
          <p className="text-dark-400 mt-1">Total: <span className="text-red-400 font-semibold">{formatCurrency(total)}</span></p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setShowCatModal(true); setCatError(''); }}
            className="btn-secondary flex items-center gap-2">
            <HiOutlineTag /> Categorías
          </button>
          <button onClick={openCreate} className="btn-danger flex items-center gap-2">
            <HiOutlinePlus className="text-lg" /> Nuevo Egreso
          </button>
        </div>
      </div>

      <div className="glass-card p-4">
        <div className="flex items-center gap-3">
          <HiOutlineFilter className="text-dark-500" />
          <select value={filterCategoria} onChange={(e) => setFilterCategoria(e.target.value)} className="select-field max-w-xs">
            <option value="">Todas las categorías</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : egresos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineTrendingDown className="text-4xl text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No hay egresos registrados</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Monto</th>
                  <th className="table-header">Categoría</th>
                  <th className="table-header hidden md:table-cell">Descripción</th>
                  <th className="table-header hidden md:table-cell">Archivo</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {egresos.map((egreso) => (
                  <tr key={egreso.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="table-cell">{formatDate(egreso.fecha)}</td>
                    <td className="table-cell font-medium text-red-400">{formatCurrency(egreso.monto)}</td>
                    <td className="table-cell">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-dark-700 text-dark-300 border border-dark-600">
                        {egreso.categoria?.nombre || '-'}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell text-dark-300">{egreso.descripcion || '-'}</td>
                    <td className="table-cell hidden md:table-cell">
                      {egreso.archivo_url ? (
                        <a href={buildFileUrl(egreso.archivo_url)} target="_blank" rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm">Ver</a>
                      ) : '-'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => openEdit(egreso)}
                          className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                          <HiOutlinePencil />
                        </button>
                        <button onClick={() => setDeleteConfirm(egreso)}
                          className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                          <HiOutlineTrash />
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

      {/* Egreso Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Editar Egreso' : 'Nuevo Egreso'}>
        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
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
          </div>
          <div>
            <label className="label-field">Categoría *</label>
            <select value={form.categoria_id} onChange={(e) => setForm({ ...form, categoria_id: e.target.value })}
              className="select-field" required>
              <option value="">Seleccionar</option>
              {categorias.map((c) => <option key={c.id} value={c.id}>{c.nombre}</option>)}
            </select>
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <input type="text" value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="input-field" />
          </div>
          <div>
            <label className="label-field">Boleta / Factura</label>
            <label className="flex items-center gap-2 btn-secondary cursor-pointer text-sm w-fit">
              <HiOutlineUpload /> Seleccionar archivo
              <input type="file" className="hidden" accept="image/*,.pdf" onChange={(e) => setArchivoFile(e.target.files[0])} />
            </label>
            {archivoFile && <span className="text-dark-400 text-sm mt-1 block">{archivoFile.name}</span>}
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      {/* Category Modal */}
      <Modal isOpen={showCatModal} onClose={() => setShowCatModal(false)} title="Nueva Categoría" size="sm">
        {catError && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{catError}</div>}
        <form onSubmit={handleCatSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nombre de la categoría *</label>
            <input type="text" value={catForm.nombre} onChange={(e) => setCatForm({ nombre: e.target.value })}
              className="input-field" required placeholder="Ej: Combustible" />
          </div>
          <div className="mb-4">
            <p className="text-dark-400 text-sm mb-2">Categorías existentes:</p>
            <div className="flex flex-wrap gap-2">
              {categorias.map((c) => (
                <span key={c.id} className="px-3 py-1 bg-dark-700 text-dark-300 rounded-lg text-xs border border-dark-600">
                  {c.nombre}
                </span>
              ))}
              {categorias.length === 0 && <span className="text-dark-500 text-xs">Ninguna</span>}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowCatModal(false)} className="btn-secondary flex-1">Cerrar</button>
            <button type="submit" className="btn-primary flex-1">Crear Categoría</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Eliminar Egreso" message="¿Eliminar este egreso?" />
    </div>
  );
};

export default Egresos;
