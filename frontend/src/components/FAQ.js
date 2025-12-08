import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backArrow from "../assets/back-arrow.svg";
import Logo1 from "../assets/Logo1.svg";
import V2 from "../assets/V2.png";

export default function FAQ() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  const preguntas = [
    {
      pregunta: "¿Qué documentos maneja?",
      respuesta:
        "Invoice (factura), CreditNote (nota crédito), DebitNote (nota débito), ApplicationResponse (respuesta de la DIAN) y AttachedDocument (documentos anexos).",
    },
    { pregunta: "¿Qué tecnologías se usan?", respuesta: "Node.js, React, PostgreSQL y Prisma." },
    {
      pregunta: "¿Qué funcionalidades principales tiene?",
      respuesta:
        "Gestión de facturas electrónicas, recepción, validación, envío y almacenamiento.",
    },
    { pregunta: "¿Cómo se almacenan los documentos?", respuesta: "En bases de datos PostgreSQL." },
  ];

  return (
    <div className="w-full min-h-screen bg-[#E8EEF2] flex items-center justify-center p-4 md:p-0">
      <div
        className="relative bg-white rounded-xl shadow-xl w-full h-auto overflow-hidden p-6 md:p-0"
        style={{ maxWidth: "1200px", minHeight: "90vh" }}
      >
        {/* Botón volver */}
        <img
          src={backArrow}
          alt="Volver"
          className="absolute top-6 left-6 cursor-pointer hover:scale-110 transition-all w-10 h-10"
          onClick={() => navigate("/")}
        />

        {/* Títulos */}
        <div className="absolute left-8 md:left-20 top-28 md:top-32">
          <h1 className="font-bold text-4xl md:text-[50px] text-black leading-tight">Preguntas</h1>
          <h1
            className="font-bold text-4xl md:text-[50px] leading-tight"
            style={{ color: "#526D82" }}
          >
            frecuentes
          </h1>
        </div>

        {/* Logo (solo desktop) */}
        <div className="hidden md:block absolute top-64 left-28">
          <img src={Logo1} alt="Logo FluxData" className="w-40 md:w-52" />
        </div>

        {/* Preguntas */}
        <div className="absolute right-6 md:right-24 top-80 md:top-48 w-[85%] md:w-[35%]">
          {preguntas.map((item, i) => (
            <div key={i} className="pb-4">
              <div
                onClick={() => toggle(i)}
                className="flex justify-between items-center border-b pb-3 cursor-pointer"
              >
                <span className="text-base md:text-lg text-gray-800">{item.pregunta}</span>
                <span className="text-xl md:text-2xl ml-4">{open === i ? "−" : "+"}</span>
              </div>
              {open === i && (
                <p className="text-gray-600 mt-2 text-sm md:text-base">{item.respuesta}</p>
              )}
            </div>
          ))}
        </div>

        {/* Imagen inferior */}
        <div className="absolute bottom-0 left-0 w-full h-40 md:h-64 overflow-hidden">
          <img
            src={V2}
            alt="Olas"
            className="w-full h-full object-cover block"
          />
        </div>
      </div>
    </div>
  );
}
