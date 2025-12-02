import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip,Cell, CartesianGrid, ResponsiveContainer, LabelList } from "recharts";
import { API_URL } from "../config.js";

export default function DashboardGlobal() {
  const [resumen, setResumen] = useState({
    totalEmpresas: 0,
    totalDocumentos: 0,
    erroresDocumentos: 0
  });
  const [volumenDocs, setVolumenDocs] = useState([]);
  const [ultimosDocs, setUltimosDocs] = useState([]);
  const [validacionesSemana, setValidacionesSemana] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await fetch(`${API_URL}/api/admin/dashboard`, {

          credentials: "include"
        });
        const data = await res.json();

        setResumen({
          totalEmpresas: data.totalEmpresas,
          totalDocumentos: data.totalDocumentos,
          erroresDocumentos: data.erroresDocumentos
        });

        setVolumenDocs(data.volumenDocs);
        setUltimosDocs(data.ultimosDocs);
        setValidacionesSemana(data.validacionesSemana);

      } catch (err) {
        console.error("Error cargando dashboard:", err);
      }
    };

    fetchDashboard();
    const interval = setInterval(fetchDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-6 w-full font-work-sans space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow rounded-xl p-6 text-center cursor-pointer"
        onClick={() => navigate("/admin/empresas")}>
          <p className="text-gray-500 font-semibold">Total de Empresas</p>
          <p className="text-3xl font-bold">{resumen.totalEmpresas}</p>
          </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 font-semibold">Documentos Procesados</p>
          <p className="text-3xl font-bold">{resumen.totalDocumentos}</p>
        </div>
        <div className="bg-white shadow rounded-xl p-6 text-center">
          <p className="text-gray-500 font-semibold">Documentos con Error</p>
          <p className="text-3xl font-bold text-black-600">{resumen.erroresDocumentos}</p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-center">Volumen de Documentos por Tipo</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={volumenDocs} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tipo" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="cantidad" fill="#27374D" label={{ position: "top" }}>
                {volumenDocs.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={
                    entry.tipo === "Nota Crédito" ? "#526D82" :
                    entry.tipo === "Nota Débito" ? "#DDE6ED" :
                    "#27374D" 
                    }/>
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
        </div>
        <div className="bg-white p-6 rounded shadow w-full">
  <h3 className="text-lg font-semibold mb-4 text-center">Total de Documentos Validados</h3>
  <ResponsiveContainer width="100%" height={300}>
    <BarChart
      layout="vertical"
      data={[{ name: "Validados", value: validacionesSemana.reduce((sum, item) => sum + item.validados, 0) }]}>
      <CartesianGrid strokeDasharray="3 3"/>
      <XAxis type="number" />
      <YAxis type="category" dataKey="name" width={120}/>
      <Tooltip />
      <Bar dataKey="value" fill="#27374D" barSize={60}/>
    </BarChart>
  </ResponsiveContainer>
</div>
    </div>
      <div className="bg-white shadow-xl rounded-xl p-6">
  <h2 className="text-lg font-semibold mb-4 text-center">Últimos Documentos Recibidos</h2>
  <div className="max-h-40 overflow-y-auto border border-gray-300 rounded-lg">
    <table className="min-w-full w-full border-collapse">
      <thead className="bg-gray-100 border-b border-gray-300">
        <tr>
          <th className="px-4 py-2 border border-gray-300">Empresa</th>
          <th className="px-4 py-2 border border-gray-300">Tipo</th>
          <th className="px-4 py-2 border border-gray-300">Número</th>
          <th className="px-4 py-2 border border-gray-300">Fecha</th>
          <th className="px-4 py-2 border border-gray-300">Estado Documento</th>
          <th className="px-4 py-2 border border-gray-300">Estado Empresa</th>
        </tr>
      </thead>
      <tbody>
        {ultimosDocs.length > 0 ? (
          ultimosDocs.map((doc, i) => (
            <tr key={i} className="hover:bg-gray-50">
              <td className="px-4 py-2 border border-gray-300 text-black">{doc.empresa}</td>
              <td className="px-4 py-2 border border-gray-300 text-black">{doc.tipo}</td>
              <td className="px-4 py-2 border border-gray-300 text-black">{doc.numero_documento}</td>
              <td className="px-4 py-2 border border-gray-300 text-black">{doc.fecha}</td>
              <td className="px-4 py-2 border border-gray-300 font-semibold text-black">{doc.estado}</td>
              <td className="px-4 py-2 border border-gray-300 font-semibold text-black">
                <span className={`underline font-semibold ${
                  doc.estadoEmpresa.toLowerCase() === "activo" ? "text-green-400" : "text-yellow-400"
                }`}>
                  {doc.estadoEmpresa}
                </span>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="text-center py-4 text-gray-500 border border-gray-300">
              No hay documentos recientes
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
</div>

</div>
);
}

