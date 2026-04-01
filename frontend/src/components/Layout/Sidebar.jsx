import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  HiOutlineAcademicCap,
  HiOutlineUsers,
  HiOutlineUserGroup,
  HiOutlineCurrencyDollar,
  HiOutlineDocumentText,
  HiOutlineChartBar,
  HiOutlineLogout,
  HiOutlineHome,
  HiOutlineArrowSmLeft,
  HiOutlineArrowSmRight,
  HiOutlineCash,
  HiOutlineTrendingDown,
  HiOutlineTruck,
} from 'react-icons/hi';

const menuItems = [
  { path: '/', label: 'Dashboard', icon: HiOutlineHome },
  { path: '/alumnos', label: 'Alumnos', icon: HiOutlineAcademicCap },
  { path: '/instructores', label: 'Instructores', icon: HiOutlineUserGroup },
  { path: '/ingresos', label: 'Ingresos', icon: HiOutlineCash },
  { path: '/egresos', label: 'Egresos', icon: HiOutlineTrendingDown },
  { path: '/combustible', label: 'Combustible', icon: HiOutlineTruck },
  { path: '/reportes', label: 'Reportes', icon: HiOutlineCurrencyDollar },
  { path: '/documentos', label: 'Documentos', icon: HiOutlineDocumentText },
  { path: '/estadisticas', label: 'Estadísticas', icon: HiOutlineChartBar },
  { path: '/usuarios', label: 'Usuarios', icon: HiOutlineUsers },
];

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout, usuario } = useAuth();
  const location = useLocation();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen bg-dark-900/95 backdrop-blur-xl border-r border-dark-700/50
        flex flex-col transition-all duration-300 z-50
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo */}
      <div className="p-5 border-b border-dark-700/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30 flex-shrink-0">
            <HiOutlineAcademicCap className="text-white text-xl" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold text-white leading-tight">AutoEscuela</h1>
              <p className="text-xs text-dark-400">Sistema de Gestión</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {menuItems.map(({ path, label, icon: Icon }) => {
          const isActive = path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);
          return (
            <NavLink
              key={path}
              to={path}
              className={isActive ? 'sidebar-link-active' : 'sidebar-link'}
              title={collapsed ? label : ''}
            >
              <Icon className={`text-xl flex-shrink-0 ${isActive ? 'text-primary-400' : ''}`} />
              {!collapsed && <span className="animate-fade-in">{label}</span>}
            </NavLink>
          );
        })}
      </nav>

      {/* User & Collapse */}
      <div className="p-3 border-t border-dark-700/50 space-y-2">
        {!collapsed && usuario && (
          <div className="px-4 py-2 animate-fade-in">
            <p className="text-sm font-medium text-dark-200 truncate">{usuario.nombre}</p>
            <p className="text-xs text-dark-500 truncate">{usuario.email}</p>
          </div>
        )}
        <button
          onClick={logout}
          className="sidebar-link w-full text-red-400 hover:text-red-300 hover:bg-red-500/10"
          title="Cerrar sesión"
        >
          <HiOutlineLogout className="text-xl flex-shrink-0" />
          {!collapsed && <span>Cerrar Sesión</span>}
        </button>
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="sidebar-link w-full justify-center"
          title={collapsed ? 'Expandir' : 'Colapsar'}
        >
          {collapsed ? (
            <HiOutlineArrowSmRight className="text-xl" />
          ) : (
            <HiOutlineArrowSmLeft className="text-xl" />
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
