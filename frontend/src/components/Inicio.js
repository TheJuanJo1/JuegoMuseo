import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen flex flex-col font-sans relative overflow-hidden">

      {/* NAV */}
      <nav className="flex justify-between items-center px-6 py-4 md:px-12 z-20 bg-white">
        <img
          src={Logo}
          alt="Logo"
          className="h-16 md:h-24 object-contain"
        />

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
      <div className="flex flex-col flex-1 px-6 md:px-12 lg:px-16 relative z-10">

        {/* TEXTO */}
        <div className="max-w-2xl mx-auto text-center mt-8 md:mt-14 lg:mt-20">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
            ¿Quiénes Somos?
          </h1>

          <p className="text-gray-700 text-lg md:text-xl leading-relaxed mb-12">
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </div>

        {/* IMAGEN - MOBILE (dentro del flujo, abajo) */}
        <div className="block lg:hidden w-full flex justify-center mt-6 mb-10">
          <img
            src={MainImage}
            alt="Imagen descriptiva"
            className="w-3/4 sm:w-2/3 md:w-1/2 object-contain"
          />
        </div>
      </div>

      {/* IMAGEN - DESKTOP (absoluta en la esquina) */}
      <div
        className="hidden lg:block"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "55%",
          height: "85%",
          backgroundImage: `url(${MainImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right bottom",
          backgroundSize: "contain",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}