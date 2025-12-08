import React, { useEffect, useState } from "react";
import { API_URL } from "../config.js";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";

function transformarDocumento(doc) {
  if (!doc) return {};
    const emisorXML = {
    nombre: doc.razon_social_emisor || "-",
    nombre_comercial: doc.nombre_comercial_emisor || "-",
    nit: doc.nit_emisor || "-",
    tipo_contribuyente: doc.tipo_contribuyente_emisor || "-",
    regimen_fiscal: doc.regimen_fiscal_emisor || "-",
    direccion: doc.direccion_emisor || "-",
    ciudad: doc.ciudad_emisor || "-",
    departamento: doc.departamento_emisor || "-",
    pais: doc.pais_emisor || "-",
    telefono: doc.telefono_emisor || "-",
    correo: doc.correo_emisor || "-",
  };
  const empresa = doc.Usuarios
    ? {
        id_empresa: doc.Usuarios.id_usuario,
        nombre_empresa: doc.Usuarios.nombre_usuario,
        rol_empresa: "Intermediaria",
        nit_empresa: doc.Usuarios.nit_empresa,
        correo_contacto: doc.Usuarios.correo_contacto,
        direccion: doc.Usuarios.direccion_empresa || "-",
        ciudad: doc.Usuarios.ciudad || "-",
        pais: doc.Usuarios.pais || "-",
        telefono: doc.Usuarios.telefono || "-",
        tipo_contribuyente: doc.Usuarios.tipo_contribuyente || "-",
        regimen_fiscal: doc.Usuarios.regimen_tributario || "-",
        responsabilidad_tributaria:
          doc.Usuarios.responsabilidad_tributaria || "-",
        actividad_economica: doc.Usuarios.actividad_economica || "-",
      }
    : null;

  // Cliente registrado en la BD (si existe)
  const Cliente = doc.Clientes
  ? {
      id_cliente: doc.Clientes.id_cliente,
      nombre_cliente: doc.Clientes.nombre_completo || doc.Clientes.razon_social || "-",
      tipo_documento: doc.Clientes.tipo_documento || "-",
      numero_documento: doc.Clientes.numero_documento || "-",
      correo: doc.Clientes.correo_cliente || "-",
      telefono: doc.Clientes.telefono || "-",
      direccion: doc.Clientes.direccion_cliente || "-",
      ciudad: doc.Clientes.ciudad || "-",
      departamento: doc.Clientes.departamento || "-",
      pais: doc.Clientes.pais || "-",
      tipo_contribuyente: doc.Clientes.tipo_contribuyente || "-",
      regimen_fiscal: doc.Clientes.regimen_fiscal || "-",
      responsabilidad_tributaria: doc.Clientes.responsabilidad_tributaria || "-",
    }
  : null;

  const Productos = Array.isArray(doc.Producto_Factura)
  ? doc.Producto_Factura.map((p) => {
      const cantidad = Number(p.cantidad) || 0;
      const precio_unitario = Number(p.precio_unitario) || 0;
      const subtotal = precio_unitario * cantidad;

      // IVA como número
      const iva = p.iva ? Number(p.iva) : 0;

      // Cálculo real del impuesto total
      const impuestoCalculado = subtotal * (iva / 100);

      // Total con IVA
      const totalConIva = subtotal + impuestoCalculado;

      return {
        id_producto: p.id_producto,
        codigo: p.codigo || "-",
        descripcion: p.descripcion || "-",
        cantidad,
        precio_unitario,
        subtotal,
        impuesto: Math.round(impuestoCalculado * 100) / 100,
        total: Math.round(totalConIva),    // ← aquí está la corrección
        unidad_medida: p.unidad_medida || "-",
        codigo_estandar: p.codigo_estandar || "-",
        tipo_impuesto: p.tipo_impuesto || "-",
      };
    })
  : [];


  // Documento limpio
  const documentoLimpio = {
    ...doc,
    forma_pago: doc.forma_pago || "-",
    medio_pago: doc.metodo_pago || "-",
    tipo_operacion: doc.tipo_operacion || "-",
    cufe: doc.cufe || doc.cude || "-",
  };

  return {
    Empresa: empresa, 
    EmisorXML: emisorXML, 
    Cliente: Cliente, 
    Documento: documentoLimpio,
    Productos,
  };
}

