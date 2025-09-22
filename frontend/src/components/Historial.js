// frontend/src/pages/Historial.js
import { useEffect, useState } from "react";

export default function Historial() {
  const [docs, setDocs] = useState([]);

  useEffect(() => {
    fetch("http://localhost:3000/api/facturas-notas/historial", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

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
      </div>
    </div>
  );
}
