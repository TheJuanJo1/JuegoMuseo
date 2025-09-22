import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard"; 
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
import MainLayout from "./layouts/MainLayout";
import Documentos from "./components/Documentos";
import FacturasNotas from "./components/FacturasNotas";
import Historial from "./components/Historial";

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

        {/* Rutas con layout */}
        <Route element={<MainLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/documentos" element={<Documentos />} />
          <Route path="/historial" element={<Historial />} /> {/* ← aquí agregamos Historial */}
        </Route>

        {/* Ruta independiente sin MainLayout */}
        <Route path="/facturas-notas" element={<FacturasNotas />} />
      </Routes>
    </Router>
  );
}

export default App;
