import React, { useEffect, useState } from "react";

export default function Documentos() {
  const [docs, setDocs] = useState([]);
  const [filter, setFilter] = useState({ tipo: "", estado: "", fecha: "" });
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [expandedDocId, setExpandedDocId] = useState(null);

  useEffect(() => {
    fetch("http://localhost:3000/api/facturas-notas/historial", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setDocs(Array.isArray(data) ? data : []))
      .catch((err) => console.error(err));
  }, []);

  // Resetear página cuando cambian filtros o búsqueda
  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const getDocDate = (d) => {
    if (!d || !d.fecha_emision) return null;
    const dt = new Date(d.fecha_emision);
    if (isNaN(dt)) return null;
    return dt.toISOString().split("T")[0]; // YYYY-MM-DD
  };

  const matchTipo = (d) => {
    if (!filter.tipo) return true;
    const tipoDoc = (d.tipo_documento || "").toLowerCase();

    if (filter.tipo === "Factura") return tipoDoc.includes("factura");
    if (filter.tipo === "Nota Crédito" || filter.tipo === "Nota crédito")
      return tipoDoc.includes("crédito") || tipoDoc.includes("credito");
    if (filter.tipo === "Nota Débito" || filter.tipo === "Nota débito")
      return tipoDoc.includes("débito") || tipoDoc.includes("debito");

    // fallback: contains
    return tipoDoc.includes(filter.tipo.toLowerCase());
  };

  const filteredDocs = docs
    .filter((d) => {
      // filtro tipo
      if (!matchTipo(d)) return false;

      // filtro estado
      if (filter.estado && (d.estado_dian || "").toLowerCase() !== filter.estado.toLowerCase())
        return false;

      // filtro fecha (compara YYYY-MM-DD)
      if (filter.fecha) {
        const docDate = getDocDate(d);
        if (!docDate || !docDate.startsWith(filter.fecha)) return false;
      }

      return true;
    })
    .filter((d) => {
      if (!search) return true;
      const s = search.trim().toLowerCase();
      const num = (d.numero_documento || "").toString().toLowerCase();
      const cufe = (d.cufe || d.cude || "").toLowerCase();

      // intentar distintos campos posibles para cliente (según lo que devuelva tu backend)
      const cliente =
        (d.Clientes && (d.Clientes.nombre_cliente || d.Clientes.nombre)) ||
        d.cliente ||
        d.cliente_nombre ||
        "";
      const clienteStr = String(cliente).toLowerCase();

      return num.includes(s) || cufe.includes(s) || clienteStr.includes(s);
    });

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));
  const paginatedDocs = filteredDocs.slice((page - 1) * itemsPerPage, page * itemsPerPage);

  const toggleExpand = (id) => {
    setExpandedDocId(expandedDocId === id ? null : id);
  };

  // Descargar XML/PDF
  const descargarArchivo = async (id, tipo) => {
    try {
      const res = await fetch(`http://localhost:3000/api/facturas-notas/descargar-${tipo}/${id}`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Error descargando archivo");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      const doc = docs.find((d) => d.id_documento === id) || {};
      link.download = `${doc.numero_documento || "doc"}.${tipo === "pdf" ? "pdf" : "xml"}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert("No se pudo descargar el archivo");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Visor de documentos enviados</h1>

      <div className="bg-white shadow-lg rounded-lg p-4 space-y-4">
        {/* Filtros y búsqueda */}
        <div className="flex items-center justify-between">
          <div className="flex space-x-2">
            <input
              type="date"
              value={filter.fecha}
              onChange={(e) => setFilter({ ...filter, fecha: e.target.value })}
              className="border p-1 rounded"
            />
            <select
              value={filter.tipo}
              onChange={(e) => setFilter({ ...filter, tipo: e.target.value })}
              className="border p-1 rounded"
            >
              <option value="">Todos los tipos</option>
              <option value="Factura">Factura</option>
              <option value="Nota Crédito">Nota Crédito</option>
              <option value="Nota Débito">Nota Débito</option>
            </select>
            <select
              value={filter.estado}
              onChange={(e) => setFilter({ ...filter, estado: e.target.value })}
              className="border p-1 rounded"
            >
              <option value="">Todos los estados</option>
              <option value="Aceptado">Aceptado</option>
              <option value="Rechazado">Rechazado</option>
              <option value="Pendiente">Pendiente</option>
            </select>
          </div>
          <input
            type="text"
            placeholder="Buscar número, CUFE o cliente"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border p-1 rounded w-40"
          />
        </div>

        {/* Tabla */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="p-2 border">Tipo de documento</th>
                <th className="p-2 border">Número</th>
                <th className="p-2 border">CUFE / CUDE</th>
                <th className="p-2 border">Fecha de emisión</th>
                <th className="p-2 border">Estado</th>
                <th className="p-2 border">Enviado a DIAN</th>
                <th className="p-2 border">Factura relacionada</th>
                <th className="p-2 border">Más detalle</th>
              </tr>
            </thead>
            <tbody>
              {paginatedDocs.map((d) => (
                <React.Fragment key={d.id_documento}>
                  <tr className="hover:bg-gray-50">
                    <td className="p-2 border">{d.tipo_documento}</td>
                    <td className="p-2 border">{d.numero_documento}</td>
                    <td className="p-2 border">{d.cufe || d.cude || "-"}</td>
                    <td className="p-2 border">{getDocDate(d) || "-"}</td>
                    <td className="p-2 border">{d.estado_dian}</td>
                    <td className="p-2 border">{d.estado_dian !== "Pendiente" ? "Sí" : "No"}</td>
                    <td className="p-2 border">{d.factura_relacionada || "-"}</td>
                    <td className="p-2 border">
                      <button className="text-blue-900 hover:underline" onClick={() => toggleExpand(d.id_documento)}>
                        {expandedDocId === d.id_documento ? "Ocultar" : "Ver detalle"}
                      </button>
                    </td>
                  </tr>

                  {/* Detalles desplegados */}
                  {expandedDocId === d.id_documento && (
                    <tr>
                      <td colSpan="8" className="bg-gray-50 p-4 border">
                        <div className="space-y-2">
                          <p><strong>CUFE completo:</strong> {d.cufe || d.cude || "-"}</p>

                          <div className="flex space-x-2">
                            <button
                              onClick={() => descargarArchivo(d.id_documento, "xml")}
                              className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-500 transition"
                            >
                              Descargar XML
                            </button>

                            <button
                              onClick={() => descargarArchivo(d.id_documento, "pdf")}
                              className="bg-blue-900 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                            >
                              Descargar PDF
                            </button>
                          </div>

                          <p><strong>Estado DIAN:</strong> {d.estado_dian}</p>
                          <p><strong>Acciones:</strong> {d.mensaje_dian || "-"}</p>

                          {/* Productos si existen */}
                          {Array.isArray(d.Producto_Factura) && d.Producto_Factura.length > 0 && (
                            <>
                              <h4 className="mt-2 font-semibold">Productos</h4>
                              <ul className="text-sm">
                                {d.Producto_Factura.map(p => (
                                  <li key={p.id_producto}>{p.descripcion} — {p.cantidad} x {p.precio_unitario} (IVA: {p.iva}%)</li>
                                ))}
                              </ul>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center items-center space-x-4 mt-2">
          <button onClick={() => setPage((p) => Math.max(1, p - 1))} className="bg-blue-900 text-white px-3 py-1 rounded">
            Anterior
          </button>
          <span>{page} / {totalPages}</span>
          <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="bg-blue-900 text-white px-3 py-1 rounded">
            Siguiente
          </button>
        </div>
      </div>
    </div>
  );
}
