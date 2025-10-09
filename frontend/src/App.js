// src/App.jsx
import { BrowserRouter as Router, Routes, Route, Navigate, useParams } from "react-router-dom";

// Formularios y páginas
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import Clientes from "./components/Clientes";
import FacturasNotas from "./components/FacturasNotas";

// Formulario obligatorio después del login
import FormularioEmpresa from "./components/FormularioEmpresa";

// Páginas con layout
import MainLayout from "./layouts/MainLayout";
import Dashboard from "./components/Dashboard";
import Documentos from "./components/Documentos";
import Historial from "./components/Historial";
import Reportes from "./components/Reportes";
import Ayuda from "./components/Ayuda";
import ConfiguracionTecnica from "./components/ConfiguracionTecnica";

// Wrapper para pasar usuarioId desde params a FormularioEmpresa
const FormularioEmpresaWrapper = () => {
  const { usuarioId } = useParams();
  return <FormularioEmpresa usuarioId={usuarioId} />;
};

// Wrapper para ConfiguracionTecnica obteniendo usuarioId desde localStorage
const ConfiguracionTecnicaWrapper = () => {
  const usuarioId = localStorage.getItem("usuarioId");
  if (!usuarioId) return <Navigate to="/login" />;
  return <ConfiguracionTecnica usuarioId={usuarioId} />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Rutas públicas */}
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Formulario obligatorio después del login */}
        <Route path="/empresa/:usuarioId" element={<FormularioEmpresaWrapper />} />

        {/* Rutas independientes sin layout */}
        <Route path="/clientes" element={<Clientes />} />
        <Route path="/facturas-notas" element={<FacturasNotas />} />

        {/* Rutas con layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/historial" element={<Historial />} />
          <Route path="/reportes" element={<Reportes />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/configuracion" element={<ConfiguracionTecnicaWrapper />} />
        </Route>

        {/* Ruta por defecto en caso de no encontrar ninguna */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
