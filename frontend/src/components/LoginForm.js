import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { API_URL } from "../config";
import fluxLogo from "../assets/fluxdata.png";
import backArrow from "../assets/back-arrow.png";
import laptopImage from "../assets/laptop.jpg";
import laptop from "../assets/im.png";

export default function LoginForm() {
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrName, password }),
        credentials: "include",
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Error en login");
        return;
      }
      if (data.user.role === "admin") {
        navigate("/admin/dashboard");
      } else {
        const usuarioId = data.user.id;
        localStorage.setItem("usuarioId", usuarioId);
        const estadoRes = await fetch(`${API_URL}/api/configuracion/estado/${usuarioId}`);
        const estadoData = await estadoRes.json();

        if (estadoData.completado) {
          navigate("/dashboard");
        } else {
          navigate(`/empresa/${usuarioId}`);
        }
      }
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <div
      className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans] bg-no-repeat bg-left md:bg-left bg-contain"
      style={{ backgroundImage: `url(${laptop})` }}
    >
      <div className="shadow-xl rounded-2xl flex flex-col md:flex-row overflow-hidden w-full max-w-[1150px] h-auto md:h-[700px] bg-white">
        
        {/* IMAGEN IZQUIERDA — OCULTA EN MÓVIL VERTICAL */}
        <div
          className="
            hidden
            md:flex
            [@media(orientation:landscape)]:flex
            w-full md:w-1/2 
            items-center justify-center bg-white p-4 md:p-2 
            rounded-t-2xl md:rounded-l-2xl
          "
        >
          <img
            src={laptopImage}
            alt="Laptop con dashboard"
            className="object-contain w-full h-auto md:w-[98%] md:h-[98%] rounded-lg"
          />
        </div>

        <div
          className="w-full md:w-1/2 flex flex-col justify-between px-6 md:px-12 py-6 md:py-8 rounded-b-2xl md:rounded-r-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0% 100%)",
          }}
        >
          <div className="flex justify-between items-center mb-4 md:mb-6">
            <img src={fluxLogo} alt="FluxData" className="h-4 md:h-5" />
            <img
              src={backArrow}
              alt="Volver"
              className="h-6 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          <div className="flex flex-col justify-center flex-grow">
            <div className="text-center mb-10 md:mb-14">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2 md:mb-3">
                Hola Usuario
              </h1>
              <p className="text-gray-500 text-base md:text-lg">
                Bienvenido a FluxData
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              {error && (
                <div className="bg-red-100 text-red-600 p-2 mb-4 rounded text-sm">
                  {error}
                </div>
              )}

              <input
                type="text"
                placeholder="Nombre de Usuario o Correo"
                value={emailOrName}
                onChange={(e) => setEmailOrName(e.target.value)}
                className="w-full p-3 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <div className="flex justify-end mb-6">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-blue-600"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition mb-4"
              >
                Iniciar Sesión
              </button>

              <p className="text-center text-sm text-gray-600">
                ¿No tienes cuenta?{" "}
                <Link to="/register" className="text-blue-600 hover:underline">
                  Regístrate
                </Link>
              </p>
            </form>

          </div>
        </div>
      </div>
    </div>
  );
}
