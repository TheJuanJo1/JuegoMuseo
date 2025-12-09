import { useState, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import fluxLogo from "../assets/fluxdata.svg";
import backArrow from "../assets/back-arrow.svg";
import laptopImage from "../assets/laptop.webp";
import laptop from "../assets/im.webp";
import eye from "../assets/eye.svg";
import eye2 from "../assets/eye2.svg";
import { API_URL } from "../config";

export default function LoginForm() {
  const [emailOrName, setEmailOrName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false); 
  const [msg, setMsg] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if (location.state?.msgRegistro) {
      setMsg(location.state.msgRegistro);
      // Borrar el mensaje después de 2 segundos
      const timer = setTimeout(() => setMsg(""), 2000);
      return () => clearTimeout(timer);
    }
  }, [location.state]); 
const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg("");

  try {
    const res = await fetch(`${API_URL}/api/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ emailOrName, password }),
      credentials: "include",
    });

    const data = await res.json();
    console.log(res.status, data); // Para depurar

    if (!res.ok) {
      setMsg(data.error || "Error en login");
setTimeout(() => setMsg(""), 2000);

      return;
    }

    // Navegar directo según rol
    if (data.user.role === "admin") {
      navigate("/admin/dashboard");
    } else {
      localStorage.setItem("usuarioId", data.user.id);
      navigate("/dashboard");
    }
  } catch (err) {
    setMsg("No se pudo conectar con el servidor");
setTimeout(() => setMsg(""), 2000);

  }
};



  return (
    <>
    {msg && (
  <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
    <div className="absolute inset-0 bg-black bg-opacity-20"></div>

    <div className="relative bg-white rounded-xl px-6 py-4 max-w-sm w-full text-center font-[Work Sans] shadow-lg pointer-events-auto">
      <p className="text-black font-semibold">{msg}</p>
    </div>
  </div>
)}
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
            className="object-contain w-[98%] h-[98%] rounded-lg"
          />
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
              onClick={() => navigate("/")}
            />
          </div>
          <div className="flex flex-col justify-center flex-grow">
            <div className="text-center mb-14">
              <h1 className="text-3xl font-bold text-gray-900 mb-3">
                Hola Usuario
              </h1>
              <p className="text-gray-500 text-lg">Bienvenido a FluxData</p>
            </div>
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              <input
                type="text"
                placeholder="Nombre de Usuario o Correo"
                value={emailOrName}
                onChange={(e) => setEmailOrName(e.target.value)}
                className="w-full p-3 mb-5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
              <div className="relative w-full mb-6">
  <input
    type={showPassword ? "text" : "password"} // si showPassword es true, se muestra la contraseña
    placeholder="Contraseña"
    value={password}
    onChange={(e) => setPassword(e.target.value)}
    className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-12"
  />
  <img
    src={showPassword ? eye : eye2} // ojo abierto = mostrar, ojo cerrado = ocultar
    alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 cursor-pointer"
    onClick={() => setShowPassword(!showPassword)}
  />
</div>

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
    </>
  );
}