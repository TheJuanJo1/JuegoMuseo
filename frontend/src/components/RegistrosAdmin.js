import { useEffect, useState } from "react";
import FL from "../assets/FL.png";
import EX from "../assets/EX.png";
import V1 from "../assets/V1.png";
import V3 from "../assets/V3.png";

export default function RegistrosAdmin() {
  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState({ empresa: "", tipo: "", resultado: "" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const fetchRegistros = async (page = 1) => {
    try {
      const params = new URLSearchParams({
        page,
        limit: 10,
        empresa: filtros.nombre_usuario || "",
        tipo: filtros.tipo || "",
        resultado: filtros.resultado || "",
      });

      const res = await fetch(`http://localhost:3000/api/registros?${params}`);
      const data = await res.json();

      setRegistros(data.registros || []);
      setPagina(data.pagina_actual || 1);
      setTotalPaginas(data.total_paginas || 1);
    } catch (error) {
      console.error("Error cargando registros:", error);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, []);

  const aplicarFiltro = () => {
    fetchRegistros(1);
    setMostrarFiltros(false);
  };

  const limpiarFiltro = () => {
    setFiltros({ empresa: "", tipo: "", resultado: "" });
    fetchRegistros(1);
  };

  const exportarCSV = () => {
  let html = `
    <table border="1">
      <tr>
        <th>Fecha/Hora</th>
        <th>Empresa</th>
        <th>Tipo DOC</th>
        <th>Número</th>
        <th>Acción</th>
        <th>Resultado</th>
        <th>Mensaje</th>
      </tr>
      ${registros.map(r => `
        <tr>
          <td>${new Date(r.fecha_hora).toLocaleString("es-CO", { hour12: false })}</td>
          <td>${r.nombre_usuario}</td>
          <td>${r.tipo_documento}</td>
          <td>${r.numero_documento}</td>
          <td>${r.accion}</td>
          <td>${r.resultado}</td>
          <td>${r.mensaje || ""}</td>
        </tr>
      `).join("")}
    </table>
  `;
  const blob = new Blob(["\ufeff" + html], {
    type: "application/vnd.ms-excel;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "registros.xls";
  link.click();
};

  return (
    <div className="relative">
      {/* Botones flotantes arriba, fuera del recuadro */}
      <div className="flex justify-end mb-4">
        <div className="flex gap-3">
          <button
            onClick={() => setMostrarFiltros(!mostrarFiltros)}
            className="flex items-center gap-2 bg-white text-[#27374D] border border-[#27374D] px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-sm"
          >
            <img src={FL} alt="Filtrar" className="h-5 w-5" />
            Filtrar
          </button>
          <button
            onClick={exportarCSV}
            className="flex items-center gap-2 bg-white text-[#27374D] border border-[#27374D] px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-sm"
          >
            <img src={EX} alt="Exportar" className="h-5 w-5" />
            Exportar
          </button>
        </div>
      </div>

      {/* Contenedor principal (tabla + filtros) */}
      <div className="bg-white p-6 rounded-2xl shadow-md">
        {/* Filtros */}
        {mostrarFiltros && (
          <div className="mb-6 p-4 border border-gray-300 rounded-md bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <input
                type="text"
                placeholder="Empresa..."
                value={filtros.nombre_usuario}
                onChange={(e) => setFiltros({ ...filtros, nombre_usuario: e.target.value })}
                className="border rounded-md px-3 py-2 w-full"
              />
              <select
                value={filtros.tipo}
                onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
                className="border rounded-md px-3 py-2 w-full"
              >
                <option value="">Tipo DOC...</option>
                <option value="Factura">Factura</option>
                <option value="Nota Crédito">Nota Crédito</option>
                <option value="Nota Débito">Nota Débito</option>
              </select>
              <select
                value={filtros.resultado}
                onChange={(e) => setFiltros({ ...filtros, resultado: e.target.value })}
                className="border rounded-md px-3 py-2 w-full"
              >
                <option value="">Resultado...</option>
                <option value="Aceptado">Aceptado</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={limpiarFiltro}
                className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200"
              >
                Limpiar
              </button>
              <button
                onClick={aplicarFiltro}
                className="px-4 py-2 bg-[#27374D] text-white rounded-md hover:bg-[#1f2937]"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}

        {/* Tabla */}
        <div className="overflow-x-auto border border-gray-300 rounded-md">
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 text-black">
              <tr>
                <th className="px-4 py-2 border">Fecha/Hora</th>
                <th className="px-4 py-2 border">Empresa</th>
                <th className="px-4 py-2 border">Tipo Doc</th>
                <th className="px-4 py-2 border">Número</th>
                <th className="px-4 py-2 border">Acción</th>
                <th className="px-4 py-2 border">Resultado</th>
                <th className="px-4 py-2 border">Mensaje</th>
              </tr>
            </thead>
            <tbody>
              {registros.length > 0 ? (
                registros.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-100">
                    <td className="px-4 py-2 border">
                      {new Date(r.fecha_hora).toLocaleString("es-CO", { hour12: false })}</td>
                    <td className="px-4 py-2 border">{r.nombre_usuario}</td>
                    <td className="px-4 py-2 border">{r.tipo_documento}</td>
                    <td className="px-4 py-2 border">{r.numero_documento}</td>
                    <td className="px-4 py-2 border">{r.accion}</td>
                    <td className="px-4 py-2 border font-semibold">{r.resultado}</td>
                    <td className="px-4 py-2 border">{r.mensaje}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-gray-500">
                    No hay registros disponibles
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="flex justify-center items-center mt-6 gap-3">
          {pagina > 1 && (
            <button
              onClick={() => fetchRegistros(pagina - 1)}
              className="flex items-center gap-1 text-[#27374D] hover:underline text-sm"
            >
              <img src={V3} alt="Anterior" className="h-4 w-4" /> Anterior
            </button>
          )}

          <div className="px-3 py-1 bg-[#27374D] text-white rounded-md text-sm">
            {pagina}
          </div>

          {pagina < totalPaginas && (
            <button
              onClick={() => fetchRegistros(pagina + 1)}
              className="flex items-center gap-1 text-[#27374D] hover:underline text-sm"
            >
              Siguiente <img src={V1} alt="Siguiente" className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
