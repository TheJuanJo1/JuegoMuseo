// src/pages/Inicio.js
import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen flex flex-col font-sans overflow-hidden relative"
      style={{ fontFamily: "'Work Sans', sans-serif'" }}
    >
      {/* IMAGEN DE FONDO — colocada PRIMERO en el DOM y con -z para evitar interferencias */}
      <div
        aria-hidden="true"
        className="absolute right-0 bottom-0 w-[60%] h-[80%] bg-no-repeat bg-right-bottom bg-contain pointer-events-none -z-10"
        style={{ backgroundImage: `url(${MainImage})` }}
      />

      {/* NAV SUPERIOR (z alto para garantizar que esté sobre todo) */}
      <nav className="flex justify-between items-center p-6 relative z-40">
        <div className="flex items-center space-x-8">
          <img
            src={Logo}
            alt="Logo"
            style={{
              height: "130px",
              marginTop: "30%",
              marginLeft: "50%",
            }}
          />
        </div>

        <div
          className="flex items-center space-x-12"
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

      {/* CONTENIDO */}
      <div
        className="flex flex-1 items-center justify-between px-12 relative z-30"
        style={{ marginTop: "-6%" }}
      >
        <div className="max-w-lg space-y-12">
          <h1 className="text-4xl font-bold" style={{ fontSize: "3rem", marginBottom: "1.5rem" }}>
            ¿Quiénes Somos?
          </h1>

          <p className="text-gray-700 text-lg" style={{ fontSize: "1.4rem", lineHeight: "2rem", marginBottom: "2rem" }}>
            En FluxData somos el puente que actúa de manera confiable entre las empresas y la DIAN,
            simplificando el proceso de facturación electrónica con seguridad y eficiencia.
          </p>
        </div>
      </div>
    </div>
  );
}