const Reportes = () => {
  const [documentos, setDocumentos] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    Aceptado: 0,
    Rechazado: 0,
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
    fetch(`${API_URL}/ultimos`, { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        const docs = Array.isArray(data) ? data.map(transformarDocumento) : [];
        setDocumentos(
          docs.filter((d) => d.Documento.estado_dian !== "Pendiente")
        );
      })
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
      const docsFiltrados = docs.filter(
        (d) => d.Documento.estado_dian !== "Pendiente"
      );

      setDocumentos(docsFiltrados);
      //Recalcula estadísticas en base a los documentos filtrados
      const nuevasEstadisticas = {
        Aceptado: docsFiltrados.filter(
          (d) => d.Documento.estado_dian === "Aceptado"
        ).length,
        Rechazado: docsFiltrados.filter(
          (d) => d.Documento.estado_dian === "Rechazado"
        ).length,
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
      body: JSON.stringify({}), // sin filtros
    })
      .then((res) => res.json())
      .then((data) => {
        const docs = Array.isArray(data) ? data.map(transformarDocumento) : [];
        setDocumentos(
          docs.filter((d) => d.Documento.estado_dian !== "Pendiente")
        );
      })
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
      "Estado",
    ];

    // Convertir los documentos a filas CSV
    const filas = documentos.map((d) => {
      const tipo = d.Documento.tipo_documento?.toLowerCase() || "";
      const prefijo = tipo.includes("factura")
        ? "FE"
        : tipo.includes("crédito")
        ? "NC"
        : tipo.includes("débito")
        ? "ND"
        : "";
      return [
        d.Documento.tipo_documento || "-",
        `${prefijo}${d.Documento.numero_documento || "-"}`,
        d.Documento.cufe || d.Documento.cude || "-",
        d.Documento.valor_total || 0,
        new Date(d.Documento.fecha_emision).toLocaleDateString("es-CO"),
        d.Documento.estado_dian || "-",
      ];
    });

    // Unir encabezado y filas, separadas por comas
    const contenidoCSV = [encabezado, ...filas]
      .map((fila) => fila.map((valor) => `"${valor}"`).join(",")) // comillas para proteger valores con comas
      .join("\n");

    // Crear archivo con BOM para que Excel lo reconozca en UTF-8
    const blob = new Blob(["\uFEFF" + contenidoCSV], {
      type: "text/csv;charset=utf-8;",
    });

    // Descargar el archivo
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "documentos.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };


  const dataEstados = [
    {
      estado: "Aceptados",
      valor: documentos.filter((d) => d.Documento.estado_dian === "Aceptado")
        .length,
    },
    {
      estado: "Rechazados",
      valor: documentos.filter((d) => d.Documento.estado_dian === "Rechazado")
        .length,
    },
  ];

  const COLORS = ["#27374D", "#DDE6ED", "#526D82"];
  // Función para agrupar documentos por mes y tipo
  // 1) getMonthlyData mejorado: siempre devuelve los últimos 6 meses y suma con Number()
  function getMonthlyData(docs) {
    const monthNames = [
      "Ene",
      "Feb",
      "Mar",
      "Abr",
      "May",
      "Jun",
      "Jul",
      "Ago",
      "Sep",
      "Oct",
      "Nov",
      "Dic",
    ];

    const hoy = new Date();

    const months = Array.from({ length: 6 }).map((_, i) => {
      const d = new Date(hoy.getFullYear(), hoy.getMonth() - (5 - i), 1);
      return `${monthNames[d.getMonth()]}-${d.getFullYear()}`;
    });

    const map = {};
    months.forEach((m) => {
      map[m] = { mes: m, Factura: 0, "Nota Crédito": 0, "Nota Débito": 0 };
    });

    docs.forEach((doc) => {
      const d = doc.Documento; //  ← ESTA ES LA CORRECCIÓN

      if (!d?.fecha_emision) return;

      const fecha = new Date(d.fecha_emision);
      const key = `${monthNames[fecha.getMonth()]}-${fecha.getFullYear()}`;
      if (!map[key]) return;

      let valor = d.valor_total ?? 0;

      if (typeof valor === "string") {
        valor = valor.replace(/[^\d]/g, ""); // limpia cualquier coma o punto
      }

      valor = Number(valor) || 0;

      if (d.tipo_documento?.toLowerCase().includes("factura")) {
        map[key].Factura += valor;
      } else if (d.tipo_documento?.toLowerCase().includes("crédito")) {
        map[key]["Nota Crédito"] += valor;
      } else if (d.tipo_documento?.toLowerCase().includes("débito")) {
        map[key]["Nota Débito"] += valor;
      }
    });

    return Object.values(map);
  }

  const monthlyData = getMonthlyData(documentos);
  const maxMonthly = monthlyData.reduce((m, e) => {
    return Math.max(
      m,
      e.Factura || 0,
      e["Nota Crédito"] || 0,
      e["Nota Débito"] || 0
    );
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
            placeholder="Fecha Inicial"
          />
          <input
            type="date"
            className="border rounded px-2 py-1 w-1/2"
            value={filters.hasta}
            onChange={(e) => setFilters({ ...filters, hasta: e.target.value })}
            placeholder="Fecha Final"
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
          onChange={(e) => setFilters({ ...filters, estado: e.target.value })}
        >
          <option value="">Estado DIAN</option>
          <option value="Aceptado">Aceptado</option>
          <option value="Rechazado">Rechazado</option>
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
          style={{ backgroundColor: "#27374D" }}
        >
          Aplicar filtros
        </button>
      </div>
      <h2 className="text-lg font-semibold mb-4">
        Resumen de documentos emitidos
      </h2>
      <div className="grid grid-cols-2 gap-6 mb-10">
        <div className="bg-white p-4 rounded shadow-md">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={[
                { categoria: "Total documentos", cantidad: documentos.length },
                { categoria: "Aceptados", cantidad: dataEstados[0].valor },
                { categoria: "Rechazados", cantidad: dataEstados[1].valor },
              ]}
            >
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
                    .filter((d) =>
                      d.Documento.tipo_documento
                        ?.toLowerCase()
                        .includes("factura")
                    )
                    .reduce(
                      (acc, d) => acc + Number(d.Documento.valor_total || 0),
                      0
                    ),
                },
                {
                  categoria: "Total en notas crédito",
                  cantidad: documentos
                    .filter((d) =>
                      d.Documento.tipo_documento
                        ?.toLowerCase()
                        .includes("crédito")
                    )
                    .reduce(
                      (acc, d) => acc + Number(d.Documento.valor_total || 0),
                      0
                    ),
                },
                {
                  categoria: "Total en notas débito",
                  cantidad: documentos
                    .filter((d) =>
                      d.Documento.tipo_documento
                        ?.toLowerCase()
                        .includes("débito")
                    )
                    .reduce(
                      (acc, d) => acc + Number(d.Documento.valor_total || 0),
                      0
                    ),
                },
              ]}
            >
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
      
      {/* LADO IZQUIERDO */}
      <div className="flex flex-col justify-center mr-6 w-44">
        <h3 className="font-bold text-center mb-2">Cantidad por Documento</h3>

        <div className="flex flex-col gap-3" style={{ color: "#000" }}>
          
          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#27374D" }}
            ></span>
            <span style={{ color: "#000" }}>
              Factura:{" "}
              {
                documentos.filter((d) =>
                  d.Documento.tipo_documento?.toLowerCase().includes("factura")
                ).length
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#526D82" }}
            ></span>
            <span style={{ color: "#000" }}>
              Nota Crédito:{" "}
              {
                documentos.filter((d) =>
                  d.Documento.tipo_documento?.toLowerCase().includes("crédito")
                ).length
              }
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: "#DDE6ED" }}
            ></span>
            <span style={{ color: "#000" }}>
              Nota Débito:{" "}
              {
                documentos.filter((d) =>
                  d.Documento.tipo_documento?.toLowerCase().includes("débito")
                ).length
              }
            </span>
          </div>

        </div>
      </div>

      {/* LADO DERECHO - GRÁFICA */}
      <div className="flex-1 pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart
            data={[
              {
                tipo: "Documentos",
                Factura: documentos.filter((d) =>
                  d.Documento.tipo_documento?.toLowerCase().includes("factura")
                ).length,
                "Nota Crédito": documentos.filter((d) =>
                  d.Documento.tipo_documento?.toLowerCase().includes("crédito")
                ).length,
                "Nota Débito": documentos.filter((d) =>
                  d.Documento.tipo_documento?.toLowerCase().includes("débito")
                ).length,
              },
            ]}
            margin={{ top: 20, right: 30, left: 0, bottom: 40 }}
          >
            <XAxis dataKey="tipo" />
            <YAxis allowDecimals={false} />

            <Tooltip
              contentStyle={{ color: "#000", backgroundColor: "#fff" }}
              itemStyle={{ color: "#000" }}
              labelStyle={{ color: "#000" }}
            />

            <Legend
              layout="horizontal"
              verticalAlign="bottom"
              align="center"
              formatter={(value) => (
                <span style={{ color: "#000" }}>{value}</span>
              )}
              wrapperStyle={{
                width: "100%",
                display: "flex",
                justifyContent: "center",
                gap: "30px",
                paddingTop: "15px",
                fontSize: "14px",
              }}
            />

            <Bar dataKey="Factura" fill="#27374D" />
            <Bar dataKey="Nota Crédito" fill="#526D82" />
            <Bar dataKey="Nota Débito" fill="#DDE6ED" />
          </BarChart>
        </ResponsiveContainer>
      </div>

    </div>
  </div>

        <div className="bg-white p-4 rounded shadow-md relative flex flex-col items-center">
  <h3 className="text-center font-worksans text-sm font-bold mb-2">
    Distribución de estados
  </h3>

  <ResponsiveContainer width="100%" height={300}>
    <PieChart>
      <Pie
        data={dataEstados}
        dataKey="valor"
        nameKey="estado"
        cx="50%"
        cy="50%"
        outerRadius={80}
        label={({ x, y, value }) => (
          <text x={x} y={y} fill="#000" fontSize={12} textAnchor="middle">
            {value}
          </text>
        )}
      >
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
        <span>
          {item.estado} ({item.valor})
        </span>
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
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#27374D" }}
          ></span>
          <span>
            Factura: $
            {documentos
              .filter((d) =>
                d.Documento.tipo_documento?.toLowerCase().includes("factura")
              )
              .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#526D82" }}
          ></span>
          <span>
            Nota Crédito: $
            {documentos
              .filter((d) =>
                d.Documento.tipo_documento?.toLowerCase().includes("crédito")
              )
              .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: "#DDE6ED" }}
          ></span>
          <span>
            Nota Débito: $
            {documentos
              .filter((d) =>
                d.Documento.tipo_documento?.toLowerCase().includes("débito")
              )
              .reduce((acc, d) => acc + Number(d.Documento.valor_total || 0), 0)}
          </span>
        </div>
      </div>
    </div>

    <div className="flex-1 pt-6">
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={monthlyData}
          margin={{ top: 20, right: 30, left: 1, bottom: 40 }}
        >
          <XAxis dataKey="mes" />

          <YAxis
            tickFormatter={(value) =>
              `$${Number(value).toLocaleString("es-CO")}`
            }
            width={100}
          />

          <Tooltip
            contentStyle={{ color: "#000", backgroundColor: "#fff" }}
            itemStyle={{ color: "#000" }}
            labelStyle={{ color: "#000" }}
            formatter={(value) =>
              `$${Number(value).toLocaleString("es-CO")}`
            }
          />
          <Legend
  layout="horizontal"
  verticalAlign="bottom"
  align="center"
  formatter={(value) => (
    <span style={{ color: "#000" }}>{value}</span>
  )}
  wrapperStyle={{
    width: "100%",
    display: "flex",
    justifyContent: "center",
    gap: "30px",
    paddingTop: "15px",
    fontSize: "14px",
  }}
