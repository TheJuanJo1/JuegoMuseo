import React, { useEffect, useState } from "react";
import { API_URL } from "../config.js";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend,
  PieChart, Pie, Cell, ResponsiveContainer
} from "recharts";

function transformarDocumento(doc) {
  if (!doc) return {};
  const empresa = doc.Usuarios
    ? {
        id_empresa: doc.Usuarios.id_usuario,
        nombre_empresa: doc.Usuarios.nombre_usuario,
        rol_empresa: "Intermediaria",
        nit_empresa: doc.Usuarios.nit_empresa,
        correo_contacto: doc.Usuarios.correo_contacto,
      }
    : null;
  const cliente = doc.Clientes || null;
  const documentoLimpio = Object.fromEntries(
  Object.entries(doc).filter(
    ([k, v]) =>
      v !== null &&
      !["Usuarios", "Clientes", "id_usuario", "id_cliente"].includes(k)
  )
);
  return {
    Empresa: empresa,
    Cliente: cliente,
    Documento: documentoLimpio,
  };
}
const Reportes = () => {
  const [documentos, setDocumentos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    Aceptado: 0,
    Rechazado: 0,
    Pendiente: 0,
  });
  const [filters, setFilters] = useState({
    desde: "",
    hasta: "",
    tipo: "",
    estado: "",
    cliente: "",
  });
  const [selectedDoc, setSelectedDoc] = useState(null);

  // Cargar documentos iniciales
  useEffect(() => {
    fetch(`${API_URL}/ultimos`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDocumentos(Array.isArray(data) ? data.map(transformarDocumento) : []))
      .catch((err) => console.error("Error cargando documentos:", err));
  }, []);
  // Cargar estadísticas iniciales
  useEffect(() => {
    fetch(`${API_URL}/api/estadisticas`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setEstadisticas(data))
      .catch((err) => console.error("Error cargando estadísticas:", err));
  }, []);
  const aplicarFiltros = async () => {
  try {
    const filtrosAplicados = {
      desde: filters.desde || null,
      hasta: filters.hasta || null,
      tipo: filters.tipo || null,
      estado: filters.estado || null,
      cliente: filters.cliente ? filters.cliente.trim() : null,
    };

    const res = await fetch(`${API_URL}/api/filtrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(filtrosAplicados),
    });

    const data = await res.json();
    const docs = Array.isArray(data) ? data.map(transformarDocumento) : [];

    //Actualiza documentos
    setDocumentos(docs);

    //Recalcula estadísticas en base a los documentos filtrados
    const nuevasEstadisticas = {
      Aceptado: docs.filter((d) => d.Documento.estado_dian === "Aceptado").length,
      Rechazado: docs.filter((d) => d.Documento.estado_dian === "Rechazado").length,
      Pendiente: docs.filter((d) => d.Documento.estado_dian === "Pendiente").length,
    };
    setEstadisticas(nuevasEstadisticas);
  } catch (err) {
    console.error("Error aplicando filtros:", err);
  }
};
  useEffect(() => {
    fetch(`${API_URL}/api/filtrar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({}), //sin filtros
    })
      .then((res) => res.json())
      .then((data) => setDocumentos(Array.isArray(data) ? data.map(transformarDocumento) : []))
      .catch((err) => console.error(err));
  }, []);
  // Exportar CSV
  const exportarCSV = () => {
  if (!documentos || documentos.length === 0) {
    alert("No hay documentos para exportar");
    return;
  }

  // Cabecera del CSV
  const encabezado = [
    "Tipo",
    "Número",
    "CUFE/CUDE",
    "Valor total",
    "Fecha",
    "Estado"
  ];

  // Convertir los documentos a filas CSV
  const filas = documentos.map(d => [
    d.Documento.tipo_documento || "-",
    d.Documento.numero_documento || "-",
    d.Documento.cufe || d.Documento.cude || "-",
    d.Documento.valor_total || 0,
    new Date(d.Documento.fecha_emision).toLocaleDateString("es-CO"),
    d.Documento.estado_dian || "-"
  ]);

  // Unir encabezado y filas, separadas por comas
  const contenidoCSV = [encabezado, ...filas]
    .map(fila => fila.map(valor => `"${valor}"`).join(",")) // comillas para proteger valores con comas
    .join("\n");

  // Crear archivo con BOM para que Excel lo reconozca en UTF-8
  const blob = new Blob(["\uFEFF" + contenidoCSV], {
    type: "text/csv;charset=utf-8;"
  });

  // Descargar el archivo
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "documentos.csv";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

 
  // Datos para gráficas
  const dataDocs = [
    { tipo: "Factura", cantidad: documentos.filter((d) => d.Documento.tipo_documento?.toLowerCase().includes("factura")).length },
    { tipo: "Nota Crédito", cantidad: documentos.filter((d) => d.Documento.tipo_documento?.toLowerCase().includes("crédito")).length },
    { tipo: "Nota Débito", cantidad: documentos.filter((d) => d.Documento.tipo_documento?.toLowerCase().includes("débito")).length },
  ];
  const dataEstados = [
  {
    estado: "Aceptados",
    valor: documentos.filter(
      d => d.Documento.estado_dian === "Aceptado"
    ).length
  },
  {
    estado: "Rechazados",
    valor: documentos.filter(
      d => d.Documento.estado_dian === "Rechazado"
    ).length
  },
  {
    estado: "Pendientes",
    valor: documentos.filter(
      d => d.Documento.estado_dian === "Pendiente"
    ).length
  }
];

  const COLORS = ["#27374D", "#DDE6ED", "#526D82"];
  // Función para agrupar documentos por mes y tipo
// 1) getMonthlyData mejorado: siempre devuelve los últimos 6 meses y suma con Number()
function getMonthlyData(docs) {
  const monthNames = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
  const hoy = new Date();
  // crear keys para los últimos 6 meses (orden cronológico)
  const months = Array.from({ length: 6 }).map((_, i) => {
    const d = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
    return `${monthNames[d.getMonth()]}-${d.getFullYear()}`;
  });
  // inicializar mapa con ceros
  const map = {};
  months.forEach((m) => {
    map[m] = { mes: m, Factura: 0, "Nota Crédito": 0, "Nota Débito": 0 };
  });

  // rellenar sumas (asegurar Number)
  docs.forEach((doc) => {
    if (!doc.fecha_emision) return;
    const fecha = new Date(doc.fecha_emision);
    const key = `${monthNames[fecha.getMonth()]}-${fecha.getFullYear()}`;
    if (!map[key]) return; // solo últimos 6 meses

    // Normalizar valor_total a número (por si viene string con comas)
    let valor = doc.valor_total ?? 0;
    // eliminar comas y espacios si vienen como "10.200" o "10,200" (según origen)
    if (typeof valor === "string") {
      valor = valor.replace(/\s/g, "").replace(/,/g, "").replace(/\./g, function(match, offset, s){
        // si tiene punto como separador de miles, eliminar; si es decimal, manejarlo (raro en COP)
        // para simplicidad convertimos todo a número quitando puntos/comas
        return "";
      });
    }
    valor = Number(valor) || 0;
    if (doc.tipo_documento?.toLowerCase().includes("factura")) {
      map[key].Factura += valor;
    } else if (doc.tipo_documento?.toLowerCase().includes("crédito")) {
      map[key]["Nota Crédito"] += valor;
    } else if (doc.tipo_documento?.toLowerCase().includes("débito")) {
      map[key]["Nota Débito"] += valor;
    }
  });
  return Object.values(map);
}
const monthlyData = getMonthlyData(documentos);
const maxMonthly = monthlyData.reduce((m, e) => {
  return Math.max(m, e.Factura || 0, e["Nota Crédito"] || 0, e["Nota Débito"] || 0);
}, 0);
const midTick = Math.round(maxMonthly / 2);
const ticks = Array.from(new Set([0, midTick, Math.round(maxMonthly)]));

  return (
  <div className="p-6">
<div className="grid grid-cols-6 gap-4 mb-6 items-end">
  <div className="col-span-2 flex gap-2">
    <input
      type="date"
      className="border rounded px-2 py-1 w-1/2"
      value={filters.desde}
      onChange={(e) => setFilters({ ...filters, desde: e.target.value })}
      placeholder="Desde"
    />
    <input
      type="date"
      className="border rounded px-2 py-1.9 w-1/2"
      value={filters.hasta}
      onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
      placeholder="Hasta"
    />
  </div>
  <select
    className="border rounded px-2 py-2.5 w-full"
    value={filters.tipo}
    onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
  >
    <option value="">Tipo de documento</option>
    <option value="Factura">Factura</option>
    <option value="Nota crédito">Nota crédito</option>
    <option value="Nota débito">Nota débito</option>
  </select>
  <select
    className="border rounded px-2 py-2.5 w-full"
    value={filters.estado}
    onChange={(e) => setFilters({ ...filters, estado: e.target.value })}>
    <option value="">Estado DIAN</option>
    <option value="Aceptado">Aceptado</option>
    <option value="Rechazado">Rechazado</option>
    <option value="Pendiente">Pendiente</option>
  </select>
  <input
    type="text"
    className="border rounded px-2 py-2 w-full"
    placeholder="Cliente (nombre o ID)"
    value={filters.cliente}
    onChange={(e) => setFilters({ ...filters, cliente: e.target.value })}
  />
  <button
  onClick={aplicarFiltros}
  className="text-white px-4 py-2 rounded w-full"
  style={{ backgroundColor: "#27374D" }}>
  Aplicar filtros
  </button>

</div>
<h2 className="text-lg font-semibold mb-4">Resumen de documentos emitidos</h2>
<div className="grid grid-cols-2 gap-6 mb-10">
  <div className="bg-white p-4 rounded shadow-md">
    <ResponsiveContainer width="100%" height={300}>
     <BarChart
  data={[
  { categoria: "Total documentos", cantidad: documentos.length },
  { categoria: "Aceptados", cantidad: dataEstados[0].valor },
  { categoria: "Rechazados", cantidad: dataEstados[1].valor },
  { categoria: "Pendientes", cantidad: dataEstados[2].valor },
]}>
  <XAxis dataKey="categoria" />
  <YAxis allowDecimals={false} />
  <Tooltip />
  <Bar dataKey="cantidad">
    <Cell fill="#1E3A8A" />  
    <Cell fill="#27374D" />  
    <Cell fill="#526D82" />  
    <Cell fill="#DDE6ED" />  
  </Bar>
</BarChart>
    </ResponsiveContainer>
  </div>
  <div className="bg-white p-4 rounded shadow-md">
    <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={[
          {
            categoria: "Total facturado",
            cantidad: documentos
              .filter(d => d.Documento.tipo_documento?.toLowerCase().includes("factura"))
              .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0),},
          {
            categoria: "Total en notas crédito",
            cantidad: documentos
              .filter(d => d.Documento.tipo_documento?.toLowerCase().includes("crédito"))
              .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0),},
          {
            categoria: "Total en notas débito",
            cantidad: documentos
              .filter(d => d.Documento.tipo_documento?.toLowerCase().includes("débito"))
              .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0),
          },
        ]}>
        <XAxis dataKey="categoria" />
        <YAxis />
        <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
        <Bar dataKey="cantidad">
          <Cell fill="#27374D" />
          <Cell fill="#526D82" />
          <Cell fill="#DDE6ED" />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  </div>
