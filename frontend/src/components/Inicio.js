import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 z-20">
        
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="h-16 md:h-24 lg:h-32 object-contain"
        />

        {/* Buttons Desktop */}
        <div className="hidden md:flex items-center space-x-8">
          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent hover:border-black transition"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>

          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent hover:border-black transition"
            onClick={() =>
              navigate("/register", { state: { fromInicio: true } })
            }
          >
            Registrarse
          </button>

          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent hover:border-black transition"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 lg:px-16 flex-1 mt-10 lg:mt-0 relative z-10">

        {/* Texto */}
        <div className="max-w-lg space-y-6">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            ¿Quiénes Somos?
          </h1>

          <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </div>

      </div>

      {/* IMAGEN DECORATIVA */}
      <div
        aria-hidden="true"
        className="
          absolute 
          right-0 
          bottom-0 
          w-[70%] 
          h-[40%]
          sm:w-[60%] sm:h-[50%]
          md:w-[55%] md:h-[60%]
          lg:w-[45%] lg:h-[75%]
          bg-no-repeat bg-contain bg-right-bottom 
          pointer-events-none z-0
        "
        style={{ backgroundImage: `url(${MainImage})` }}
      />
    </div>
  );
}