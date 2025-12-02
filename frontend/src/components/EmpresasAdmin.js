import { useEffect, useState } from "react";
import lup from "../assets/lup.svg";
import ps from "../assets/ps.svg";
import psr from "../assets/psr.svg";
import FL from "../assets/FL.svg";
import backArrow from "../assets/back-arrow.svg";
import fluxLogo from "../assets/Logo2.svg";
import { API_URL } from "../config";

export default function EmpresasAdmin() {
  const [empresas, setEmpresas] = useState([]);
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [filtros, setFiltros] = useState({ nombre: "", nit: "", estado: "" });
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(null);
  // Obtener todas las empresas
  const obtenerEmpresas = async () => {
    try {
      const res = await fetch(`${API_URL}/api/empresas`);

      const data = await res.json();
      setEmpresas(data);
    } catch (error) {
      console.log("Error obteniendo empresas", error);
    }
  };

  // Cambiar estado de empresa
  const cambiarEstado = async (id, estadoActual) => {
    const nuevoEstado = estadoActual === "activo" ? "inactivo" : "activo";
    try {
      await fetch(`${API_URL}/api/empresas/${id}/estado`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ estado: nuevoEstado }),
      });
      setEmpresas((prev) =>
        prev.map((e) => (e.id_usuario === id ? { ...e, estado: nuevoEstado } : e))
      );
    } catch (error) {
      console.log("Error cambiando estado", error);
    }
  };

  // Ver detalle de empresa
  const verDetalle = async (id) => {
    try {
      const res = await fetch(`${API_URL}/api/empresas/${id}`);
      const data = await res.json();
      setEmpresaSeleccionada(data.usuario); // abrir modal
    } catch (error) {
      console.log("Error viendo empresa", error);
    }
  };

  // Filtros
  const aplicarFiltro = () => setMostrarFiltros(false);
  const limpiarFiltro = () => setFiltros({ nombre: "", nit: "", estado: "" });

  const filtradas = empresas.filter((e) => {
    const nombreMatch = e.nombre_usuario
      .toLowerCase()
      .includes(filtros.nombre.toLowerCase());
    const nitMatch = e.nit_empresa.toLowerCase().includes(filtros.nit.toLowerCase());
    const estadoMatch = filtros.estado
      ? e.estado.toLowerCase() === filtros.estado.toLowerCase()
      : true;
    return nombreMatch && nitMatch && estadoMatch;
  });

  useEffect(() => {
    obtenerEmpresas();
  }, []);

  return (
    <div className="p-6 w-full flex flex-col items-center font-work-sans">
      <div className="mb-4 w-[95%] flex justify-end">
        <button
          onClick={() => setMostrarFiltros(!mostrarFiltros)}
          className="flex items-center gap-2 bg-white text-[#27374D] border border-[#27374D] px-4 py-2 rounded-md hover:bg-gray-100 transition shadow-sm"
        >
          <img src={FL} alt="Filtrar" className="h-5 w-5" />
          Filtrar
        </button>
      </div>
      {mostrarFiltros && (
        <div className="mb-4 w-[95%] p-4 border border-gray-300 rounded-md bg-gray-50 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Filtrar por nombre"
            className="border px-3 py-2 rounded-lg flex-1 min-w-[150px]"
            value={filtros.nombre}
            onChange={(e) => setFiltros({ ...filtros, nombre: e.target.value })}
          />
          <input
            type="text"
            placeholder="Filtrar por NIT"
            className="border px-3 py-2 rounded-lg flex-1 min-w-[150px]"
            value={filtros.nit}
            onChange={(e) => setFiltros({ ...filtros, nit: e.target.value })}
          />
          <select
            className="border px-3 py-2 rounded-lg flex-1 min-w-[150px] appearance-none"
            value={filtros.estado}
            onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}>
            <option value="">Todos</option>
            <option value="activo">Activo</option>
            <option value="inactivo">Inactivo</option>
          </select>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={limpiarFiltro}
              className="px-4 py-2 border border-gray-400 rounded-md hover:bg-gray-200">
              Limpiar
            </button>
          </div>
        </div>
      )}
      <div className="bg-white shadow-xl rounded-xl p-6 w-[95%] h-[70vh] overflow-y-auto">
        <table className="w-full text-left">
          <thead className="bg-gray-100 sticky top-0 z-10">
            <tr>
              <th className="p-3">Nombre</th>
              <th className="p-3">NIT</th>
              <th className="p-3">Correo</th>
              <th className="p-3">Estado</th>
              <th className="p-3">Fecha Registro</th>
              <th className="p-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtradas.length > 0 ? (
              filtradas.map((e) => (
                <tr key={e.id_usuario} className="border-b">
                  <td className="p-3">{e.nombre_usuario}</td>
                  <td className="p-3">{e.nit_empresa}</td>
                  <td className="p-3">{e.correo_contacto}</td>
                  <td className="p-3 capitalize">
                    <span
                      className={`px-2 py-1 rounded font-semibold text-sm ${
                        e.estado === "activo"
                          ? "bg-green-100 text-green-800 underline"
                          : "bg-yellow-100 text-yellow-800 underline"
                      }`}
                    >
                      {e.estado.charAt(0).toUpperCase() + e.estado.slice(1)}
                    </span>
                  </td>
                  <td className="p-3">{new Date(e.fecha_registro).toLocaleDateString()}</td>
                  <td className="p-3 flex gap-4">
                    <img
                      src={lup}
                      className="h-6 cursor-pointer"
                      onClick={() => verDetalle(e.id_usuario)}/>
                    <img
                      src={e.estado === "activo" ? ps : psr}
                      className="h-6 cursor-pointer"
                      onClick={() => cambiarEstado(e.id_usuario, e.estado)}
                    />
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center py-6 text-gray-500">
                  No hay resultados
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {empresaSeleccionada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
        <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-lg relative flex flex-col items-center text-center font-workSans">
        <button className="absolute top-3 left-3 text-gray-500 hover:text-gray-800" onClick={() => setEmpresaSeleccionada(null)}>
      <img src={backArrow} alt="Volver" className="h-6 w-6"/>
    </button>
    <img src={fluxLogo} alt="FluxData" className="h-11 w-auto mb-4" />
    <h2 className="text-xl font-bold mb-4">Detalle de la Empresa</h2>
    <div className="space-y-3">
      <p><strong>Nombre:</strong> {empresaSeleccionada.nombre_usuario}</p>
      <p><strong>NIT:</strong> {empresaSeleccionada.nit_empresa}</p>
      <p><strong>Correo:</strong> {empresaSeleccionada.correo_contacto}</p>
      <p><strong>Dirección:</strong> {empresaSeleccionada.direccion}</p>
      <p className="flex justify-center items-center gap-2">
        <strong>Estado:</strong>
        <span
          className={`px-2 py-1 rounded font-semibold text-sm ${
            empresaSeleccionada.estado === "activo"
              ? "bg-green-100 text-green-800 underline"
              : "bg-yellow-100 text-yellow-800 underline"
          }`}>
          {empresaSeleccionada.estado.charAt(0).toUpperCase() + empresaSeleccionada.estado.slice(1)}
        </span>
      </p>
      <p><strong>Régimen Tributario:</strong> {empresaSeleccionada.regimen_tributario}</p>
    </div>
  </div>
</div>
)}
</div>
  );
}
