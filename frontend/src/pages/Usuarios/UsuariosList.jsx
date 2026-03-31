import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash } from 'react-icons/hi';

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');

  const fetch = async () => {
    try {
      const res = await api.get('/usuarios');
      setUsuarios(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm({ nombre: '', email: '', password: '' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (user) => {
    setEditing(user);
    setForm({ nombre: user.nombre, email: user.email, password: '' });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form };
      if (editing && !data.password) delete data.password;

      if (editing) {
        await api.put(`/usuarios/${editing.id}`, data);
      } else {
        await api.post('/usuarios', data);
      }
      setShowModal(false);
      fetch();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/usuarios/${deleteConfirm.id}`);
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
          <h1 className="page-title">Usuarios</h1>
          <p className="text-dark-400 mt-1">{usuarios.length} usuario(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="text-lg" /> Nuevo Usuario
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {usuarios.map((user) => (
            <div key={user.id} className="glass-card-hover p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500/20 to-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                    <span className="text-violet-400 font-bold text-lg">{user.nombre.charAt(0).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{user.nombre}</h3>
                    <p className="text-dark-400 text-sm">{user.email}</p>
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-primary-500/20 text-primary-400 border border-primary-500/30 mt-1">
                      Administrador
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(user)}
                    className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all">
                    <HiOutlinePencil />
                  </button>
                  <button onClick={() => setDeleteConfirm(user)}
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
        title={editing ? 'Editar Usuario' : 'Nuevo Usuario'}>
        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="label-field">Email *</label>
            <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="label-field">{editing ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</label>
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input-field" {...(!editing && { required: true })} minLength={4} />
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">{editing ? 'Guardar' : 'Crear'}</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Eliminar Usuario" message={`¿Eliminar a ${deleteConfirm?.nombre}?`} />
    </div>
  );
};

export default UsuariosList;
