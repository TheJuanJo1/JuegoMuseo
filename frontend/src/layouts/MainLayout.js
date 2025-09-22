import { NavLink, Outlet, useNavigate } from "react-router-dom";

export default function MainLayout() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await fetch("http://localhost:3000/api/logout", {
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
    <div className="flex min-h-screen bg-gray-100 font-worksans">
      {/* Sidebar */}
      <aside className="w-60 bg-sidebar text-white flex flex-col p-4">
        <h2 className="text-xl font-bold mb-6">FluxData</h2>

        <nav className="flex flex-col space-y-3">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive ? "bg-[#D9D9D9] text-black" : "hover:bg-[#D9D9D9]/60"
              }`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/documentos"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive ? "bg-[#D9D9D9] text-black" : "hover:bg-[#D9D9D9]/60"
              }`
            }
          >
            Documentos
          </NavLink>
          <NavLink
            to="/reportes"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive ? "bg-[#D9D9D9] text-black" : "hover:bg-[#D9D9D9]/60"
              }`
            }
          >
            Reportes
          </NavLink>
          <NavLink
            to="/configuracion"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive ? "bg-[#D9D9D9] text-black" : "hover:bg-[#D9D9D9]/60"
              }`
            }
          >
            Configuración Técnica
          </NavLink>
          <NavLink
            to="/ayuda"
            className={({ isActive }) =>
              `px-3 py-2 rounded-md transition ${
                isActive ? "bg-[#D9D9D9] text-black" : "hover:bg-[#D9D9D9]/60"
              }`
            }
          >
            Ayuda
          </NavLink>
        </nav>

        {/* Botón logout */}
        <button
          onClick={handleLogout}
          className="mt-auto px-3 py-2 rounded-md hover:bg-[#D9D9D9]/60 text-left transition"
        >
          Cerrar sesión
        </button>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}

