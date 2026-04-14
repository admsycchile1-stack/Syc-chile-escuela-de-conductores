import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import StatusBadge from '../../components/common/StatusBadge';
import { formatDate, formatCurrency, formatNumberInput, parseNumberInput } from '../../utils/formatters';
import { buildFileUrl } from '../../utils/urls';
import {
  HiOutlineArrowLeft, HiOutlineUser, HiOutlinePhone, HiOutlineLocationMarker,
  HiOutlineCalendar, HiOutlineCash, HiOutlineClipboardCheck, HiOutlinePlus,
  HiOutlineTrash, HiOutlineCheckCircle, HiOutlineXCircle, HiOutlineUpload,
  HiOutlineDocumentText, HiOutlineIdentification, HiOutlineMail,
} from 'react-icons/hi';

const AlumnoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [alumno, setAlumno] = useState(null);
  const [examenes, setExamenes] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPagoModal, setShowPagoModal] = useState(false);
  const [pagoForm, setPagoForm] = useState({ monto: '', fecha: '', metodo_pago: '' });
  const [comprobanteFile, setComprobanteFile] = useState(null);
  const [pagoError, setPagoError] = useState('');

  const fetchAlumno = async () => {
    try {
      const res = await api.get(`/alumnos/${id}`);
      setAlumno(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const fetchExamenes = async () => {
    try {
      const res = await api.get(`/examenes/${id}`);
      setExamenes(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const [alumnoRes, examenesRes] = await Promise.all([
          api.get(`/alumnos/${id}`),
          api.get(`/examenes/${id}`),
        ]);

        setAlumno(alumnoRes.data);
        setExamenes(examenesRes.data);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setLoading(false);
      }
    };

    loadInitialData();
  }, [id]);

  const handleExamenToggle = async (field, value) => {
    try {
      const update = { [field]: value };
      if (value && !examenes[`${field}_fecha`]) {
        update[`${field}_fecha`] = new Date().toISOString().split('T')[0];
      }
      if (!value) {
        update[`${field}_fecha`] = null;
      }
      await api.put(`/examenes/${id}`, update);
      fetchExamenes();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleExamenFecha = async (field, value) => {
    try {
      await api.put(`/examenes/${id}`, { [field]: value || null });
      fetchExamenes();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handlePagoSubmit = async (e) => {
    e.preventDefault();
    setPagoError('');
    try {
      const formData = new FormData();
      formData.append('alumno_id', id);
      formData.append('monto', parseNumberInput(pagoForm.monto));
      formData.append('fecha', pagoForm.fecha);
      formData.append('metodo_pago', pagoForm.metodo_pago);
      if (comprobanteFile) formData.append('comprobante', comprobanteFile);

      await api.post('/pagos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowPagoModal(false);
      setPagoForm({ monto: '', fecha: '', metodo_pago: '' });
      setComprobanteFile(null);
      fetchAlumno();
    } catch (err) {
      setPagoError(err.response?.data?.error || 'Error al registrar pago');
    }
  };

  const handleDeletePago = async (pagoId) => {
    if (!window.confirm('¿Eliminar este pago?')) return;
    try {
      await api.delete(`/pagos/${pagoId}`);
      fetchAlumno();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const handleDocumentoUpload = async (tipo, file) => {
    if (!file) return;
    try {
      const formData = new FormData();
      formData.append('archivo', file);
      formData.append('tipoDocumento', tipo);
      
      await api.post(`/alumnos/${id}/documentos`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchAlumno();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al subir documento');
    }
  };

  const handleDocumentoDelete = async (tipo) => {
    const label = tipo === 'cedula' ? 'la cédula' : 'el contrato';
    if (!window.confirm(`¿Eliminar ${label} de este alumno?`)) return;

    try {
      await api.delete(`/alumnos/${id}/documentos/${tipo}`);
      fetchAlumno();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar documento');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (!alumno) {
    return (
      <div className="text-center py-12">
        <p className="text-dark-400">Alumno no encontrado</p>
        <button onClick={() => navigate('/alumnos')} className="btn-primary mt-4">Volver</button>
      </div>
    );
  }

  const examFields = [
    { key: 'psicotecnico_1', label: 'Psicotécnico 1' },
    { key: 'psicotecnico_2', label: 'Psicotécnico 2' },
    { key: 'psicotecnico_3', label: 'Psicotécnico 3' },
    { key: 'examen_teorico', label: 'Examen Teórico' },
    { key: 'examen_practico', label: 'Examen Práctico' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/alumnos')}
          className="p-2 rounded-xl text-dark-400 hover:text-white hover:bg-dark-800 transition-all">
          <HiOutlineArrowLeft className="text-xl" />
        </button>
        <div className="flex-1">
          <h1 className="page-title">{alumno.nombre}</h1>
          <p className="text-dark-400 font-mono mt-1">{alumno.rut}</p>
        </div>
        <StatusBadge status={alumno.estado} />
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Info */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineUser className="text-primary-400" /> Información Personal
          </h2>
          <div className="space-y-3">
            {[
              { icon: HiOutlineMail, label: 'Correo', value: alumno.email },
              { icon: HiOutlineUser, label: 'Edad', value: alumno.edad },
              { icon: HiOutlineLocationMarker, label: 'Dirección', value: alumno.direccion },
              { icon: HiOutlinePhone, label: 'Teléfono', value: alumno.telefono },
              { icon: HiOutlineCalendar, label: 'Fecha Inicio', value: formatDate(alumno.fecha_inicio) },
              { icon: HiOutlineCalendar, label: 'Fecha Término', value: formatDate(alumno.fecha_termino) },
              { icon: HiOutlineUser, label: 'Instructor', value: alumno.instructor?.nombre },
              { icon: HiOutlineCash, label: 'Medio de Pago', value: alumno.medio_pago },
              { icon: HiOutlineCash, label: 'Valor del Curso', value: alumno.valor_curso ? formatCurrency(alumno.valor_curso) : null },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="flex items-center gap-3 py-2 border-b border-dark-700/30 last:border-0">
                <Icon className="text-dark-500 text-lg flex-shrink-0" />
                <span className="text-dark-400 text-sm w-32">{label}</span>
                <span className="text-dark-200 text-sm">{value || '-'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Documents Section */}
        <div className="glass-card p-6 lg:col-span-2">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineDocumentText className="text-amber-400" /> Documentos del Alumno
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <HiOutlineIdentification className="text-blue-400" /> Cédula de Identidad
                </span>
              </div>
              {alumno.cedula_url ? (
                <div className="flex items-center gap-2 mb-2">
                  <a href={buildFileUrl(alumno.cedula_url)} target="_blank" rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                    Ver Documento Actual
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDocumentoDelete('cedula')}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <span className="text-dark-500 text-sm block mb-2">No subida</span>
              )}
              <label className="flex items-center gap-2 btn-secondary cursor-pointer text-xs w-fit">
                <HiOutlineUpload /> {alumno.cedula_url ? 'Actualizar' : 'Subir'}
                <input type="file" className="hidden" accept="image/*,.pdf"
                  onChange={(e) => handleDocumentoUpload('cedula', e.target.files[0])} />
              </label>
            </div>

            <div className="bg-dark-900/50 p-4 rounded-xl border border-dark-700/30">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-white flex items-center gap-2">
                  <HiOutlineDocumentText className="text-blue-400" /> Contrato
                </span>
              </div>
              {alumno.contrato_url ? (
                <div className="flex items-center gap-2 mb-2">
                  <a href={buildFileUrl(alumno.contrato_url)} target="_blank" rel="noopener noreferrer"
                    className="text-primary-400 hover:text-primary-300 text-sm flex items-center gap-1">
                    Ver Documento Actual
                  </a>
                  <button
                    type="button"
                    onClick={() => handleDocumentoDelete('contrato')}
                    className="text-red-400 hover:text-red-300 text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              ) : (
                <span className="text-dark-500 text-sm block mb-2">No subido</span>
              )}
              <label className="flex items-center gap-2 btn-secondary cursor-pointer text-xs w-fit">
                <HiOutlineUpload /> {alumno.contrato_url ? 'Actualizar' : 'Subir'}
                <input type="file" className="hidden" accept="image/*,.pdf"
                  onChange={(e) => handleDocumentoUpload('contrato', e.target.files[0])} />
              </label>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="glass-card p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <HiOutlineCash className="text-emerald-400" /> Resumen Financiero
          </h2>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-900/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 text-xs mb-1">Valor Curso</p>
              <p className="text-xl font-bold text-white">{alumno.valor_curso ? formatCurrency(alumno.valor_curso) : '-'}</p>
            </div>
            <div className="bg-dark-900/50 rounded-xl p-4 text-center">
              <p className="text-dark-400 text-xs mb-1">Total Pagado</p>
              <p className="text-xl font-bold text-emerald-400">{formatCurrency(alumno.total_pagado || 0)}</p>
            </div>
            <div className="bg-dark-900/50 rounded-xl p-4 text-center col-span-2">
              <p className="text-dark-400 text-xs mb-1">Saldo Pendiente</p>
              <p className={`text-xl font-bold ${alumno.saldo_pendiente > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {alumno.saldo_pendiente !== null ? formatCurrency(alumno.saldo_pendiente) : '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Exams */}
      <div className="glass-card p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <HiOutlineClipboardCheck className="text-blue-400" /> Exámenes
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {examenes && examFields.map(({ key, label }) => (
            <div key={key} className={`rounded-xl p-4 border transition-all ${
              examenes[key]
                ? 'bg-emerald-500/10 border-emerald-500/30'
                : 'bg-dark-900/50 border-dark-700/30'
            }`}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-dark-200">{label}</span>
                <button onClick={() => handleExamenToggle(key, !examenes[key])}
                  className={`p-1.5 rounded-lg transition-all ${
                    examenes[key] ? 'text-emerald-400 hover:bg-emerald-500/20' : 'text-dark-500 hover:bg-dark-700'
                  }`}>
                  {examenes[key] ? <HiOutlineCheckCircle className="text-xl" /> : <HiOutlineXCircle className="text-xl" />}
                </button>
              </div>
              <input type="date" value={examenes[`${key}_fecha`] || ''}
                onChange={(e) => handleExamenFecha(`${key}_fecha`, e.target.value)}
                className="input-field text-sm py-1.5" />
            </div>
          ))}
        </div>
      </div>

      {/* Payments */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <HiOutlineCash className="text-amber-400" /> Pagos
          </h2>
          <button onClick={() => { setShowPagoModal(true); setPagoError(''); }}
            className="btn-primary flex items-center gap-2 text-sm">
            <HiOutlinePlus /> Registrar Pago
          </button>
        </div>

        {alumno.pagos?.length === 0 ? (
          <p className="text-dark-500 text-center py-6">No hay pagos registrados</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-700/50">
                  <th className="table-header">Fecha</th>
                  <th className="table-header">Monto</th>
                  <th className="table-header">Método</th>
                  <th className="table-header">Comprobante</th>
                  <th className="table-header text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-dark-700/30">
                {alumno.pagos?.map((pago) => (
                  <tr key={pago.id} className="hover:bg-dark-800/40 transition-colors">
                    <td className="table-cell">{formatDate(pago.fecha)}</td>
                    <td className="table-cell font-medium text-emerald-400">{formatCurrency(pago.monto)}</td>
                    <td className="table-cell capitalize">{pago.metodo_pago || '-'}</td>
                    <td className="table-cell">
                      {pago.comprobante_url ? (
                        <a href={buildFileUrl(pago.comprobante_url)} target="_blank" rel="noopener noreferrer"
                          className="text-primary-400 hover:text-primary-300 text-sm">Ver</a>
                      ) : '-'}
                    </td>
                    <td className="table-cell text-right">
                      <button onClick={() => handleDeletePago(pago.id)}
                        className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <HiOutlineTrash />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payment Modal */}
      <Modal isOpen={showPagoModal} onClose={() => setShowPagoModal(false)} title="Registrar Pago">
        {pagoError && (
          <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{pagoError}</div>
        )}
        <form onSubmit={handlePagoSubmit} className="space-y-4">
          <div>
            <label className="label-field">Monto *</label>
            <input type="text" value={pagoForm.monto} onChange={(e) => setPagoForm({ ...pagoForm, monto: formatNumberInput(e.target.value) })}
              className="input-field" required placeholder="1.000" />
          </div>
          <div>
            <label className="label-field">Fecha *</label>
            <input type="date" value={pagoForm.fecha} onChange={(e) => setPagoForm({ ...pagoForm, fecha: e.target.value })}
              className="input-field" required />
          </div>
          <div>
            <label className="label-field">Método de Pago</label>
            <select value={pagoForm.metodo_pago} onChange={(e) => setPagoForm({ ...pagoForm, metodo_pago: e.target.value })}
              className="select-field">
              <option value="">Seleccionar</option>
              <option value="efectivo">Efectivo</option>
              <option value="transferencia">Transferencia</option>
              <option value="tarjeta">Tarjeta</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="label-field">Comprobante</label>
            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 btn-secondary cursor-pointer text-sm">
                <HiOutlineUpload /> Seleccionar archivo
                <input type="file" className="hidden" accept="image/*,.pdf"
                  onChange={(e) => setComprobanteFile(e.target.files[0])} />
              </label>
              {comprobanteFile && <span className="text-dark-400 text-sm truncate">{comprobanteFile.name}</span>}
            </div>
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowPagoModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Registrar Pago</button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AlumnoDetail;
