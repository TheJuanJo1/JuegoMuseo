// src/components/ForgotPassword.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";

import fluxLogo from "../assets/fluxdata.svg";
import backArrow from "../assets/back-arrow.svg";
import laptopImage from "../assets/laptop2.jpg";
import laptop1 from "../assets/im1.png";
import { API_URL } from "../config.js";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_URL}api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar enlace");
        return;
      }
      setMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans]"
    style={{
            backgroundImage: `url(${laptop1})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "left center",
            backgroundSize: "62.5% auto",        
            }}>
              <div className="shadow-xl rounded-2xl flex overflow-hidden w-[1150px] h-[700px]"style={{ backgroundColor: "#FFFFFF" }}>
                <div className="w-1/2 flex items-center justify-center bg-white p-2 rounded-l-2xl">
                <img src={laptopImage} alt="Laptop con dashboard" className="object-contain w-[98%] h-[98%] rounded-lg"/>
              </div>
               <div className="w-1/2 flex flex-col justify-center px-12 rounded-r-2xl relative"
                style={{ backgroundColor: "#FFFFFF", clipPath: "polygon(6% 0, 100% 0, 100% 100%, 0% 100%)",}}>
                  <div className="absolute top-8 left-10 right-10 flex justify-between items-center">
                    <img src={fluxLogo} alt="FluxData" className="h-4" />
                    <img src={backArrow} alt="Volver" className="h-6 cursor-pointer" onClick={() => navigate("/login")}/>
                  </div>
                  <div className="mt-20 text-center mb-10">
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">Recuperar contraseña</h1>
                    <p className="text-gray-500 text-lg">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña</p>
                  </div>
                <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
                  {error && (
                    <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
                {error}
              </div>
            )}
            {message && (
              <div className="bg-green-100 text-green-600 p-2 mb-3 rounded text-sm">
                {message}
              </div>
            )}
            <input
              type="email"
              placeholder="Correo electrónico"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"/>
            <button
              type="submit"
              className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition">
              Enviar enlace
            </button>
          </form>
        </div>
      </div>
    </div>
  );
} 