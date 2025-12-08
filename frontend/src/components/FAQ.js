import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backArrow from "../assets/back-arrow.svg";
import Logo1 from "../assets/Logo1.svg";
import V2 from "../assets/V2.png";

export default function FAQ() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState(null);

  const preguntas = [
    {
      q: "¿Qué documentos maneja?",
      a: "Invoice (factura), Creditnote (nota crédito), Debitnote (nota débito), ApplicationResponse (respuesta de la DIAN) y AttachedDocument (documentos anexos).",
    },
    {
      q: "¿Qué tecnologías se usan?",
      a: "FluxData usa tecnologías modernas como Node.js, React, PostgreSQL y servicios cloud.",
    },
    {
      q: "¿Qué funcionalidades principales tiene?",
      a: "Factura electrónica, notas crédito/débito, consulta de documentos enviados, validación ante la DIAN y más.",
    },
    {
      q: "¿Cómo se almacenan los documentos?",
      a: "Los documentos se almacenan de forma segura en servidores cifrados y con respaldo automático.",
    },
  ];

  const toggle = (i) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <div className="w-full min-h-screen bg-[#d9e3ea] flex justify-center py-10 px-4">
      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg overflow-hidden relative">

        {/* Flecha regresar */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-7"
        >
          <img src={backArrow} alt="Back" />
        </button>

        {/* Contenedor principal */}
        <div className="flex flex-col lg:flex-row px-10 pt-20 pb-10 gap-10">

          {/* IZQUIERDA */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Preguntas</h1>
            <h2 className="text-4xl font-bold text-[#607d94]">frecuentes</h2>

            <div className="mt-6">
              <img src={Logo1} alt="Logo" className="w-32 opacity-90" />
            </div>
          </div>

          {/* DERECHA */}
          <div className="flex-1 mt-4">
            {preguntas.map((item, i) => (
              <div key={i} className="border-b py-4">
                <button
                  className="w-full flex justify-between items-center text-gray-800 text-sm lg:text-base"
                  onClick={() => toggle(i)}
                >
                  {item.q}
                  <span className="text-xl">{openIndex === i ? "−" : "+"}</span>
                </button>

                {openIndex === i && (
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed pr-6">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Imagen de olas */}
        <img
          src={V2}
          alt="olas"
          className="w-full mt-4 select-none pointer-events-none"
        />
      </div>
    </div>
  );
}
