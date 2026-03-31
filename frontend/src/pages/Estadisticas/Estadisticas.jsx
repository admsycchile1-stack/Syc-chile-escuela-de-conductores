import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatDate } from '../../utils/formatters';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  HiOutlineCalendar,
  HiOutlineFilter,
  HiOutlineAcademicCap,
  HiOutlineClipboardCheck,
  HiOutlineDocumentSearch,
} from 'react-icons/hi';

const PENDIENTE_LABELS = {
  teorico: 'Pendiente teorico',
  practico: 'Pendiente practico',
  ambos: 'Pendiente ambos',
};

const ESTADO_LABELS = {
  en_curso: 'En curso',
  finalizado: 'Finalizado',
  abandonado: 'Abandonado',
};

const SeccionTabla = ({ title, emptyText, rows, colorClass = 'text-white', columns }) => (
  <div className="glass-card p-6">
    <div className="flex items-center justify-between gap-3 mb-4">
      <h2 className={`text-lg font-semibold ${colorClass}`}>{title}</h2>
      <span className="text-dark-400 text-sm">{rows.length} alumno(s)</span>
    </div>

    {rows.length === 0 ? (
      <p className="text-dark-500 text-sm">{emptyText}</p>
    ) : (
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-dark-700/50">
              {columns.map((column) => (
                <th key={column.key} className="table-header">
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700/30">
            {rows.map((row) => (
              <tr key={row.id} className="hover:bg-dark-800/40 transition-colors">
                {columns.map((column) => (
                  <td key={column.key} className="table-cell">
                    {column.render ? column.render(row) : row[column.key] || '-'}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </div>
);

const Estadisticas = () => {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 6 }, (_, index) => currentYear - 2 + index);

  const [alumnosPorMes, setAlumnosPorMes] = useState([]);
  const [examenes, setExamenes] = useState(null);
  const [instructores, setInstructores] = useState([]);
  const [year, setYear] = useState('');
  const [instructorId, setInstructorId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      try {
        const params = {};
        if (year !== '') params.year = year;
        if (instructorId) params.instructor_id = instructorId;

        const [alumnosRes, examenesRes, instructoresRes] = await Promise.allSettled([
          api.get('/estadisticas/alumnos-por-mes', { params }),
          api.get('/estadisticas/examenes', { params }),
          api.get('/instructores'),
        ]);

        setAlumnosPorMes(alumnosRes.status === 'fulfilled' ? alumnosRes.value.data : []);
        setExamenes(examenesRes.status === 'fulfilled' ? examenesRes.value.data : null);
        setInstructores(instructoresRes.status === 'fulfilled' ? instructoresRes.value.data : []);
      } catch (error) {
        console.error('Error al cargar estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [year, instructorId]);

  const totalMatriculados = examenes?.totalMatriculados || 0;
  const yearLabel = year || 'todos los años';

  const chartTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;

    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-3 shadow-xl">
        <p className="text-dark-300 text-sm">{label}</p>
        <p className="text-primary-400 font-semibold">{payload[0].value} alumno(s)</p>
      </div>
    );
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Estadísticas</h1>
          <p className="text-dark-400 mt-1">Matrículas y estado de exámenes</p>
        </div>

        <div className="glass-card p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="text-dark-500" />
            <select value={year} onChange={(e) => setYear(e.target.value)} className="select-field w-40">
              <option value="">Todos los años</option>
              {years.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <HiOutlineFilter className="text-dark-500" />
            <select value={instructorId} onChange={(e) => setInstructorId(e.target.value)} className="select-field w-56">
              <option value="">Todos los instructores</option>
              {instructores.map((instructor) => (
                <option key={instructor.id} value={instructor.id}>{instructor.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <HiOutlineAcademicCap className="text-3xl text-primary-400" />
                <span className="text-dark-500 text-xs uppercase tracking-wider">Matrículas</span>
              </div>
              <p className="text-3xl font-bold text-white">{totalMatriculados}</p>
              <p className="text-dark-400 text-sm mt-2">Alumnos matriculados en {yearLabel}</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <HiOutlineClipboardCheck className="text-3xl text-emerald-400" />
                <span className="text-dark-500 text-xs uppercase tracking-wider">Teórico</span>
              </div>
              <p className="text-3xl font-bold text-emerald-400">{examenes?.aprobadosTeorico?.total || 0}</p>
              <p className="text-dark-400 text-sm mt-2">Aprobados examen teórico</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <HiOutlineClipboardCheck className="text-3xl text-blue-400" />
                <span className="text-dark-500 text-xs uppercase tracking-wider">Práctico</span>
              </div>
              <p className="text-3xl font-bold text-blue-400">{examenes?.aprobadosPractico?.total || 0}</p>
              <p className="text-dark-400 text-sm mt-2">Aprobados examen práctico</p>
            </div>

            <div className="glass-card p-6">
              <div className="flex items-center justify-between mb-3">
                <HiOutlineDocumentSearch className="text-3xl text-amber-400" />
                <span className="text-dark-500 text-xs uppercase tracking-wider">Pendientes</span>
              </div>
              <p className="text-3xl font-bold text-amber-400">{examenes?.pendientes?.total || 0}</p>
              <p className="text-dark-400 text-sm mt-2">Con examen pendiente</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="glass-card p-6">
              <p className="text-dark-400 text-sm mb-2">Alumnos en curso</p>
              <p className="text-3xl font-bold text-amber-400">{examenes?.estados?.enCurso?.total || 0}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-dark-400 text-sm mb-2">Alumnos finalizados</p>
              <p className="text-3xl font-bold text-emerald-400">{examenes?.estados?.finalizados?.total || 0}</p>
            </div>
            <div className="glass-card p-6">
              <p className="text-dark-400 text-sm mb-2">Alumnos abandonados</p>
              <p className="text-3xl font-bold text-red-400">{examenes?.estados?.abandonados?.total || 0}</p>
            </div>
          </div>

          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Alumnos por mes</h2>
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={alumnosPorMes}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="nombre" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={chartTooltip} />
                <Bar
                  dataKey="total"
                  name="Matriculados"
                  fill="#6366f1"
                  radius={[6, 6, 0, 0]}
                  background={{ fill: '#1e293b', radius: [6, 6, 0, 0] }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <SeccionTabla
              title="Alumnos aprobados examen teórico"
              emptyText="No hay alumnos aprobados en el examen teórico para este filtro."
              rows={examenes?.aprobadosTeorico?.alumnos || []}
              colorClass="text-emerald-400"
              columns={[
                { key: 'nombre', label: 'Alumno' },
                { key: 'rut', label: 'RUT' },
                {
                  key: 'fecha_aprobacion',
                  label: 'Fecha aprobación',
                  render: (row) => formatDate(row.fecha_aprobacion),
                },
              ]}
            />

            <SeccionTabla
              title="Alumnos aprobados examen práctico"
              emptyText="No hay alumnos aprobados en el examen práctico para este filtro."
              rows={examenes?.aprobadosPractico?.alumnos || []}
              colorClass="text-blue-400"
              columns={[
                { key: 'nombre', label: 'Alumno' },
                { key: 'rut', label: 'RUT' },
                {
                  key: 'fecha_aprobacion',
                  label: 'Fecha aprobación',
                  render: (row) => formatDate(row.fecha_aprobacion),
                },
              ]}
            />
          </div>

          <div className="glass-card p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-lg font-semibold text-white">Estado de alumnos matriculados</h2>
              <span className="text-dark-400 text-sm">{totalMatriculados} alumno(s)</span>
            </div>

            {totalMatriculados === 0 ? (
              <p className="text-dark-500 text-sm">No hay alumnos matriculados para este filtro.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      <th className="table-header">Alumno</th>
                      <th className="table-header">RUT</th>
                      <th className="table-header">Matrícula</th>
                      <th className="table-header">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/30">
                    {[
                      ...(examenes?.estados?.enCurso?.alumnos || []),
                      ...(examenes?.estados?.finalizados?.alumnos || []),
                      ...(examenes?.estados?.abandonados?.alumnos || []),
                    ].map((alumno) => (
                      <tr key={alumno.id} className="hover:bg-dark-800/40 transition-colors">
                        <td className="table-cell font-medium text-white">{alumno.nombre}</td>
                        <td className="table-cell font-mono text-dark-300">{alumno.rut}</td>
                        <td className="table-cell">{formatDate(alumno.matricula_fecha)}</td>
                        <td className="table-cell">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                            alumno.estado === 'finalizado'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : alumno.estado === 'abandonado'
                                ? 'bg-red-500/10 text-red-400 border-red-500/20'
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}>
                            {ESTADO_LABELS[alumno.estado] || alumno.estado}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="glass-card p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
              <div>
                <h2 className="text-lg font-semibold text-amber-400">Alumnos pendientes de exámenes</h2>
                <p className="text-dark-400 text-sm mt-1">
                  Se clasifica según si falta teórico, práctico o ambos.
                </p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  Pendiente teórico: {examenes?.pendientes?.teorico || 0}
                </span>
                <span className="px-3 py-1 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Pendiente práctico: {examenes?.pendientes?.practico || 0}
                </span>
                <span className="px-3 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Pendiente ambos: {examenes?.pendientes?.ambos || 0}
                </span>
              </div>
            </div>

            {!(examenes?.pendientes?.alumnos || []).length ? (
              <p className="text-dark-500 text-sm">No hay alumnos con pendientes para este filtro.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      <th className="table-header">Alumno</th>
                      <th className="table-header">RUT</th>
                      <th className="table-header">Matrícula</th>
                      <th className="table-header">Pendiente</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/30">
                    {(examenes?.pendientes?.alumnos || []).map((alumno) => (
                      <tr key={alumno.id} className="hover:bg-dark-800/40 transition-colors">
                        <td className="table-cell font-medium text-white">{alumno.nombre}</td>
                        <td className="table-cell font-mono text-dark-300">{alumno.rut}</td>
                        <td className="table-cell">{formatDate(alumno.matricula_fecha)}</td>
                        <td className="table-cell">
                          <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {PENDIENTE_LABELS[alumno.pendiente] || 'Pendiente'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Estadisticas;
