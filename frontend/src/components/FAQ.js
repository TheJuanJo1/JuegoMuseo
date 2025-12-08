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

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <div className="w-full min-h-screen bg-[#d9e3ea] flex justify-center py-10 px-4">

      <div className="bg-white w-full max-w-6xl rounded-xl shadow-lg relative overflow-visible"
           style={{ minHeight: "85vh" }}>

        {/* Flecha */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-6 left-6 w-7 z-50"
        >
          <img src={backArrow} alt="Back" />
        </button>

        {/* Contenido principal */}
        <div className="relative px-10 pt-20 pb-20 flex flex-col lg:flex-row gap-10 z-20">

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
              <div key={i} className="border-b py-4 pr-4">
                <button
                  className="w-full flex justify-between items-center text-gray-800 text-sm lg:text-base"
                  onClick={() => toggle(i)}
                >
                  {item.q}
                  <span className="text-xl">{openIndex === i ? "−" : "+"}</span>
                </button>

                {openIndex === i && (
                  <p className="mt-2 text-gray-600 text-sm leading-relaxed">
                    {item.a}
                  </p>
                )}
              </div>
            ))}
          </div>

        </div>

        {/* OLAS — FIJAS, COMPLETAS Y SIN RECORTARSE */}
        <div
          className="absolute left-0 w-full"
          style={{
            bottom: "-1px",
            height: "230px",
            overflow: "visible",
            zIndex: 10
          }}
        >
          <img
            src={V2}
            alt="Olas"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              display: "block",
            }}
          />
        </div>

      </div>
    </div>
  );
}