/>


          <Bar dataKey="Factura" barSize={30} fill="#27374D" />
          <Bar dataKey="Nota Crédito" barSize={30} fill="#526D82" />
          <Bar dataKey="Nota Débito" barSize={30} fill="#DDE6ED" />
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
                <td className="p-2 border">
                  {(() => {
                    const tipo =
                      doc.Documento.tipo_documento?.toLowerCase() || "";
                    const prefijo = tipo.includes("factura")
                      ? "FE"
                      : tipo.includes("crédito")
                      ? "NC"
                      : tipo.includes("débito")
                      ? "ND"
                      : "";
                    return `${prefijo}${doc.Documento.numero_documento || "-"}`;
                  })()}
                </td>

                <td className="p-2 border">
                  {doc.Documento.cufe || doc.Documento.cude || "-"}
                </td>
                <td className="p-2 border">
                  ${doc.Documento.valor_total || 0}
                </td>
                <td className="p-2 border">
                  {new Date(doc.Documento.fecha_emision).toLocaleDateString()}
                </td>
                <td className="p-2 border">{doc.Documento.estado_dian}</td>
                <td className="p-2 border">
                  <button
  onClick={() =>
    setSelectedDoc(selectedDoc === doc.Documento.id_documento ? null : doc.Documento.id_documento)
  }
  className="text-blue-600"
