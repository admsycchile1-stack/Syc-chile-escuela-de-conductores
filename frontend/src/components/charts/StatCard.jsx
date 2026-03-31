import React from 'react';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }) => {
  const colorMap = {
    primary: 'from-primary-500 to-primary-600 shadow-primary-500/20',
    emerald: 'from-emerald-500 to-emerald-600 shadow-emerald-500/20',
    amber: 'from-amber-500 to-amber-600 shadow-amber-500/20',
    red: 'from-red-500 to-red-600 shadow-red-500/20',
    blue: 'from-blue-500 to-blue-600 shadow-blue-500/20',
    violet: 'from-violet-500 to-violet-600 shadow-violet-500/20',
  };

  return (
    <div className="stat-card group animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-dark-400 text-sm font-medium mb-1">{title}</p>
          <p className="text-3xl font-bold text-white mb-1">{value}</p>
          {subtitle && <p className="text-dark-500 text-xs">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-2 font-medium ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}% vs mes anterior
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorMap[color]} shadow-lg flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="text-white text-xl" />
          </div>
        )}
      </div>
      {/* Decorative gradient */}
      <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colorMap[color]} opacity-60 rounded-b-2xl`} />
    </div>
  );
};

export default StatCard;
