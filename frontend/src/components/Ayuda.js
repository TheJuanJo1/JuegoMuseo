import React, { useState } from "react";

const preguntas = [
  {
    pregunta: "¿Cómo recibir un XML de factura, nota crédito o débito?",
    respuesta:
      "Los documentos XML se reciben mediante su ingreso desde el Dashboard. Una vez cargado el XML, el sistema analiza su contenido, valida la información y extrae los datos más importantes, que luego se muestran en pantalla como en el Dashboard, Documentos y Reportes",
  },
  {
    pregunta: "¿Cómo visualizar el XML de un documento recibido?",
    respuesta:
      "Dentro de la tabla de Documentos, ubica el documento que deseas consultar y haz clic en el botón de 'Ver XML'. Esto abrirá una ventana o modal con la información del XML, permitiendo revisarla sin descargarla.",
  },
  {
    pregunta: "¿Qué hacer si un documento es rechazado por la DIAN?",
    respuesta:
      "Revisa el motivo del rechazo en la columna 'Estado' o en el detalle del documento. Corrige los errores indicados por la DIAN y espera a que el documento sea reenviado o procesado correctamente.",
  },
  {
    pregunta: "¿Cómo buscar documentos específicos?",
    respuesta:
      "Utiliza el buscador de la tabla de Documentos para filtrar por número de documento, CUFE o cliente. También puedes aplicar filtros por tipo de documento (Factura, Nota Crédito, Nota Débito) o por estado, estos filtros tambien aplican en Reportes donde es mas informativo y crucial con respecto a la información del XML.",
  },
];

export default function Ayuda() {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleIndex = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="p-10 bg-gray-100 min-h-screen">
      <div className="max-w-5xl mx-auto space-y-4">
        {preguntas.map((item, index) => (
          <div
            key={index}
            className="bg-white shadow-lg rounded-2xl overflow-hidden border border-gray-200">
            <button
              onClick={() => toggleIndex(index)}
              className="w-full text-left py-4 px-6 flex justify-between items-center hover:bg-gray-50 transition-colors">
              <span className="font-semibold text-lg text-gray-800">
                {item.pregunta}
              </span>
              <span className="text-2xl font-bold text-blue-900">
                {activeIndex === index ? "−" : "+"}
              </span>
            </button>
            <div
              className={`px-6 py-4 text-gray-700 bg-gray-50 text-base leading-relaxed transition-all duration-300 ease-in-out ${
                activeIndex === index ? "max-h-96 opacity-100" : "max-h-0 opacity-0 overflow-hidden"
              }`}>
              {item.respuesta}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
