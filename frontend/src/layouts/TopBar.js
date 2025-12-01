import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useState } from "react";
import TopBar from "./TopBar";
import Logo from "../assets/Logo.png";
import B from "../assets/B.png";
import D1 from "../assets/D1.png";
import D2 from "../assets/D2.png";
import R from "../assets/R.png";
import C from "../assets/C.png";
import A from "../assets/A.png";
import C2 from "../assets/C2.png";
import { API_URL } from "../config";

export default function MainLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}//api/logout`, {
        method: "POST",
        credentials: "include",
      });
      localStorage.removeItem("token");
      navigate("/login");
    } catch (err) {
      console.error("Error cerrando sesión", err);
      navigate("/login");
    }
  };

  return (
    <div className="flex bg-gray-100 font-worksans min-h-screen">
      {/* ====================== */}
      {/* SIDEBAR PC (DESKTOP) */}
      {/* ====================== */}
      <aside
        className={`hidden md:flex fixed top-0 left-0 flex-col bg-gray-800 text-white transition-all duration-300 ${
          collapsed ? "w-32" : "w-80"
        } h-screen z-40`}
      >
        <div
          className={`flex items-center p-4 border-b border-gray-700 ${
            collapsed ? "justify-center" : "justify-between"
          }`}
        >
          {!collapsed && (
            <img src={Logo} alt="Logo" className="h-14 w-auto object-contain" />
          )}
          <img
            src={B}
            alt="Minimizar"
            className="h-7 w-7 cursor-pointer hover:scale-110 transition"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <nav className="flex flex-col space-y-3 p-4">
            {[
              { to: "/dashboard", icon: D1, label: "Dashboard" },
              { to: "/documentos", icon: D2, label: "Documentos" },
              { to: "/reportes", icon: R, label: "Reportes" },
              { to: "/configuracion", icon: C, label: "Configuración Técnica" },
              { to: "/ayuda", icon: A, label: "Ayuda" },
            ].map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center ${
                    collapsed ? "justify-center" : "gap-6 pl-6 justify-start"
                  } px-3 py-3 rounded-md transition ${
                    isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700/60"
                  }`
                }
              >
                <img src={item.icon} className="h-7 w-7" />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t border-gray-700">
          <button
            onClick={handleLogout}
            className={`flex items-center w-full px-3 py-3 rounded-md hover:bg-gray-700/60 transition ${
              collapsed ? "justify-center" : "gap-5 justify-start"
            }`}
          >
            <img src={C2} alt="Cerrar sesión" className="h-7 w-7" />
            {!collapsed && <span>Cerrar sesión</span>}
          </button>
        </div>
      </aside>

      {/* ====================== */}
      {/* SIDEBAR MÓVIL */}
      {/* ====================== */}
      <aside
        className={`md:hidden fixed top-0 left-0 bg-gray-800 text-white shadow-xl h-screen w-72 z-50 p-4 transform transition-transform duration-300 ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Encabezado con logo y botón de cerrar (REEMPLAZA la X por B.png) */}
        <div className="flex justify-between items-center border-b border-gray-700 pb-3">
          <img src={Logo} alt="Logo" className="h-12" />

          {/* Usamos tu icono B aquí en lugar de la X */}
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="hover:scale-110 transition"
            aria-label="Cerrar menú"
          >
            <img src={B} alt="Cerrar menú" className="h-7 w-7 object-contain" />
          </button>
        </div>

        {/* Navegación móvil — SIN 'Minimizar barra' */}
        <nav className="flex flex-col space-y-6 mt-6">
          {[
            { to: "/dashboard", icon: D1, label: "Dashboard" },
            { to: "/documentos", icon: D2, label: "Documentos" },
            { to: "/reportes", icon: R, label: "Reportes" },
            { to: "/configuracion", icon: C, label: "Configuración Técnica" },
            { to: "/ayuda", icon: A, label: "Ayuda" },
          ].map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-4 text-lg hover:bg-gray-700/50 p-2 rounded-lg transition shadow-sm"
            >
              <img src={item.icon} className="h-7 w-7" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="absolute bottom-5 left-5 bg-gray-700 hover:bg-gray-600 shadow-md px-4 py-2 rounded flex items-center gap-4 transition"
        >
          <img src={C2} className="h-7 w-7" />
          Cerrar sesión
        </button>
      </aside>

      {/* ====================== */}
      {/* CONTENIDO PRINCIPAL */}
      {/* ====================== */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ml-0 ${
          collapsed ? "md:ml-32" : "md:ml-80"
        }`}
      >
        {/* Barra superior móvil (botón hamburguesa) */}
        <div className="md:hidden bg-white shadow h-12 flex items-center px-4 justify-between relative">
          <button
            className="absolute left-5 top-3 text-3xl hover:scale-110 transition"
            onClick={() => setMobileMenuOpen(true)}
            aria-label="Abrir menú"
          >
            ☰
          </button>
        </div>

        {/* TopBar sin cambios (usa tu TopBar original) */}
        <TopBar />

        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
