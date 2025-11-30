import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col font-sans bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 z-20 w-full">
        
        <img
          src={Logo}
          alt="Logo"
          className="h-16 md:h-24 lg:h-32 object-contain"
        />

        {/* BOTONES AHORA NO SE OCULTAN EN MÓVIL */}
        <div className="flex items-center space-x-4 md:space-x-8">
          <button
            className="px-3 py-2 md:px-4 md:py-2 rounded-md text-black font-medium border border-transparent hover:border-black transition"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>

          <button
            className="px-3 py-2 md:px-4 md:py-2 rounded-md text-black font-medium border border-transparent hover:border-black transition"
            onClick={() =>
              navigate("/register", { state: { fromInicio: true } })
            }
          >
            Registrarse
          </button>

          <button
            className="px-3 py-2 md:px-4 md:py-2 rounded-md text-black font-medium border border-transparent hover:border-black transition"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* CONTENIDO */}
      <div className="flex flex-col-reverse lg:flex-row items-center justify-between px-6 md:px-12 lg:px-16 flex-1 w-full mt-4 md:mt-10">
        
        {/* TEXTO */}
        <div className="max-w-xl space-y-6 text-center lg:text-left mt-6 lg:mt-0">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            ¿Quiénes Somos?
          </h1>

          <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </div>

        {/* IMAGEN — ahora es parte del flujo en móvil */}
        <div className="flex justify-center w-full lg:w-auto">
          <img
            src={MainImage}
            alt="Imagen"
            className="
              w-3/4 sm:w-2/3 md:w-1/2 
              lg:w-[500px] 
              xl:w-[600px] 
              object-contain"
          />
        </div>
      </div>

    </div>
  );
}