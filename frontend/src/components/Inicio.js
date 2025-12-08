import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.svg";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();
  return (
    <div
      className="w-full min-h-screen flex flex-col font-sans overflow-hidden relative"
      style={{ fontFamily: "'Work Sans', sans-serif'" }}
    >
      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-6 relative z-20">
        <div className="flex items-center space-x-8">
          <img
            src={Logo}
            alt="Logo"
            className="h-24 md:h-32"
            style={{ marginTop: "10%", marginLeft: "10%" }}
          />
        </div>

        {/* BOTONES NAV RESPONSIVE */}
        <div
          className="hidden md:flex items-center space-x-12"
          style={{ marginTop: "-1%", marginRight: "40px" }}
        >
          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent transition-all duration-200 hover:border-black"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>
          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent transition-all duration-200 hover:border-black"
            onClick={() => navigate("/register", { state: { fromInicio: true } })}
          >
            Registrarse
          </button>
          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent transition-all duration-200 hover:border-black"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* Nav móvil debajo */}
      <div className="flex md:hidden justify-center gap-6 mt-2 z-20">
        <button
          className="px-3 py-2 text-sm rounded-md text-black border border-transparent hover:border-black"
          onClick={() => navigate("/faq")}
        >
          FAQ
        </button>
        <button
          className="px-3 py-2 text-sm rounded-md text-black border border-transparent hover:border-black"
          onClick={() => navigate("/register", { state: { fromInicio: true } })}
        >
          Registrarse
        </button>
        <button
          className="px-3 py-2 text-sm rounded-md text-black border border-transparent hover:border-black"
          onClick={() => navigate("/login")}
        >
          Iniciar Sesión
        </button>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div
        className="flex flex-1 items-center justify-between px-6 md:px-12 relative z-10"
        style={{ marginTop: "-3%" }}
      >
        <div className="max-w-lg space-y-6 md:space-y-12">
          <h1
            className="font-bold text-3xl md:text-5xl"
            style={{ marginBottom: "1.5rem" }}
          >
            ¿Quiénes Somos?
          </h1>

          <p
            className="text-gray-700 text-base md:text-lg"
            style={{ lineHeight: "1.8rem", marginBottom: "2rem" }}
          >
            En FluxData somos el puente que actúa de manera confiable entre las
            empresas y la DIAN, simplificando el proceso de facturación electrónica
            con seguridad y eficiencia.
          </p>
        </div>
      </div>

      {/* IMAGEN DE FONDO LATERAL — RESPONSIVE */}
      <div
        aria-hidden="true"
        className="absolute bottom-0 right-0 z-0 pointer-events-none"
        style={{
          width: "80%",
          height: "50%",
          backgroundImage: `url(${MainImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right bottom",
          backgroundSize: "contain",
        }}
      />
    </div>
  );
}
