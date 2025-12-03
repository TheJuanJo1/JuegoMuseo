import React from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo1.png";
import MainImage from "../assets/im0.png";

export default function Inicio() {
  const navigate = useNavigate();

  return (
    <div
      className="w-full min-h-screen relative flex flex-col bg-white font-worksans"
      style={{ fontFamily: "'Work Sans', sans-serif" }}
    >
      {/* NAVBAR */}
      <nav className="w-full z-30 px-6 md:px-12 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <img
            src={Logo}
            alt="FluxData Logo"
            className="h-12 md:h-20 object-contain"
          />
        </div>

        {/* Nav links - en movil se envuelven / hacen wrap si necesario */}
        <div className="flex items-center gap-4 md:gap-8 text-sm md:text-base">
          <button
            onClick={() => navigate("/faq")}
            className="px-3 py-2 rounded-md text-black font-medium border border-transparent transition-all duration-200 hover:border-black"
          >
            FAQ
          </button>

          <button
            onClick={() =>
              navigate("/register", { state: { fromInicio: true } })
            }
            className="px-3 py-2 rounded-md text-black font-medium border border-transparent transition-all duration-200 hover:border-black"
          >
            Registrarse
          </button>

          <button
            onClick={() => navigate("/login")}
            className="px-3 py-2 rounded-md text-black font-medium border border-transparent transition-all duration-200 hover:border-black"
          >
            Iniciar Sesión
          </button>
        </div>
      </nav>

      {/* HERO / CONTENT */}
      <main className="w-full flex-1 flex flex-col md:flex-row items-start md:items-center px-6 md:px-12 pt-6 pb-12">
        {/* Texto (siempre alineado a la izquierda en todas las pantallas) */}
        <section className="w-full md:w-1/2 max-w-2xl">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-left">
            ¿Quiénes Somos?
          </h1>

          <p
            className="text-gray-700 text-base md:text-lg leading-relaxed text-left"
            style={{ lineHeight: "1.8rem" }}
          >
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </section>

        {/* Imagen en MÓVIL: normal en el flujo (debajo del texto) */}
        <div className="w-full md:hidden mt-6 flex justify-start">
          <img
            src={MainImage}
            alt="Main"
            className="w-11/12 max-w-xs object-contain pointer-events-none"
            style={{ userSelect: "none" }}
          />
        </div>

        {/* Espacio para que el texto no se pegue a la derecha en pantallas md+ */}
        <div className="hidden md:block md:w-1/2" />
      </main>

      {/* Imagen en DESKTOP: posicionada en la esquina inferior derecha sin afectar el flujo en móvil */}
      <div
        aria-hidden="true"
        className="hidden md:block pointer-events-none absolute bottom-0 right-0 z-0 overflow-hidden"
        style={{ width: "50%", height: "60%" }}
      >
        <img
          src={MainImage}
          alt=""
          className="w-full h-full object-contain"
          style={{ objectPosition: "right bottom", userSelect: "none" }}
        />
      </div>
    </div>
  );
}