</div>
<div className="grid grid-cols-3 gap-6 mb-10">
<div className="bg-white p-4 rounded shadow-md relative">
  <div className="flex">
    <div className="flex flex-col justify-center mr-6 w-44">
      <h3 className="font-bold text-center mb-2">Cantidad de facturas/notas</h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: "#27374D" }}></span>
          <span>Factura: {documentos.filter(d => d.Documento.tipo_documento?.toLowerCase().includes("factura")).length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: "#526D82" }}></span>
          <span>Nota Crédito: {documentos.filter(d => d.Documento.tipo_documento?.toLowerCase().includes("crédito")).length}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: "#DDE6ED" }}></span>
          <span>Nota Débito: {documentos.filter(d => d.Documento.tipo_documento?.toLowerCase().includes("débito")).length}</span>
        </div>
      </div>
    </div>
    <div className="flex-1">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={[
            {
              tipo: "Documentos",
              Factura: documentos.filter(d => d.Documento.tipo_documento?.toLowerCase().includes("factura")).length,
              "Nota Crédito": documentos.filter(d => d.Documento.tipo_documento?.toLowerCase().includes("crédito")).length,
              "Nota Débito": documentos.filter(d => d.Documento.tipo_documento?.toLowerCase().includes("débito")).length,
            },
          ]}
          margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <XAxis dataKey="tipo" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Bar dataKey="Factura" fill="#27374D" />
          <Bar dataKey="Nota Crédito" fill="#526D82" />
          <Bar dataKey="Nota Débito" fill="#DDE6ED" />
        </BarChart>
      </ResponsiveContainer>
      </div>
      </div>
      </div>
        <div className="relative flex flex-col items-center">
          <h3 className="absolute top-2 left-2 text-sm font-bold">Distribución de estados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={dataEstados}
                dataKey="valor"
                nameKey="estado"
                cx="50%"
                cy="50%"
                outerRadius={80}
                label>
                {dataEstados.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-2">
            {dataEstados.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: COLORS[index] }}
                ></span>
                <span>{item.estado} ({item.valor})</span>
              </div>
            ))}
          </div>
        </div>
