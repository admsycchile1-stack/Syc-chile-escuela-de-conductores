import React from 'react';

const StatusBadge = ({ status }) => {
  const config = {
    en_curso: { label: 'En Curso', classes: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
    finalizado: { label: 'Finalizado', classes: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
    abandonado: { label: 'Abandonado', classes: 'bg-red-500/20 text-red-400 border-red-500/30' },
  };

  const { label, classes } = config[status] || config.en_curso;

  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${classes}`}>
      {label}
    </span>
  );
};

export default StatusBadge;
