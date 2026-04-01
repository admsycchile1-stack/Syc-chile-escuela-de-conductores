import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AlumnosList from './pages/Alumnos/AlumnosList';
import AlumnoDetail from './pages/Alumnos/AlumnoDetail';
import InstructoresList from './pages/Instructores/InstructoresList';
import Ingresos from './pages/Finanzas/Ingresos';
import Egresos from './pages/Finanzas/Egresos';
import CombustibleList from './pages/Combustible/CombustibleList';
import Reportes from './pages/Finanzas/Reportes';
import DocumentosList from './pages/Documentos/DocumentosList';
import Estadisticas from './pages/Estadisticas/Estadisticas';
import UsuariosList from './pages/Usuarios/UsuariosList';

const ProtectedRoute = ({ children }) => {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin" />
          <p className="text-dark-400">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!usuario) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="alumnos" element={<AlumnosList />} />
            <Route path="alumnos/:id" element={<AlumnoDetail />} />
            <Route path="instructores" element={<InstructoresList />} />
            <Route path="ingresos" element={<Ingresos />} />
            <Route path="egresos" element={<Egresos />} />
            <Route path="combustible" element={<CombustibleList />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="documentos" element={<DocumentosList />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="usuarios" element={<UsuariosList />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