>
  Ver
</button>

                </td>
              </tr>
             {selectedDoc === doc.Documento.id_documento && (
  <tr>
    <td colSpan="7" className="p-4 bg-gray-50">
                    <div className="max-h-[500px] overflow-y-auto p-4 border rounded bg-white scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 space-y-6">
                      <h4 className="mb-3 font-bold text-lg">
                        Detalles del Documento
                      </h4>
                      <div>
                        <h5 className="mb-1 font-semibold">
                          Documento
                        </h5>
                        <p>
                          <strong>CUFE:</strong> {doc.Documento.cufe || "-"}
                        </p>
                        <p>
                          <strong>Número de Factura:</strong>{" "}
                          {doc.Documento.numero_documento || "-"}
                        </p>
                        <p>
                          <strong>Consecutivo Completo:</strong>{" "}
                          {doc.Documento.consecutivo_completo || "-"}
                        </p>
                        <p>
                          <strong>Tipo de Documento:</strong>{" "}
                          {doc.Documento.tipo_documento || "-"}
                        </p>
                        <p>
                          <strong>Moneda:</strong> {doc.Documento.moneda || "-"}
                        </p>
                        <p>
                          <strong>Forma de Pago:</strong>{" "}
                          {doc.Documento.forma_pago || "-"}
                        </p>
                        <p>
                          <strong>Fecha de Emisión:</strong>{" "}
                          {doc.Documento.fecha_emision
                            ? new Date(
                                doc.Documento.fecha_emision
                              ).toLocaleString("es-CO")
                            : "-"}
                        </p>
                      </div>
                      {doc.Empresa && (
  <div>
    <h4 className="mb-3 font-bold text-lg">Intermediario</h4>
    <div>
      <p><strong>ID:</strong> {doc.Empresa.id_empresa}</p>
      <p><strong>Nombre:</strong> {doc.Empresa.nombre_empresa}</p>
      <p><strong>Rol:</strong> {doc.Empresa.rol_empresa}</p>
      <p><strong>NIT:</strong> {doc.Empresa.nit_empresa || "-"}</p>
      <p><strong>Correo:</strong> {doc.Empresa.correo_contacto || "-"}</p>
      <p><strong>Dirección:</strong> {doc.Empresa.direccion || "-"}</p>
      <p><strong>Régimen Fiscal:</strong> {doc.Empresa.regimen_fiscal || "-"}</p>
    </div>
  </div>
)}

         
                      {doc.EmisorXML && (
  <div className="mb-4">
    <h5 className="mb-1 font-semibold">
      Datos del Emisor / Vendedor
    </h5>
    <p>
      <strong>Razón Social:</strong>{" "}
      {doc.EmisorXML.nombre}
    </p>
    <p>
      <strong>NIT del Emisor:</strong>{" "}
      {doc.EmisorXML.nit}
    </p>
    <p>
      <strong>Ciudad:</strong> {doc.EmisorXML.ciudad}
    </p>
    <p>
      <strong>Dirección:</strong>{" "}
      {doc.EmisorXML.linea_direccion || doc.EmisorXML.direccion}
    </p>
    <p>
      <strong>Correo:</strong>{" "}
      {doc.EmisorXML.correo}
    </p>
  </div>
)}

                   {doc.Cliente && (
  <div className="mb-4">
    <h5 className="mb-1 font-semibold">Datos del Adquiriente / Comprador</h5>

    <p>
      <strong>Nombre o Razón Social:</strong>{" "}
      {doc.Cliente.nombre_cliente || "-"}
    </p>

    <p>
      <strong>Tipo de Documento:</strong>{" "}
      {doc.Cliente.tipo_documento || "CC"}
    </p>

    <p>
      <strong>Número de Documento:</strong>{" "}
      {doc.Cliente.numero_documento || "-"}
    </p>

    <p>
      <strong>Ciudad:</strong>{" "}
      {doc.Cliente.ciudad || "-"}
    </p>

    <p>
      <strong>Dirección:</strong>{" "}
      {doc.Cliente.direccion || "-"}
    </p>

    <p>
      <strong>Correo:</strong>{" "}
      {doc.Cliente.correo || "-"}
    </p>
  </div>
)}

{doc.Productos?.length > 0 && (
  <table className="w-full border mt-4">
    <thead className="bg-gray-100">
      <tr>
        <th className="p-2 border">Descripción</th>
        <th className="p-2 border">Cantidad</th>
        <th className="p-2 border">Unidad</th>
        <th className="p-2 border">Precio Unitario</th>
        <th className="p-2 border">IVA</th>
        <th className="p-2 border">Total</th>
      </tr>
    </thead>
    <tbody>
      {doc.Productos.map((p) => (
        <tr key={p.id_producto}>
          <td className="p-2 border">{p.descripcion}</td>
          <td className="p-2 border">{p.cantidad}</td>
          <td className="p-2 border">{p.unidad_medida || "-"}</td>
          <td className="p-2 border">{p.precio_unitario}</td>
          <td className="p-2 border">{p.impuesto}</td>
          <td className="p-2 border">{p.total}</td>
        </tr>
      ))}
    </tbody>
  </table>
)}



                      <div>
                        <h5 className="mb-1 font-semibold">
                          Totales e Impuestos
                        </h5>
                        <p>
                          <strong>Subtotal:</strong> $
                          {doc.Documento.subtotal || 0}
                        </p>
                        <p>
                          <strong>Impuestos:</strong> $
                          {doc.Documento.impuestos || 0}
                        </p>
                        <p>
                          <strong>Valor Total:</strong> $
                          {doc.Documento.valor_total || 0}
                        </p>
                      </div>
                    </div>
                  </td>
                </tr>
              )}
            </React.Fragment>
          ))}
        </tbody>
      </table>
      <div className="flex justify-end mt-4">
        <button
          onClick={exportarCSV}
          className="text-white px-4 py-2 rounded"
          style={{ backgroundColor: "#27374D" }}
        >
          Exportar como CSV
        </button>
      </div>
    </div>
  );
};
export default Reportes;