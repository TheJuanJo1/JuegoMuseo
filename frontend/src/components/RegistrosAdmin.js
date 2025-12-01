import { useEffect, useState } from "react";
import FL from "../assets/FL.svg";
import EX from "../assets/EX.svg";
import V1 from "../assets/V1.svg";
import V3 from "../assets/V3.svg";
import { API_URL } from "../config";

export default function RegistrosAdmin() {
  const [animando, setAnimando] = useState(false);
  const [registros, setRegistros] = useState([]);
  const [pagina, setPagina] = useState(1);
  const [totalPaginas, setTotalPaginas] = useState(1);
  const [filtros, setFiltros] = useState({ nombre_usuario: "", tipo: "", resultado: "" });
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const fetchRegistros = async (page = 1) => {
    try {
      const params = new URLSearchParams();
    params.append("page", page);
    params.append("limit", 10);

    if (filtros.nombre_usuario.trim() !== "") {
      params.append("nombre_usuario", filtros.nombre_usuario);
    }
    if (filtros.tipo.trim() !== "") {
      params.append("tipo", filtros.tipo);
    }
    if (filtros.resultado.trim() !== "") {
      params.append("resultado", filtros.resultado);
    }
      const res = await fetch(`${API_URL}/api/registros?${params}`);
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
    setFiltros({ nombre_usuario: "", tipo: "", resultado: "" });
    fetchRegistros(1);
  };
  const exportarCSV = () => {
  if (!registros || registros.length === 0) {
    alert("No hay registros para exportar");
    return;
  }
  const encabezados = [
    "Fecha/Hora",
    "Empresa",
    "Tipo DOC",
    "Número",
    "Acción",
    "Resultado",
    "Mensaje"
  ];
  const filas = registros.map(r => [
    new Date(r.fecha_hora).toLocaleString("es-CO", { hour12: false }),
    r.nombre_usuario || "-",
    r.tipo_documento || "-",
    r.numero_documento || "-",
    r.accion || "-",
    r.resultado || "-",
    r.mensaje || ""
  ]);
  const contenido = [encabezados, ...filas]
    .map(fila => fila.map(valor => `"${valor}"`).join(",")) 
    .join("\n");
  const blob = new Blob(["\uFEFF" + contenido], {
    type: "text/csv;charset=utf-8;"
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const fecha = new Date().toISOString().slice(0, 10); 
  link.href = url;
  link.download = `registros_${fecha}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
const cambiarPagina = async (nuevaPagina) => {
  setAnimando(true); 
  setTimeout(async () => {
    await fetchRegistros(nuevaPagina);
    setAnimando(false); 
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 200);
  }, 300);
};
  return (
    <div className="relative">
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
      <div className="bg-white p-6 rounded-2xl shadow-md">
        {/* CAMPOS DE FILTRO FUERA DEL CUADRO BLANCO */}
{mostrarFiltros && (
  <div className="mb-6 p-4 bg-gray-50 rounded-md shadow-sm flex flex-wrap gap-4">
    
    <input
      type="text"
      placeholder="Empresa..."
      value={filtros.nombre_usuario}
      onChange={(e) => setFiltros({ ...filtros, nombre_usuario: e.target.value })}
      className="border rounded-md px-3 py-2 flex-1 min-w-[150px]"
    />

    <select
      value={filtros.tipo}
      onChange={(e) => setFiltros({ ...filtros, tipo: e.target.value })}
      className="border rounded-md px-3 py-2 flex-1 min-w-[150px]"
    >
      <option value="">Tipo de Documento</option>
      <option value="Factura">Factura</option>
      <option value="Nota Crédito">Nota Crédito</option>
      <option value="Nota Débito">Nota Débito</option>
    </select>

    <select
      value={filtros.resultado}
      onChange={(e) => setFiltros({ ...filtros, resultado: e.target.value })}
      className="border rounded-md px-3 py-2 flex-1 min-w-[150px]"
    >
      <option value="">Resultado</option>
      <option value="Aceptado">Aceptado</option>
      <option value="Pendiente">Pendiente</option>
      <option value="Rechazado">Rechazado</option>
    </select>

    <button
      onClick={aplicarFiltro}
      className="px-4 py-2 bg-[#27374D] text-white rounded-md hover:bg-[#1f2d3c]"
    >
      Validar
    </button>

    <button
      onClick={limpiarFiltro}
      className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200"
    >
      Limpiar
    </button>

  </div>
)}


        <div className={`overflow-x-auto border border-gray-300 rounded-md transition-all duration-500 ease-in-out ${
          animando ? "opacity-0 translate-x-8" : "opacity-100 translate-x-0"}`}>
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 text-black">
                <tr><th className="px-4 py-2 border">Fecha/Hora</th>
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
                        {new Date(r.fecha_hora).toLocaleString("es-CO", { hour12: false })}
                        </td><td className="px-4 py-2 border">{r.nombre_usuario}</td>
                        <td className="px-4 py-2 border">{r.tipo_documento}</td>
                        <td className="px-4 py-2 border">{r.numero_serie}</td>
                        <td className="px-4 py-2 border">{r.accion}</td>
                        <td className="px-4 py-2 border font-semibold">{r.resultado}</td>
                        <td className="px-4 py-2 border">{r.mensaje}</td>
                        </tr>
                        )
                      )) : (
                        <tr>
                          <td colSpan="7" className="text-center py-4 text-gray-500">
                            No hay registros disponibles
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <div className="relative mt-6 flex items-center justify-center">
                    {pagina > 1 && (
                      <button onClick={() => cambiarPagina(pagina - 1)} className="absolute left-0 flex items-center gap-1 text-[#27374D] hover:underline text-sm">
                        <img src={V3} alt="Anterior" className="h-4 w-4" /> Anterior</button>
                      )}
                      <div className="flex items-center gap-2 transition-all duration-300 ease-in-out">
                        {pagina > 1 && (
                          <div className="px-2 py-1 bg-gray-200 text-[#27374D] rounded-md text-xs scale-90 transition-all duration-500 cursor-pointer hover:scale-100"
                          onClick={() => cambiarPagina(pagina - 1)}>
                            {pagina - 1}
                            </div>
                          )}
                        <div key={pagina} className="px-3 py-1 bg-[#27374D] text-white rounded-md text-base scale-110 shadow-md transition-all duration-500 ease-in-out transform">
                      {pagina}
                        </div>
                      {pagina < totalPaginas && (
                      <div className="px-2 py-1 bg-gray-200 text-[#27374D] rounded-md text-xs scale-90 transition-all duration-500 cursor-pointer hover:scale-100"
                      onClick={() => cambiarPagina(pagina + 1)}>
                    {pagina + 1}
                  </div>
                 )}
              </div>
            {pagina < totalPaginas && (
            <button onClick={() => cambiarPagina(pagina + 1)}
                className="absolute right-0 flex items-center gap-1 text-[#27374D] hover:underline text-sm">
              Siguiente <img src={V1} alt="Siguiente" className="h-4 w-4" />
            </button>
           )}
        </div>
      </div>  
    </div>
  );
}