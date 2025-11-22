import React,{ useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LineChart,Line,ResponsiveContainer,PieChart,Pie,Cell,Tooltip,BarChart,Bar,XAxis,YAxis,CartesianGrid,
} from "recharts";
export default function Dashboard() {
  const navigate = useNavigate();
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState(null);
  const [estadisticas, setEstadisticas] = useState({
    Aceptado: 0,
    Rechazado: 0,
    Pendiente: 0,
  });

  const estadoColors = ["#27374D", "#DDE6ED", "#526D82"]; // Colores nuevos
  const [modalOpen, setModalOpen] = useState(false); // Controla si el modal se muestra
  const [modalContent, setModalContent] = useState(null); // Controla qué datos mostrar
  const [selectedDoc, setSelectedDoc] = useState(null);
  const API_URL = process.env.REACT_APP_API_URL || "https://fluxdata-1.onrender.com";


  // Cargar últimos documentos
  useEffect(() => {
    fetch(`${API_URL}/api/ultimos`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  // Cargar estadísticas globales
  useEffect(() => {
    fetch(`${API_URL}/api/estadisticas`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setEstadisticas(data))
      .catch((err) => console.error(err));
  }, []);

  const filteredDocs = filter
    ? docs.filter((d) => {
        if (filter.tipo === "Factura")
          return d.tipo_documento.toLowerCase().includes("factura");
        if (filter.tipo === "Nota Crédito")
          return d.tipo_documento.toLowerCase().includes("nota crédito");
        if (filter.tipo === "Nota Débito")
          return d.tipo_documento.toLowerCase().includes("nota débito");
        return true;
      })
    : docs;

  const facturaDocs = docs.filter((d) =>
    d.tipo_documento.toLowerCase().includes("factura")
  );
  const notaCreditoDocs = docs.filter((d) =>
    d.tipo_documento.toLowerCase().includes("nota crédito")
  );
  const notaDebitoDocs = docs.filter((d) =>
    d.tipo_documento.toLowerCase().includes("nota débito")
  );

  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const day = new Date();
    day.setDate(day.getDate() - i);
    return day.toISOString().split("T")[0];
  }).reverse();

  const trendData = last7Days.map((date) => ({
    date,
    Facturas: facturaDocs.filter((d) => d.fecha_emision.startsWith(date))
      .length,
  }));

  const estadoDocs = [
    { name: "Aceptados", value: estadisticas.Aceptado },
    { name: "Rechazados", value: estadisticas.Rechazado },
    { name: "Pendientes", value: estadisticas.Pendiente },
  ];
  const totalDocs = estadoDocs.reduce((sum, e) => sum + e.value, 0);

  const totalPorTipo = [
    { name: "Factura", value: facturaDocs.length },
    { name: "Nota Crédito", value: notaCreditoDocs.length },
    { name: "Nota Débito", value: notaDebitoDocs.length },
  ];

  const openModal = (content) => {
  setModalContent(content); // "estado" o "total"
  setModalOpen(true);
};


  return (
    <div className="p-6">
      <div className="flex space-x-4 mb-6">
        <div
          className="bg-white p-4 rounded shadow w-1/4 cursor-pointer"
          onClick={() => setFilter({ tipo: "Factura" })}>
          <h3 className="text-lg font-semibold">Facturas emitidas</h3>
          <p className="text-2xl font-bold">{facturaDocs.length}</p>
          <p className="text-sm text-gray-500">Últimos 7 días</p>
          <div className="h-16">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <Line
                  type="monotone"
                  dataKey="Facturas"
                  stroke="#4F46E5"
                  strokeWidth={2}
                  dot={false}/>
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded shadow w-1/4 cursor-pointer"
          onClick={() => setFilter({ tipo: "Factura" })}>
          <h3 className="text-lg font-semibold mb-2">Estado de facturas</h3>
          <div className="flex items-center space-x-4">
            <ResponsiveContainer width={80} height={80}>
              <PieChart>
                <Pie
                  data={[
                    {
                      name: "Aceptadas",
                      value: facturaDocs.filter(
                        (f) => f.estado_dian === "Aceptado"
                      ).length,
                    },
                    {
                      name: "Rechazadas",
                      value: facturaDocs.filter(
                        (f) => f.estado_dian === "Rechazado"
                      ).length,
                    },
                  ]}
                  dataKey="value"
                  innerRadius={25}
                  outerRadius={35}>
                  {["#27374D", "#DDE6ED"].map((c, i) => (
                    <Cell key={i} fill={c} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div>
              <p>
                Aceptadas:{" "}
                {facturaDocs.filter((f) => f.estado_dian === "Aceptado").length}
              </p>
              <p>
                Rechazadas:{" "}
                {facturaDocs.filter((f) => f.estado_dian === "Rechazado").length}
              </p>
            </div>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded shadow w-1/4 cursor-pointer"
          onClick={() => setFilter({ tipo: "Nota Crédito" })}>
          <h3 className="text-lg font-semibold">Notas crédito</h3>
          <p className="text-2xl font-bold">{notaCreditoDocs.length}</p>
          <div className="mt-2 text-sm">
            <p>
              Aceptadas:{" "}
              {notaCreditoDocs.filter((n) => n.estado_dian === "Aceptado").length}
            </p>
            <p>
              Rechazadas:{" "}
              {notaCreditoDocs.filter((n) => n.estado_dian === "Rechazado").length}
            </p>
          </div>
        </div>
        <div
          className="bg-white p-4 rounded shadow w-1/4 cursor-pointer"
          onClick={() => setFilter({ tipo: "Nota Débito" })}>
          <h3 className="text-lg font-semibold">Notas débito</h3>
          <p className="text-2xl font-bold">{notaDebitoDocs.length}</p>
          <div className="mt-2 text-sm">
            <p>
              Aceptadas:{" "}
              {notaDebitoDocs.filter((n) => n.estado_dian === "Aceptado").length}
            </p>
            <p>
              Rechazadas:{" "}
              {notaDebitoDocs.filter((n) => n.estado_dian === "Rechazado").length}
            </p>
          </div>
        </div>
      </div>
      <div className="flex space-x-4 mb-6">
        <div className="bg-white p-4 rounded shadow w-1/3 relative">
          <h3 className="text-lg font-semibold mb-2">Estado documentos</h3>
          <button onClick={() => openModal("estado")} className="absolute top-2 right-2 text-blue-600 hover:underline">
            Más detalles
          </button>
          <div className="flex items-center">
            <div className="relative w-[120px] h-[120px]">
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={estadoDocs}
                    dataKey="value"
                    innerRadius={40}
                    outerRadius={55}
                    paddingAngle={2}>
                    {estadoDocs.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={estadoColors[index % estadoColors.length]}/>
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <p className="text-lg font-bold">{totalDocs.toLocaleString()}</p>
                <p className="text-xs text-gray-500">Documentos</p>
              </div>
            </div>
            <div className="ml-6 space-y-2">
              {estadoDocs.map((doc, i) => (
                <div key={i} className="flex items-center space-x-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: estadoColors[i] }}
                  ></span>
                  <span className="text-sm">{doc.name}</span>
                  <span className="ml-2 font-semibold">{doc.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
<div className="bg-white p-4 rounded shadow w-1/3 relative">
  <h3 className="text-lg font-semibold mb-2">Total por documento</h3>
  <button
    onClick={() => navigate("/reportes")}
    className="absolute top-2 right-2 text-blue-600 hover:underline"
  >
    Más detalles
  </button>
  <ResponsiveContainer width="100%" height={150}>
    <BarChart data={totalPorTipo}>
      <CartesianGrid strokeDasharray="3 3" />
      <XAxis dataKey="name" />
      <YAxis />
      <Tooltip />
      <Bar dataKey="value">
        {totalPorTipo.map((entry, index) => {
          let fillColor = "";
          if (entry.name === "Factura") fillColor = "#27374D";
          else if (entry.name === "Nota Crédito") fillColor = "#526D82";
          else if (entry.name === "Nota Débito") fillColor = "#DDE6ED";
          return <Cell key={index} fill={fillColor} />;
        })}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
</div>
<div className="bg-white p-4 rounded shadow w-1/3 relative">
  <h3 className="text-lg font-semibold mb-2">Total de documentos</h3>
  <button
  onClick={() => openModal("total")} 
  className="absolute top-2 right-2 text-blue-600 hover:underline">
  Más detalles
</button>

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
      <div className="mt-6 bg-white rounded shadow-md p-4">
        <h2 className="text-lg font-semibold mb-3">
          Últimos documentos enviados
        </h2>
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
              {Array.isArray(filteredDocs) &&
    filteredDocs.map((d, i) => (
      <React.Fragment key={d.id_documento}>
        <tr>
          <td className="p-2 border">{d.tipo_documento}</td>
          <td className="p-2 border">{d.cufe || d.cude || "-"}</td>
          <td className="p-2 border">{d.estado_dian}</td>
          <td className="p-2 border">{new Date(d.fecha_emision).toLocaleDateString("es-CO")}</td>
          <td className="p-2 border">
            <button
              className="text-blue-600 hover:underline"
              onClick={() =>
                setSelectedDoc(selectedDoc === i ? null : i)
              }>
              Ver detalle
            </button>
          </td>
        </tr>
        {selectedDoc === i && (
          <tr><td colSpan="5" className="p-4 bg-gray-50">
            <strong>Detalles del documento:</strong>
            {d.Producto_Factura?.length > 0 ? (<>
            <p className="mt-2 font-semibold">Productos:</p>
            <ul className="list-disc ml-5">
              {d.Producto_Factura.map((p, idx) => (
                <li key={idx}>
                  {p.nombre_producto} - Cantidad: {p.cantidad} - Valor: ${p.valor}
                  </li>
                ))}
                </ul>
                </>) : (<p>Total facturado: ${d.valor_total}</p>)}
                <p className="mt-2 text-sm text-gray-500">
                  Hora: {new Date(d.fecha_emision).toLocaleTimeString("es-CO", {
                    hour: "2-digit", minute: "2-digit", hour12: false })}</p>
                    </td>
                  </tr>
                )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-between items-start mt-4">
        <div className="bg-white border border-gray-200 rounded p-3 w-1/3 shadow-sm">
          <h3 className="text-sm font-semibold text-black mb-2">Avisos</h3>
          <ul className="text-xs text-black space-y-1">
            <li>Recuerda revisar documentos pendientes.</li>
            <li>Algunos CUFE están en validación.</li>
            <li>Última sincronización exitosa.</li>
          </ul>
        </div>
        <button
          onClick={() => navigate("/historial")}
          className="text-blue-600 hover:underline">
          Ver historial completo
        </button>
        {modalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-96 h-96 relative flex flex-col items-center justify-center">
              <button
        onClick={() => setModalOpen(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl font-bold"
      >
        &times;
      </button>

      {modalContent === "estado" && (
        <>
          <h2 className="text-xl font-semibold mb-4">Estado de documentos</h2>
          {estadoDocs.map((d, i) => (
            <p key={i} className="text-lg mb-2">
              {d.name}: {d.value}
            </p>
          ))}
        </>
      )}
      {modalContent === "total" && (<> <h2 className="text-xl font-semibold mb-4">Total de documentos</h2>
      <p className="text-xl font-bold">{totalDocs}</p>
         </>
         )} 
        </div>
       </div>
       )}
      </div>
    </div>
  );
}
