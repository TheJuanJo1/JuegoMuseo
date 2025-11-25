import React, { useState } from "react";

const preguntas = [
  {
    pregunta: "¿Cómo enviar una factura?",
    respuesta:
      "Para enviar una factura, ingresa al módulo de Documentos, completa los campos obligatorios y presiona 'Enviar'. Asegúrate de que la fecha y el valor sean correctos.",
  },
  {
    pregunta: "¿Qué hacer si un documento es rechazado por la DIAN?",
    respuesta:
      "Revisa el motivo indicado en 'Acciones' en el detalle del documento. Corrige los errores y vuelve a enviar la factura o nota.",
  },
  {
    pregunta: "¿Cómo buscar documentos específicos?",
    respuesta:
      "Usa el buscador en el visor de documentos para filtrar por número, CUFE o cliente, o aplica los filtros por tipo y estado.",
  },
  {
    pregunta: "¿Dónde puedo descargar el XML o PDF de mis facturas?",
    respuesta:
      "Dentro del detalle de cada documento encontrarás botones para descargar el XML y PDF asociados.",
  },
];

export default function Ayuda() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="bg-white shadow-2xl rounded-2xl p-8 max-w-5xl mx-auto">
        {preguntas.map((item, index) => (
          <div key={index} className="border-b border-gray-200">
            <button
              onClick={() => toggleIndex(index)}
              className="w-full text-left py-4 px-3 flex justify-between items-center hover:bg-gray-50 transition-colors rounded">
              <span className="font-semibold text-lg text-gray-800">
                {item.pregunta}
              </span>
              <span className="text-2xl font-bold text-blue-900">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>
            {activeIndex === index && (
              <div className="p-4 text-gray-700 bg-gray-50 rounded-b text-base leading-relaxed animate-fadeIn">
                {item.respuesta}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}