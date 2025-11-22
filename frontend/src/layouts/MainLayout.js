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

export default function MainLayout() {
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const API_URL = import.meta.env.VITE_API_URL || "https://fluxdata3.onrender.com"; 

  const handleLogout = async () => {
    try {
      await fetch(`${API_URL}/api/logout`, {
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
      <aside
        className={`fixed top-0 left-0 flex flex-col bg-gray-800 text-white transition-all duration-300
        ${collapsed ? "w-32" : "w-80"} h-screen`}
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
            alt="Cerrar barra"
            className="h-7 w-7 cursor-pointer"
            onClick={() => setCollapsed(!collapsed)}
          />
        </div>

        {/* Contenido scrollable */}
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          <nav className="flex flex-col space-y-3 p-4">
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-6 pl-6 justify-start"
                } px-3 py-3 rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700/60"
                }`
              }
            >
              <img src={D1} alt="Dashboard" className="h-7 w-7" />
              {!collapsed && <span>Dashboard</span>}
            </NavLink>

            <NavLink
              to="/documentos"
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-6 pl-6 justify-start"
                } px-3 py-3 rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700/60"
                }`
              }
            >
              <img src={D2} alt="Documentos" className="h-7 w-7" />
              {!collapsed && <span>Documentos</span>}
            </NavLink>

            <NavLink
              to="/reportes"
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-6 pl-6 justify-start"
                } px-3 py-3 rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700/60"
                }`
              }
            >
              <img src={R} alt="Reportes" className="h-7 w-7" />
              {!collapsed && <span>Reportes</span>}
            </NavLink>

            <NavLink
              to="/configuracion"
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-6 pl-6 justify-start"
                } px-3 py-3 rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700/60"
                }`
              }
            >
              <img src={C} alt="Configuración" className="h-7 w-7" />
              {!collapsed && <span>Configuración Técnica</span>}
            </NavLink>

            <NavLink
              to="/ayuda"
              className={({ isActive }) =>
                `flex items-center ${
                  collapsed ? "justify-center" : "gap-6 pl-6 justify-start"
                } px-3 py-3 rounded-md transition ${
                  isActive ? "bg-gray-700 text-white" : "hover:bg-gray-700/60"
                }`
              }
            >
              <img src={A} alt="Ayuda" className="h-7 w-7" />
              {!collapsed && <span>Ayuda</span>}
            </NavLink>
          </nav>
        </div>

        {/* Botón logout fijo abajo */}
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

      {/* Main content con margen a la izquierda */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${
          collapsed ? "ml-32" : "ml-80"
        }`}
      >
        <TopBar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
