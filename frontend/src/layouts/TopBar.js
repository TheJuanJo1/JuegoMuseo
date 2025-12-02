// src/layouts/TopBar.js
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function TopBar() {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

  const username = localStorage.getItem("username") || "Usuario";

  useEffect(() => {
    if (location.pathname === "/dashboard") {
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
    } else if (location.pathname === "/documentos") {
      setTitle("Documentos");
    } else if (location.pathname === "/reportes") {
      setTitle("Reportes");
    } else if (location.pathname === "/configuracion") {
      setTitle("Configuración Técnica");
    } else if (location.pathname === "/ayuda") {
      setTitle("Ayuda");
    } else {
      setTitle("");
    }
  }, [location, showWelcome, username]);

  return (
    <header
      className="
    fixed
    top-0
    z-40
    bg-white
    w-full
    h-[80px]
    flex
    items-center
    px-6
    border-b border-gray-200
    shadow-sm
  "
    >
      <h1 className="font-workSans font-normal text-[30px] text-gray-800 ml-5">
        {title}
      </h1>
    </header>
  );
}