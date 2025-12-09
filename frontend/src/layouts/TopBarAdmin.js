// src/layouts/TopBarAdmin.js
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

export default function TopBarAdmin() {
  const location = useLocation();
  const [title, setTitle] = useState("");
  const [showWelcome, setShowWelcome] = useState(true);

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
      <div className="flex items-center gap-6">
        <h1 className="font-worksans text-[30px] text-gray-800 transition-all duration-500 ml-5">
          {title}
        </h1>
      </div>
    </header>
  );
}