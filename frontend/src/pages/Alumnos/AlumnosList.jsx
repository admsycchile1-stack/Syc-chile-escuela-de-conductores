import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatRut, formatNumberInput, parseNumberInput } from '../../utils/formatters';
import {
  HiOutlinePlus, HiOutlineSearch, HiOutlinePencil, HiOutlineTrash,
  HiOutlineEye, HiOutlineFilter,
} from 'react-icons/hi';

const AlumnosList = () => {
  const [alumnos, setAlumnos] = useState([]);
  const [instructores, setInstructores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterEstado, setFilterEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingAlumno, setEditingAlumno] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({
    nombre: '', rut: '', email: '', edad: '', direccion: '', telefono: '', fecha_inicio: '',
    fecha_termino: '', instructor_id: '', medio_pago: '', valor_curso: '', estado: 'en_curso',
  });
  const [error, setError] = useState('');

  const fetchAlumnos = async () => {
    try {
      const params = {};
      if (search) params.search = search;
      if (filterEstado) params.estado = filterEstado;
      const res = await api.get('/alumnos', { params });
      setAlumnos(res.data);
    } catch (err) {
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructores = async () => {
    try {
      const res = await api.get('/instructores');
      setInstructores(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    const loadAlumnos = async () => {
      try {
        const params = {};
        if (search) params.search = search;
        if (filterEstado) params.estado = filterEstado;
        const res = await api.get('/alumnos', { params });
        setAlumnos(res.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadAlumnos();
  }, [search, filterEstado]);

  useEffect(() => {
    fetchInstructores();
  }, []);

  const openCreate = () => {
    setEditingAlumno(null);
    setForm({
      nombre: '', rut: '', email: '', edad: '', direccion: '', telefono: '', fecha_inicio: '',
      fecha_termino: '', instructor_id: '', medio_pago: '', valor_curso: '', estado: 'en_curso',
    });
    setError('');
    setShowModal(true);
  };

  const openEdit = (alumno) => {
    setEditingAlumno(alumno);
    setForm({
      nombre: alumno.nombre || '',
      rut: alumno.rut ? formatRut(alumno.rut) : '',
      email: alumno.email || '',
      edad: alumno.edad ?? '',
      direccion: alumno.direccion || '',
      telefono: alumno.telefono || '',
      fecha_inicio: alumno.fecha_inicio || '',
      fecha_termino: alumno.fecha_termino || '',
      instructor_id: alumno.instructor_id || '',
      medio_pago: alumno.medio_pago || '',
      valor_curso: alumno.valor_curso ? formatNumberInput(alumno.valor_curso) : '',
      estado: alumno.estado || 'en_curso',
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const data = { ...form };
      if (!data.instructor_id) delete data.instructor_id;
      if (!data.valor_curso) {
        delete data.valor_curso;
      } else {
        data.valor_curso = parseNumberInput(data.valor_curso);
      }

      if (editingAlumno) {
        await api.put(`/alumnos/${editingAlumno.id}`, data);
      } else {
        await api.post('/alumnos', data);
      }
      setShowModal(false);
      fetchAlumnos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/alumnos/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchAlumnos();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Alumnos</h1>
          <p className="text-dark-400 mt-1">{alumnos.length} alumno(s) registrado(s)</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2" id="btn-crear-alumno">
          <HiOutlinePlus className="text-lg" /> Nuevo Alumno
        </button>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <HiOutlineSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <input
            type="text" placeholder="Buscar por nombre, RUT o correo..." value={search}
            onChange={(e) => setSearch(e.target.value)} className="input-field pl-10"
          />
        </div>
        <div className="relative">
          <HiOutlineFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-500" />
          <select value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)} className="select-field pl-10 pr-8">
            <option value="">Todos los estados</option>
            <option value="en_curso">En Curso</option>
            <option value="finalizado">Finalizado</option>
            <option value="abandonado">Abandonado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : alumnos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-dark-400 text-lg">No se encontraron alumnos</p>
          <p className="text-dark-500 text-sm mt-1">Crea un nuevo alumno para comenzar</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="table-header">Nombre</th>
                  <th className="table-header">RUT</th>
                  <th className="table-header hidden xl:table-cell">Correo</th>
                  <th className="table-header hidden 2xl:table-cell">Edad</th>
                  <th className="table-header hidden md:table-cell">Instructor</th>
                  <th className="table-header hidden lg:table-cell">Inicio</th>
                  <th className="table-header">Estado</th>
                  <th className="table-header hidden lg:table-cell">Valor Curso</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {alumnos.map((alumno) => (
                  <tr key={alumno.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="table-cell font-medium text-white">{alumno.nombre}</td>
                    <td className="table-cell font-mono text-dark-300">{alumno.rut}</td>
                    <td className="table-cell hidden xl:table-cell text-dark-300">
                      {alumno.email || '-'}
                    </td>
                    <td className="table-cell hidden 2xl:table-cell text-dark-300">
                      {alumno.edad ?? '-'}
                    </td>
                    <td className="table-cell hidden md:table-cell text-dark-300">
                      {alumno.instructor?.nombre || '-'}
                    </td>
                    <td className="table-cell hidden lg:table-cell text-dark-300">
                      {formatDate(alumno.fecha_inicio)}
                    </td>
                    <td className="table-cell"><StatusBadge status={alumno.estado} /></td>
                    <td className="table-cell hidden lg:table-cell text-dark-300">
                      {alumno.valor_curso ? formatCurrency(alumno.valor_curso) : '-'}
                    </td>
                    <td className="table-cell text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link to={`/alumnos/${alumno.id}`}
                          className="p-2 rounded-lg text-dark-400 hover:text-primary-400 hover:bg-primary-500/10 transition-all"
                          title="Ver detalle">
                          <HiOutlineEye className="text-lg" />
                        </Link>
                        <button onClick={() => openEdit(alumno)}
                          className="p-2 rounded-lg text-dark-400 hover:text-amber-400 hover:bg-amber-500/10 transition-all"
                          title="Editar">
                          <HiOutlinePencil className="text-lg" />
                        </button>
                        <button onClick={() => setDeleteConfirm(alumno)}
                          className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all"
                          title="Eliminar">
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

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editingAlumno ? 'Editar Alumno' : 'Nuevo Alumno'} size="lg">
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label-field">Nombre Completo *</label>
              <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                className="input-field" required />
            </div>
            <div>
              <label className="label-field">RUT *</label>
              <input type="text" value={form.rut} onChange={(e) => setForm({ ...form, rut: formatRut(e.target.value) })}
                className="input-field" placeholder="12.345.678-9" required />
            </div>
            <div>
              <label className="label-field">Correo Electrónico</label>
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-field" placeholder="alumno@correo.com" />
            </div>
            <div>
              <label className="label-field">Edad</label>
              <input type="number" value={form.edad} onChange={(e) => setForm({ ...form, edad: e.target.value })}
                className="input-field" min="0" max="120" placeholder="18" />
            </div>
            <div>
              <label className="label-field">Dirección</label>
              <input type="text" value={form.direccion} onChange={(e) => setForm({ ...form, direccion: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Teléfono</label>
              <input type="text" value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Fecha de Inicio</label>
              <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Fecha de Término</label>
              <input type="date" value={form.fecha_termino} onChange={(e) => setForm({ ...form, fecha_termino: e.target.value })}
                className="input-field" />
            </div>
            <div>
              <label className="label-field">Instructor</label>
              <select value={form.instructor_id} onChange={(e) => setForm({ ...form, instructor_id: e.target.value })}
                className="select-field">
                <option value="">Sin asignar</option>
                {instructores.map((i) => (
                  <option key={i.id} value={i.id}>{i.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label-field">Medio de Pago</label>
              <select value={form.medio_pago} onChange={(e) => setForm({ ...form, medio_pago: e.target.value })}
                className="select-field">
                <option value="">Seleccionar</option>
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
                <option value="tarjeta">Tarjeta</option>
                <option value="otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="label-field">Valor del Curso</label>
              <input type="text" value={form.valor_curso} onChange={(e) => setForm({ ...form, valor_curso: formatNumberInput(e.target.value) })}
                className="input-field" placeholder="120.000" />
            </div>
            <div>
              <label className="label-field">Estado</label>
              <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value })}
                className="select-field">
                <option value="en_curso">En Curso</option>
                <option value="finalizado">Finalizado</option>
                <option value="abandonado">Abandonado</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">
              {editingAlumno ? 'Guardar Cambios' : 'Crear Alumno'}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Eliminar Alumno" message={`¿Está seguro de eliminar a ${deleteConfirm?.nombre}? Se eliminarán también sus exámenes, pagos e ingresos asociados.`} />
    </div>
  );
};

export default AlumnosList;
