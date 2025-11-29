import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col font-sans overflow-hidden relative">

      {/* NAV */}
      <nav className="flex justify-between items-center p-4 md:p-6 z-20">
        {/* Logo */}
        <img
          src={Logo}
          alt="Logo"
          className="h-20 md:h-28 lg:h-36 ml-2 md:ml-0 object-contain"
        />

        {/* Botones escritorio */}
        <div className="hidden md:flex items-center space-x-10 pr-4">
          <button
            className="px-4 py-2 text-black rounded-md border border-transparent hover:border-black transition"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>
          <button
            className="px-4 py-2 text-black rounded-md border border-transparent hover:border-black transition"
            onClick={() => navigate("/register", { state: { fromInicio: true } })}
          >
            Registrarse
          </button>
          <button
            className="px-4 py-2 text-black rounded-md border border-transparent hover:border-black transition"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Menú móvil */}
      <div className="flex md:hidden justify-center space-x-3 pb-4">
        <button className="px-3 py-1 border rounded" onClick={() => navigate("/faq")}>
          FAQ
        </button>
        <button className="px-3 py-1 border rounded" onClick={() => navigate("/register")}>
          Registrarse
        </button>
        <button className="px-3 py-1 border rounded" onClick={() => navigate("/login")}>
          Login
        </button>
      </div>

      {/* CONTENIDO */}
      <div className="flex flex-col lg:flex-row flex-1 items-center justify-between px-6 md:px-12 relative z-10 mt-6 lg:mt-0">

        {/* TEXTO */}
        <div className="max-w-xl text-center lg:text-left space-y-8">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold">
            ¿Quiénes Somos?
          </h1>

          <p className="text-gray-700 text-lg md:text-xl leading-relaxed">
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </div>

        {/* IMAGEN */}
        <div
          className="
            w-full 
            lg:w-1/2 
            h-64 
            md:h-96 
            bg-no-repeat 
            bg-contain 
            bg-right-bottom 
            mt-10 
            lg:mt-0
          "
          style={{ backgroundImage: `url(${MainImage})` }}
        />
      </div>
    </div>
  );
}
