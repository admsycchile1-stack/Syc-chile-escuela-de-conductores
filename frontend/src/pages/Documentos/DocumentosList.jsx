import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import Modal from '../../components/common/Modal';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import { formatDate } from '../../utils/formatters';
import { buildApiUrl } from '../../utils/urls';
import {
  HiOutlinePlus, HiOutlineTrash, HiOutlineDownload, HiOutlineDocumentText,
  HiOutlineUpload,
} from 'react-icons/hi';

const DocumentosList = () => {
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [form, setForm] = useState({ nombre: '', descripcion: '', tipo: '' });
  const [archivo, setArchivo] = useState(null);
  const [error, setError] = useState('');

  const fetchDocumentos = async () => {
    try {
      const res = await api.get('/documentos');
      setDocumentos(res.data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDocumentos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!archivo) { setError('Debe seleccionar un archivo'); return; }

    try {
      const formData = new FormData();
      formData.append('nombre', form.nombre);
      formData.append('descripcion', form.descripcion);
      formData.append('tipo', form.tipo);
      formData.append('archivo', archivo);

      await api.post('/documentos', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setShowModal(false);
      setForm({ nombre: '', descripcion: '', tipo: '' });
      setArchivo(null);
      fetchDocumentos();
    } catch (err) {
      setError(err.response?.data?.error || 'Error al subir documento');
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/documentos/${deleteConfirm.id}`);
      setDeleteConfirm(null);
      fetchDocumentos();
    } catch (err) { console.error(err); setDeleteConfirm(null); }
  };

  const handleDownload = (id) => {
    window.open(buildApiUrl(`/documentos/${id}/download`), '_blank');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Documentos</h1>
          <p className="text-dark-400 mt-1">{documentos.length} documento(s)</p>
        </div>
        <button onClick={() => { setShowModal(true); setError(''); }} className="btn-primary flex items-center gap-2">
          <HiOutlinePlus className="text-lg" /> Subir Documento
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : documentos.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <HiOutlineDocumentText className="text-4xl text-dark-600 mx-auto mb-3" />
          <p className="text-dark-400">No hay documentos subidos</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentos.map((doc) => (
            <div key={doc.id} className="glass-card-hover p-5">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 flex items-center justify-center flex-shrink-0">
                  <HiOutlineDocumentText className="text-blue-400 text-lg" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-white truncate">{doc.nombre}</h3>
                  {doc.tipo && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded text-xs bg-dark-700 text-dark-400 mt-1">
                      {doc.tipo}
                    </span>
                  )}
                  {doc.descripcion && <p className="text-dark-400 text-sm mt-1 line-clamp-2">{doc.descripcion}</p>}
                  <p className="text-dark-500 text-xs mt-2">{formatDate(doc.created_at?.split('T')[0])}</p>
                </div>
              </div>
              <div className="flex gap-2 mt-4 pt-3 border-t border-dark-700/30">
                <button onClick={() => handleDownload(doc.id)}
                  className="flex-1 btn-secondary text-sm flex items-center justify-center gap-1.5 py-2">
                  <HiOutlineDownload /> Descargar
                </button>
                <button onClick={() => setDeleteConfirm(doc)}
                  className="p-2 rounded-lg text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
                  <HiOutlineTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Subir Documento">
        {error && <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label-field">Nombre *</label>
            <input type="text" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })}
              className="input-field" required placeholder="Nombre del documento" />
          </div>
          <div>
            <label className="label-field">Tipo</label>
            <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value })} className="select-field">
              <option value="">Seleccionar</option>
              <option value="resolucion">Resolución</option>
              <option value="administrativo">Administrativo</option>
              <option value="otro">Otro</option>
            </select>
          </div>
          <div>
            <label className="label-field">Descripción</label>
            <textarea value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              className="input-field" rows={3} placeholder="Descripción opcional" />
          </div>
          <div>
            <label className="label-field">Archivo *</label>
            <label className="flex items-center gap-2 btn-secondary cursor-pointer text-sm w-fit">
              <HiOutlineUpload /> Seleccionar archivo
              <input type="file" className="hidden" onChange={(e) => setArchivo(e.target.files[0])} />
            </label>
            {archivo && <span className="text-dark-400 text-sm mt-1 block">{archivo.name}</span>}
          </div>
          <div className="flex gap-3 pt-4 border-t border-dark-700/50">
            <button type="button" onClick={() => setShowModal(false)} className="btn-secondary flex-1">Cancelar</button>
            <button type="submit" className="btn-primary flex-1">Subir</button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog isOpen={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} onConfirm={handleDelete}
        title="Eliminar Documento" message={`¿Eliminar "${deleteConfirm?.nombre}"?`} />
    </div>
  );
};

export default DocumentosList;