<div className="bg-white p-4 rounded shadow-md relative">
  <div className="flex">
    <div className="flex flex-col justify-center mr-6 w-44">
      <h3 className="font-bold text-center mb-2">Total facturado</h3>
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: "#27374D" }}></span>
          <span>Factura: ${documentos
            .filter(d => d.Documento.tipo_documento?.toLowerCase().includes("factura"))
            .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0)}
            </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: "#526D82" }}></span>
          <span>Nota Crédito: ${documentos
            .filter(d => d.Documento.tipo_documento?.toLowerCase().includes("crédito"))
            .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0)
            }</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 rounded-full" style={{ backgroundColor: "#DDE6ED" }}></span>
          <span>Nota Débito: ${documentos
            .filter(d => d.Documento.tipo_documento?.toLowerCase().includes("débito"))
            .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0)}</span>
        </div>
      </div>
    </div>
<div className="flex-1">
  <ResponsiveContainer width="100%" height={300}>
  <BarChart
    data={getMonthlyData(documentos)}
    margin={{ top: 20, right: 30, left: 1, bottom: 5 }}>
    <XAxis dataKey="mes"/>
    <YAxis
      tickFormatter={(value) => `$${Number(value).toLocaleString("es-CO")}`}
      width={100}/>
    <Tooltip formatter={(value) => `$${Number(value).toLocaleString("es-CO")}`}/>
    <Legend/>
    <Bar dataKey="Factura" barSize={30} fill="#27374D"/>
    <Bar dataKey="Nota Crédito" barSize={30} fill="#526D82"/>
    <Bar dataKey="Nota Débito" barSize={30} fill="#DDE6ED"/>
  </BarChart>
