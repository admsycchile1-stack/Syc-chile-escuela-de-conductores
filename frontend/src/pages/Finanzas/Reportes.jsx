import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { formatCurrency } from '../../utils/formatters';
import { exportFinancialReportToExcel } from '../../utils/excel';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { HiOutlineCalendar, HiOutlineDownload } from 'react-icons/hi';

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-dark-800 border border-dark-700 rounded-xl p-3 shadow-xl">
        <p className="text-dark-300 text-sm mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {formatCurrency(entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Reportes = () => {
  const [data, setData] = useState(null);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const res = await api.get('/estadisticas/finanzas', { params: { year } });
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [year]);

  const totalIngresos = data?.resumenMensual?.reduce((s, m) => s + m.ingresos, 0) || 0;
  const totalEgresos = data?.resumenMensual?.reduce((s, m) => s + m.egresos, 0) || 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Reportes Financieros</h1>
          <p className="text-dark-400 mt-1">Análisis de ingresos y egresos</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex items-center gap-2">
            <HiOutlineCalendar className="text-dark-500" />
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className="select-field w-32">
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={() => exportFinancialReportToExcel({ year, ...data })}
            className="btn-success flex items-center justify-center gap-2"
            disabled={!data}
          >
            <HiOutlineDownload className="text-lg" /> Exportar a Excel
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
        </div>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="glass-card p-6 text-center">
              <p className="text-dark-400 text-sm mb-1">Total Ingresos {year}</p>
              <p className="text-2xl font-bold text-emerald-400">{formatCurrency(totalIngresos)}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-dark-400 text-sm mb-1">Total Egresos {year}</p>
              <p className="text-2xl font-bold text-red-400">{formatCurrency(totalEgresos)}</p>
            </div>
            <div className="glass-card p-6 text-center">
              <p className="text-dark-400 text-sm mb-1">Balance {year}</p>
              <p className={`text-2xl font-bold ${totalIngresos - totalEgresos >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {formatCurrency(totalIngresos - totalEgresos)}
              </p>
            </div>
          </div>

          {/* Monthly Chart */}
          <div className="glass-card p-6">
            <h2 className="text-lg font-semibold text-white mb-4">Ingresos vs Egresos por Mes</h2>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data?.resumenMensual || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="nombre" stroke="#64748b" tick={{ fontSize: 12 }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 12 }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="egresos" name="Egresos" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Expenses by Category */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Egresos por Categoría</h2>
              {data?.egresosPorCategoria?.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie data={data.egresosPorCategoria} dataKey="total" nameKey="categoria"
                      cx="50%" cy="50%" outerRadius={100} label={({ categoria, percent }) =>
                        `${categoria} (${(percent * 100).toFixed(0)}%)`
                      } labelLine={false}>
                      {data.egresosPorCategoria.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatCurrency(value)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-dark-500 text-center py-12">Sin datos</p>
              )}
            </div>

            {/* Monthly Table */}
            <div className="glass-card p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Detalle Mensual</h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-dark-700/50">
                      <th className="table-header">Mes</th>
                      <th className="table-header text-right">Ingresos</th>
                      <th className="table-header text-right">Egresos</th>
                      <th className="table-header text-right">Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700/30">
                    {data?.resumenMensual?.map((m) => (
                      <tr key={m.mes} className="hover:bg-dark-800/40 transition-colors">
                        <td className="table-cell font-medium">{m.nombre}</td>
                        <td className="table-cell text-right text-emerald-400">{formatCurrency(m.ingresos)}</td>
                        <td className="table-cell text-right text-red-400">{formatCurrency(m.egresos)}</td>
                        <td className={`table-cell text-right font-medium ${m.balance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                          {formatCurrency(m.balance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Reportes;
