import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen flex flex-col font-sans overflow-hidden relative"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-6 relative z-20">

        {/* LOGO */}
        <div className="flex items-center">
          <img
            src={Logo}
            alt="Logo"
            className="h-24 md:h-32"
            style={{
              marginTop: "10px",
              marginLeft: "10px",
            }}
          />
        </div>

        {/* MENU */}
        <div
          className="hidden md:flex items-center space-x-12"
          style={{ marginRight: "40px" }}
        >
          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent transition-all hover:border-black"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>

          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent transition-all hover:border-black"
            onClick={() => navigate("/register", { state: { fromInicio: true } })}
          >
            Registrarse
          </button>

          <button
            className="px-4 py-2 rounded-md text-black font-medium border border-transparent transition-all hover:border-black"
            onClick={() => navigate("/login")}
          >
            Iniciar Sesión
          </button>
        </div>

        {/* MENU MÓVIL */}
        <div className="flex md:hidden gap-3">
          <button
            className="text-black font-medium px-2 py-1"
            onClick={() => navigate("/faq")}
          >
            FAQ
          </button>
          <button
            className="text-black font-medium px-2 py-1"
            onClick={() => navigate("/register", { state: { fromInicio: true } })}
          >
            Registro
          </button>
          <button
            className="text-black font-medium px-2 py-1"
            onClick={() => navigate("/login")}
          >
            Login
          </button>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <div
        className="flex flex-col md:flex-row flex-1 items-center justify-between px-8 md:px-12 relative z-10"
      >
        {/* TEXTO */}
        <div className="max-w-lg space-y-8 mt-6 md:mt-0">
          <h1
            className="font-bold"
            style={{ fontSize: "2.4rem" }}
          >
            ¿Quiénes Somos?
          </h1>

          <p
            className="text-gray-700"
            style={{
              fontSize: "1.2rem",
              lineHeight: "1.9rem",
            }}
          >
            En FluxData somos el puente confiable entre las empresas y la DIAN,
            simplificando el proceso de facturación electrónica con seguridad y eficiencia.
          </p>
        </div>

        {/* IMAGEN PRINCIPAL */}
        <div className="w-full md:w-auto md:absolute md:bottom-0 md:right-0">
          <div
            aria-hidden="true"
            className="w-full h-64 md:h-[80vh]"
            style={{
              backgroundImage: `url(${MainImage})`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right bottom",
              backgroundSize: "contain",
              pointerEvents: "none",
            }}
          ></div>
        </div>
      </div>
    </div>
  );
}