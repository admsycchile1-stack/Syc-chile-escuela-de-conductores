import React from 'react';
import { HiOutlineExclamation } from 'react-icons/hi';

const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm bg-dark-800 border border-dark-700/50 rounded-2xl shadow-2xl animate-fade-in p-6">
        <div className="flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center mb-4">
            <HiOutlineExclamation className="text-3xl text-red-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">{title || '¿Está seguro?'}</h3>
          <p className="text-dark-400 text-sm mb-6">
            {message || 'Esta acción no se puede deshacer.'}
          </p>
          <div className="flex gap-3 w-full">
            <button onClick={onClose} className="btn-secondary flex-1">
              Cancelar
            </button>
            <button onClick={onConfirm} className="btn-danger flex-1">
              Eliminar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDialog;
