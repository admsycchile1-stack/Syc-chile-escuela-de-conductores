import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineUserGroup } from 'react-icons/hi';
import { formatRut } from '../../utils/formatters';

const InstructoresList = () => {
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ nombre: '', rut: '' });
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      const res = await api.get('/instructores');
      setInstructores(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', rut: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (inst) => {
    setEditing(inst);
    setForm({ nombre: inst.nombre, rut: inst.rut ? formatRut(inst.rut) : '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (editing) {
        await api.put(`/instructores/${editing.id}`, form);
      } else {
        await api.post('/instructores', form);
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/instructores/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetch();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar');
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Instructores</h1>
          <p className="text-dark-400 mt-1">{instructores.length} instructor(es)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="text-lg" /> Nuevo Instructor
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : instructores.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineUserGroup className="text-4xl text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400 text-lg">No hay instructores registrados</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {instructores.map((inst) => (
            <div key={inst.id} className="glass-card-hover p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500/20 to-primary-600/20 border border-primary-500/30 flex items-center justify-center">
                    <span className="text-primary-400 font-bold text-lg">{inst.nombre.charAt(0)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{inst.nombre}</h3>
                    <p className="text-dark-400 text-sm font-mono">{inst.rut}</p>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(inst)}
                    className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                    <HiOutlinePencil />
                  </button>
                  <button onClick={() => setDeleteConfirm(inst)}
                    className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editing ? 'Editar Instructor' : 'Nuevo Instructor'}>
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="label-field">RUT *</label>
            <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
              className="input-field" placeholder="12.345.678-9" required />
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Eliminar Instructor" message={`¿Eliminar a ${deleteConfirm?.nombre}?`} />
    </div>
  );
};

export default InstructoresList;
