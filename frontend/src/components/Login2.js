import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import fluxLogo from "../assets/fluxdata.svg";
import backArrow from "../assets/back-arrow.svg";
import laptopImage from "../assets/laptop.jpg";
import laptop from "../assets/im.png";
import { API_URL } from "../config";

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
    <div className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans]"
      style={{
        backgroundImage: `url(${laptop})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "left center",
        backgroundSize: "62.5% auto",        
        }}>
      <div className="shadow-xl rounded-2xl flex overflow-hidden w-[1150px] h-[700px]"
       style={{ backgroundColor: "#FFFFFF" }}>
      <div className="w-1/2 flex items-center justify-center bg-white p-2 rounded-l-2xl">
        <img
          src={laptopImage}
          alt="Laptop con dashboard"
          className="object-contain w-[98%] h-[98%] rounded-lg"/>
      </div>
        <div
          className="w-1/2 flex flex-col justify-between px-12 py-8 rounded-r-2xl"
          style={{
            backgroundColor: "#FFFFFF",
            clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0% 100%)",
          }}>
          <div className="flex justify-between items-center mb-6">
            <img src={fluxLogo} alt="FluxData" className="h-4" />
            <img
              src={backArrow}
              alt="Volver"
              className="h-6 cursor-pointer"
              onClick={() => navigate("/")}/>
          </div>
          <div className="flex flex-col justify-center flex-grow">
            <div className="text-center mb-14">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Hola Usuario
              </h1>
              <p className="text-gray-500 text-lg">Bienvenido a FluxData</p>
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
                className="w-full p-3 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
              <div className="flex justify-end mb-8">
                <Link
                  to="/forgot-password"
                  className="text-sm text-gray-500 hover:text-blue-600">
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              <button type="submit" className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition mt-10 mb-2">
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