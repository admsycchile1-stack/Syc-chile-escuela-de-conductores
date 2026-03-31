import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import StatCard from '../components/charts/StatCard';
import { formatCurrency } from '../utils/formatters';
import {
  HiOutlineAcademicCap,
  HiOutlineUserGroup,
  HiOutlineCash,
  HiOutlineTrendingDown,
  HiOutlineTrendingUp,
  HiOutlineScale,
  HiOutlineArrowRight,
} from 'react-icons/hi';

const Dashboard = () => {
  const [resumen, setResumen] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResumen = async () => {
      try {
        const res = await api.get('/estadisticas/resumen');
        setResumen(res.data);
      } catch (error) {
        console.error('Error al cargar resumen:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchResumen();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="text-dark-400 mt-1">Resumen general del sistema</p>
      </div>

      {/* Student Stats */}
      <div>
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Alumnos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Alumnos"
            value={resumen?.totalAlumnos || 0}
            icon={HiOutlineAcademicCap}
            color="primary"
          />
          <StatCard
            title="En Curso"
            value={resumen?.alumnosEnCurso || 0}
            icon={HiOutlineUserGroup}
            color="blue"
          />
          <StatCard
            title="Finalizados"
            value={resumen?.alumnosFinalizados || 0}
            icon={HiOutlineTrendingUp}
            color="emerald"
          />
          <StatCard
            title="Abandonados"
            value={resumen?.alumnosAbandonados || 0}
            icon={HiOutlineTrendingDown}
            color="red"
          />
        </div>
      </div>

      {/* Financial Stats */}
      <div>
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Finanzas del Mes</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Ingresos del Mes"
            value={formatCurrency(resumen?.ingresosMes || 0)}
            icon={HiOutlineCash}
            color="emerald"
          />
          <StatCard
            title="Egresos del Mes"
            value={formatCurrency(resumen?.egresosMes || 0)}
            icon={HiOutlineTrendingDown}
            color="amber"
          />
          <StatCard
            title="Balance del Mes"
            value={formatCurrency(resumen?.balanceMes || 0)}
            icon={HiOutlineScale}
            color={resumen?.balanceMes >= 0 ? 'emerald' : 'red'}
          />
        </div>
      </div>

      {/* Total Financial Stats */}
      <div>
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Totales Acumulados</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Total Ingresos"
            value={formatCurrency(resumen?.totalIngresos || 0)}
            icon={HiOutlineCash}
            color="emerald"
          />
          <StatCard
            title="Total Egresos"
            value={formatCurrency(resumen?.totalEgresos || 0)}
            icon={HiOutlineTrendingDown}
            color="amber"
          />
          <StatCard
            title="Balance Total"
            value={formatCurrency(resumen?.balance || 0)}
            icon={HiOutlineScale}
            color={resumen?.balance >= 0 ? 'emerald' : 'red'}
          />
        </div>
      </div>

      {/* Quick Links */}
      <div>
        <h2 className="text-lg font-semibold text-dark-200 mb-4">Accesos Rápidos</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { to: '/alumnos', label: 'Gestionar Alumnos', icon: HiOutlineAcademicCap },
            { to: '/reportes', label: 'Ver Reportes', icon: HiOutlineCash },
            { to: '/estadisticas', label: 'Estadísticas', icon: HiOutlineTrendingUp },
          ].map(({ to, label, icon: Icon }) => (
            <Link
              key={to}
              to={to}
              className="glass-card-hover p-5 flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <Icon className="text-2xl text-primary-400" />
                <span className="font-medium text-dark-200">{label}</span>
              </div>
              <HiOutlineArrowRight className="text-dark-500 group-hover:text-primary-400 transition-colors" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
