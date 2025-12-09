import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Historial() {
  const [docs, setDocs] = useState([]);
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL; 

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Historial de Documentos</h1>

      <div className="bg-white rounded shadow-md p-4">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 text-left">
              <th className="p-2 border">Tipo</th>
              <th className="p-2 border">CUFE/CUDE</th>
              <th className="p-2 border">Estado</th>
              <th className="p-2 border">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id_documento}>
                <td className="p-2 border">{d.tipo_documento}</td>
                <td className="p-2 border">{d.cufe || d.cude}</td>
                <td className="p-2 border">{d.estado_dian}</td>
                <td className="p-2 border">
                  {new Date(d.fecha_emision).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end mt-4">
          <button
            onClick={() => navigate("/Dashboard")}
            className="px-4 py-2 bg-[#27374D] text-white rounded hover:bg-[#1f2a3b]"
          >
            Regresar
          </button>
        </div>
      </div>
    </div>
  );
}