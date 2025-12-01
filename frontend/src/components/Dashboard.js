import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart, Line, ResponsiveContainer, PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";
import { API_URL } from "../config.js";

export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState(null);
  const [estadisticas, setEstadisticas] = useState({ Aceptado: 0, Rechazado: 0, Pendiente: 0 });
  const [tipos, setTipos] = useState({ Factura: 0, "Nota Crédito": 0, "Nota Débito": 0 });
  const [totalDocs, setTotalDocs] = useState(0);

  const estadoColors = ["#27374D", "#DDE6ED", "#526D82"];
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Cargar datos desde el nuevo backend xmldashboard.js
  const loadData = async () => {
    try {
      const res = await fetch(`${API_URL}`, { credentials: "include" });
      const data = await res.json();

      setDocs(Array.isArray(data.docs) ? data.docs : []);
      setEstadisticas(data.estadisticas || { Aceptado: 0, Rechazado: 0, Pendiente: 0 });
      setTipos(data.tipos || { Factura: 0, "Nota Crédito": 0, "Nota Débito": 0 });
      setTotalDocs(data.total || 0);
    } catch (err) {
      console.error("Error cargando datos:", err);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrado
  const filteredDocs = useMemo(() => {
    if (!filter) return docs;
    return docs.filter((d) => {
      if (filter.tipo === "Factura") return d.tipo_documento.toLowerCase().includes("factura");
      if (filter.tipo === "Nota Crédito") return d.tipo_documento.toLowerCase().includes("nota crédito");
      if (filter.tipo === "Nota Débito") return d.tipo_documento.toLowerCase().includes("nota débito");
      return true;
    });
  }, [docs, filter]);

  // Datos derivados
  const facturaDocs = useMemo(() => docs.filter(d => d.tipo_documento.toLowerCase().includes("factura")), [docs]);
  const notaCreditoDocs = useMemo(() => docs.filter(d => d.tipo_documento.toLowerCase().includes("nota crédito")), [docs]);
  const notaDebitoDocs = useMemo(() => docs.filter(d => d.tipo_documento.toLowerCase().includes("nota débito")), [docs]);

  const last7Days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const day = new Date();
      day.setDate(day.getDate() - i);
      return day.toISOString().split("T")[0];
    }).reverse();
  }, []);

  const trendData = useMemo(() => {
    return last7Days.map((date) => ({
      date,
      Facturas: facturaDocs.filter((d) => d.fecha_emision.startsWith(date)).length,
    }));
  }, [last7Days, facturaDocs]);

  const estadoDocs = useMemo(() => [
    { name: "Aceptados", value: estadisticas.Aceptado },
    { name: "Rechazados", value: estadisticas.Rechazado },
    { name: "Pendientes", value: estadisticas.Pendiente },
  ], [estadisticas]);

  const totalPorTipo = useMemo(() => [
    { name: "Factura", value: tipos.Factura },
    { name: "Nota Crédito", value: tipos["Nota Crédito"] },
    { name: "Nota Débito", value: tipos["Nota Débito"] },
  ], [tipos]);

  // Modal
  const openModal = (content) => {
    setModalContent(content);
    setModalOpen(true);
  };

  // Subida de archivos
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("archivo", file);

    try {
      const res = await fetch("http://localhost:3000/api/dashboard-xml/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();
      alert(data.message || "Archivo procesado correctamente");

      // Recargar datos automáticamente
      loadData();
    } catch (err) {
      console.error(err);
      alert("Error subiendo el archivo");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <button onClick={() => document.getElementById("fileUpload").click()}
        className="text-white px-4 py-2 rounded shadow transition"
        style={{ backgroundColor: "#27374D" }}> Subir XML </button>
        <input id="fileUpload" type="file" accept=".xml,.pdf,.zip" className="hidden" onChange={handleFileUpload} />
      </div>
      <div className="flex space-x-4 mb-6">
        <div className="bg-white p-4 rounded shadow w-1/4 cursor-pointer" onClick={() => setFilter({ tipo: "Factura" })}>
          <h3 className="text-lg font-semibold">Facturas emitidas</h3>
          <p className="text-2xl font-bold">{facturaDocs.length}</p>
          <p className="text-sm text-gray-500">Últimos 7 días</p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line type="monotone" dataKey="Facturas" stroke="#27374D" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow w-1/4 cursor-pointer" onClick={() => setFilter({ tipo: "Factura" })}>
          <h3 className="text-lg font-semibold mb-2">Estado de facturas</h3>
          <div className="flex items-center space-x-4">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie data={[
                  { name: "Aceptadas", value: facturaDocs.filter(f => f.estado_dian === "Aceptado").length },
                  { name: "Rechazadas", value: facturaDocs.filter(f => f.estado_dian === "Rechazado").length }
                ]} dataKey="value" innerRadius={25} outerRadius={35}>
                  {["#27374D", "#DDE6ED"].map((c, i) => <Cell key={i} fill={c} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <p>Aceptadas: {facturaDocs.filter(f => f.estado_dian === "Aceptado").length}</p>
              <p>Rechazadas: {facturaDocs.filter(f => f.estado_dian === "Rechazado").length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow w-1/4 cursor-pointer" onClick={() => setFilter({ tipo: "Nota Crédito" })}>
          <h3 className="text-lg font-semibold">Notas crédito</h3>
          <p className="text-2xl font-bold">{notaCreditoDocs.length}</p>
        </div>
        <div className="bg-white p-4 rounded shadow w-1/4 cursor-pointer" onClick={() => setFilter({ tipo: "Nota Débito" })}>
          <h3 className="text-lg font-semibold">Notas débito</h3>
          <p className="text-2xl font-bold">{notaDebitoDocs.length}</p>
        </div>
      </div>

      {/* Gráficos de estado y totales */}
      <div className="flex space-x-4 mb-6">
        {/* Estado documentos */}
        <div className="bg-white p-4 rounded shadow w-1/3 relative">
          <h3 className="text-lg font-semibold mb-2">Estado documentos</h3>
          <button onClick={() => openModal("estado")} className="absolute top-2 right-2 text-blue-600 hover:underline">Más detalles</button>
          <div className="flex items-center">
            <div className="relative w-[120px] h-[120px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie data={estadoDocs} dataKey="value" innerRadius={40} outerRadius={55} paddingAngle={2}>
                    {estadoDocs.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={estadoColors[index % estadoColors.length]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">{totalDocs.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Documentos</p>
              </div>
            </div>
          </div>
        </div>

        {/* Total por tipo */}
        <div className="bg-white p-4 rounded shadow w-1/3 relative">
          <h3 className="text-lg font-semibold mb-2">Total por documento</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart data={totalPorTipo}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value">
                {totalPorTipo.map((entry, index) => {
                  let fillColor = entry.name === "Factura" ? "#27374D" : entry.name === "Nota Crédito" ? "#526D82" : "#DDE6ED";
                  return <Cell key={index} fill={fillColor} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Total documentos */}
        <div className="bg-white p-4 rounded shadow w-1/3 relative">
          <h3 className="text-lg font-semibold mb-2">Total de documentos</h3>
          <ResponsiveContainer width="100%" height={150}>
            <BarChart layout="vertical" data={[{ name: "Total", value: totalDocs }]}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis type="category" dataKey="name" width={80} />
              <Tooltip />
              <Bar dataKey="value" fill="#27374D" barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Tabla de documentos */}
      <div className="mt-6 bg-white rounded shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3">Últimos documentos enviados</h2>
        <div className="max-h-64 overflow-y-auto border rounded">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Tipo</th>
                <th className="p-2 border">CUFE/CUDE</th>
                <th className="p-2 border">Estado</th>
                <th className="p-2 border">Fecha</th>
                <th className="p-2 border">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {Array.isArray(filteredDocs) && filteredDocs.map((d, i) => (
                <React.Fragment key={d.id_documento}>
                  <tr>
                    <td className="p-2 border">{d.tipo_documento}</td>
                    <td className="p-2 border">{(() => { const cufe = d.cufe || d.cude;
                    if (!cufe) return "-";
                    if (cufe.length <= 12) return cufe;
                    return `${cufe.slice(0, 4)}...${cufe.slice(-4)}`;
                    })()}</td>
                    <td className="p-2 border">{d.estado_dian}</td>
                    <td className="p-2 border">{new Date(d.fecha_emision).toLocaleDateString("es-CO")}</td>
                    <td className="p-2 border">
                      <button className="text-blue-600 hover:underline"
                        onClick={() => setSelectedDoc(selectedDoc === i ? null : i)}>
                        Ver detalle
                      </button>
                    </td>
                  </tr>
                  {selectedDoc === i && (
                    <tr><td colSpan="5" className="p-4 bg-gray-50">
                      <strong>Detalles del documento:</strong>
                      {d.Producto_Factura?.length > 0 ? (
                        <>
                          <p className="mt-2 font-semibold">Productos:</p>
                          <ul className="list-disc ml-5">
                            {d.Producto_Factura.map((p, idx) => (
                              <li key={idx}>{p.descripcion} - Cantidad: {p.cantidad} - Valor: ${p.total}</li>
                            ))}
                          </ul>
                        </>
                      ) : (
                        <p>Total facturado: ${d.valor_total}</p>
                      )}
                      <p className="mt-2 text-sm text-gray-500">
                        Hora: {new Date(d.fecha_emision).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: false })}
                      </p>
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 h-96 relative flex flex-col items-center justify-center">
            <button onClick={() => setModalOpen(false)} className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold">&times;</button>
            {modalContent === "estado" && (
              <>
                <h2 className="text-xl font-semibold mb-4">Estado de documentos</h2>
                {estadoDocs.map((d, i) => <p key={i} className="text-lg mb-2">{d.name}: {d.value}</p>)}
              </>
            )}
            {modalContent === "total" && (
              <>
                <h2 className="text-xl font-semibold mb-4">Total de documentos</h2>
                <p className="text-xl font-bold">{totalDocs}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}