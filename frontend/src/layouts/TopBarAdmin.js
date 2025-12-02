import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import fluxLogo from "../assets/fluxdata.svg";

export default function TopBarAdmin() {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  // Simulación: obtener nombre del SuperAdmin
  const username = localStorage.getItem("username") || "SuperAdmin";

  useEffect(() => {
    if (location.pathname === "/admin/dashboard") {
      if (showWelcome) {
        setTitle(`Bienvenido, ${username}`);
        const timer = setTimeout(() => {
          setShowWelcome(false);
          setTitle("Dashboard");
        }, 3000);
        return () => clearTimeout(timer);
      } else {
        setTitle("Dashboard");
      }
    } else if (location.pathname === "/admin/empresas") {
      setTitle("Empresas");
    } else if (location.pathname === "/admin/registros") {
      setTitle("Registros");
    } else {
      setTitle("");
    }
  }, [location, showWelcome, username]);

  return (
    <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200 shadow-sm">
      {/* Logo + Título */}
      <div className="flex items-center gap-10">
        <img
          src={fluxLogo}
          alt="FluxData"
          className="h-5 w-auto object-contain ml-6"
        />
        <h1 className="text-lg font-semibold text-gray-800 transition-all duration-500">
          {title}
        </h1>
      </div>
    </header>
  );
}