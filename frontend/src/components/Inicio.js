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
      <nav className="flex justify-between items-center p-6 relative z-20">
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
        <div className="flex items-center space-x-12"
        style={{marginTop: "-1%", marginRight: "40px",}}>
          <button className="px-4 py-2 rounded-md text-black font-medium 
             border border-transparent transition-all duration-200 
             hover:border-black" onClick={() => navigate("/faq")}>
              FAQ
              </button>
              <button className="px-4 py-2 rounded-md text-black font-medium 
             border border-transparent transition-all duration-200 
             hover:border-black" onClick={() => navigate("/register", { state: { fromInicio: true } })}>
              Registrarse
              </button>
              <button className="px-4 py-2 rounded-md text-black font-medium 
             border border-transparent transition-all duration-200 
             hover:border-black" onClick={() => navigate("/login")}>
              Iniciar Sesión
              </button>
            </div>
          </nav>
        <div className="flex flex-1 items-center justify-between px-12 relative z-10"
        style={{
          marginTop: "-6%",              
        }}>
        <div className="max-w-lg space-y-12">
          <h1 className="text-4xl font-bold"
                style={{
                  fontSize: "3rem",
                  marginBottom: "1.5rem", 
                  }}>¿Quiénes Somos?</h1>
          <p className="text-gray-700 text-lg"
          style={{
            fontSize: "1.4rem",
            lineHeight: "2rem",   
            marginBottom: "2rem", 
            }}>
            En FluxData somos el puente que actúa de manera confiable entre
            las empresas y la DIAN, simplificando el proceso de facturación
            electrónica con seguridad y eficiencia.
          </p>
        </div>
      </div>
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          bottom: 0,
          right: 0,
          width: "60%",        
          height: "80%",      
          backgroundImage: `url(${MainImage})`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right bottom",
          backgroundSize: "contain",
          zIndex: 0,       
          pointerEvents: "none"
        }}/>
    </div>
  );
}