</ResponsiveContainer>
 </div>
  </div>
   </div>
      </div>
      <table className="w-full border">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-2 border">Tipo</th>
            <th className="p-2 border">Número</th>
            <th className="p-2 border">CUFE/CUDE</th>
            <th className="p-2 border">Valor total</th>
            <th className="p-2 border">Fecha</th>
            <th className="p-2 border">Estado</th>
            <th className="p-2 border">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {documentos.map((doc, i) => (
  <React.Fragment key={doc.Documento.id_documento}>
    <tr>
      <td className="p-2 border">{doc.Documento.tipo_documento}</td>
      <td className="p-2 border">{doc.Documento.numero_documento || "-"}</td>
      <td className="p-2 border">{doc.Documento.cufe || doc.Documento.cude || "-"}</td>
      <td className="p-2 border">${doc.Documento.valor_total || 0}</td>
      <td className="p-2 border">
        {new Date(doc.Documento.fecha_emision).toLocaleDateString()}
      </td>
      <td className="p-2 border">{doc.Documento.estado_dian}</td>
      <td className="p-2 border">
        <button
          onClick={() => setSelectedDoc(selectedDoc === i ? null : i)}
          className="text-blue-600"
        >
          Ver
          </button>
          </td>
          </tr>
          {selectedDoc === i && (
            <tr>
              <td colSpan="7" className="p-4 bg-gray-50"><strong>Detalles del documento:</strong>
              <pre className="text-sm">{JSON.stringify(doc, null, 2)}</pre></td>
              </tr>
            )}
            </React.Fragment>
          ))}
          </tbody>
          </table>
          <div className="flex justify-end mt-4"><button onClick={exportarCSV}
          className="text-white px-4 py-2 rounded"style={{ backgroundColor: "#27374D" }}>
            Exportar como CSV
            </button>
           </div>
          </div>
          );
        };
export default Reportes;