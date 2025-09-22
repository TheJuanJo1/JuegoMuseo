import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

//Importar imágenes desde assets
import fluxLogo from "../assets/fluxdata.png";
import backArrow from "../assets/back-arrow.png";
import laptopImage from "../assets/laptop.png";

export default function LoginForm() {
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

        try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrName, password }),
        credentials: "include", //Ahora sí enviamos/recibimos cookies
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error en login");
        return;
      }

      // Ya no guardamos token en localStorage
      navigate("/dashboard");
    } catch (err) {
      setError("No se pudo conectar con el servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans]">
      {/* Contenedor blanco principal */}
      <div className="bg-white shadow-xl rounded-2xl flex overflow-hidden w-[900px] h-[600px]">
        {/* Columna izquierda con imagen */}
        <div className="w-1/2 relative bg-gray-50 flex items-center justify-center">
          <img
            src={laptopImage}
            alt="Laptop con dashboard"
            className="object-cover w-full h-full"
          />
        </div>

        {/* Columna derecha con login */}
        <div className="w-1/2 flex flex-col justify-center px-10">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <img src={fluxLogo} alt="FluxData" className="h-6" />
            <img
              src={backArrow}
              alt="Volver"
              className="h-6 cursor-pointer"
              onClick={() => navigate("/")}
            />
          </div>

          {/* Título */}
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Hola Usuario
          </h1>
          <p className="text-gray-500 mb-6">Bienvenido a FluxData</p>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="w-full max-w-sm">
            {error && (
              <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
                {error}
              </div>
            )}

            <input
              type="text"
              placeholder="Nombre de Usuario o Correo"
              value={emailOrName}
              onChange={(e) => setEmailOrName(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />

            <div className="flex justify-end mb-4">
              <Link
                to="/forgot-password"
                className="text-sm text-gray-500 hover:text-blue-600"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button
              type="submit"
              className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition"
            >
              Iniciar Sesión
            </button>

            <p className="text-center text-sm text-gray-600 mt-4">
              ¿No tienes cuenta?{" "}
              <Link to="/register" className="text-blue-600 hover:underline">
                Regístrate
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
