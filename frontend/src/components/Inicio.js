import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col font-sans relative overflow-hidden bg-white">

      {/* NAVBAR */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 z-20 relative">
        <img
          src={Logo}
          alt="Logo"
          className="h-20 md:h-28"
        />

        <div className="hidden md:flex items-center space-x-12">
          <button
            className="px-4 py-2 rounded-md text-black font-medium hover:underline"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>

          <button
            className="px-4 py-2 rounded-md text-black font-medium hover:underline"
            onClick={() => navigate("/register", { state: { fromInicio: true } })}
          >
            Registrarse
          </button>

          <button
            className="px-4 py-2 rounded-md text-black font-medium hover:underline"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* NAVBAR MOBILE */}
      <div className="flex md:hidden justify-center space-x-8 pb-4">
        <button
          className="text-black font-medium hover:underline"
          onClick={() => navigate("/faq")}
        >
          FAQ
        </button>

        <button
          className="text-black font-medium hover:underline"
          onClick={() => navigate("/register", { state: { fromInicio: true } })}
        >
          Registrarse
        </button>

        <button
          className="text-black font-medium hover:underline"
          onClick={() => navigate("/login")}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between px-6 md:px-12 mt-6 md:mt-10 relative z-10">

        {/* TEXTO, SIEMPRE A LA IZQUIERDA */}
        <div className="max-w-xl text-left space-y-6 md:space-y-8 mt-4">
          <h1 className="text-3xl md:text-4xl font-bold">
            ¿Quiénes Somos?
          </h1>

          <p className="text-gray-700 text-lg leading-relaxed md:text-xl">
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </div>
      </div>

      {/* IMAGEN DE FONDO INFERIOR — SIEMPRE ABAJO */}
      <div
        className="w-full mt-12 md:mt-0"
      >
        <img
          src={MainImage}
          alt="Main"
          className="w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto object-contain select-none pointer-events-none"
        />
      </div>

    </div>
  );
}
