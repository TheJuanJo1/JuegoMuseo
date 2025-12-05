import { useState, useEffect } from "react";
import { API_URL } from "../config.js";

export default function ConfiguracionTecnica({ usuarioId }) {
  const [config, setConfig] = useState(null);
  const [numeraciones, setNumeraciones] = useState([]);
  const [token, setToken] = useState("");
  const [mostrarCampos, setMostrarCampos] = useState(false);
  const [mostrarModalCert, setMostrarModalCert] = useState(false);
  const [nuevoCert, setNuevoCert] = useState({ archivo: null, fecha_expedicion: "" });
  const [nuevoRango, setNuevoRango] = useState({ tipo_documento: "Factura", numero_inicial: "", numero_final: "" });
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`${API_URL}/api/configuracion/${usuarioId}`);
        if (!res.ok) throw new Error("Error al obtener configuración");
        const data = await res.json();
        setConfig(data.configuracion);
        setNumeraciones(data.numeraciones || []);
        setToken(data.configuracion.token_api);
      } catch (error) {
        console.error("Error al cargar configuración:", error);
      }
    };
    fetchConfig();
  }, [usuarioId]);

  const handleRegenerarToken = async () => {
    try {
      const res = await fetch(`${API_URL}api/token/regenerar/${usuarioId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) setToken(data.token);
    } catch (error) {
      console.error("Error al regenerar token:", error);
    }
  };

  const handleMostrarCampos = () => {
    setMostrarCampos(!mostrarCampos);
  };

  const handleGuardarNumeracion = async () => {
    const inicial = parseInt(nuevoRango.numero_inicial);
  const final = parseInt(nuevoRango.numero_final);

  // Validaciones
  if (isNaN(inicial) || isNaN(final)) {
    alert("Los números deben ser válidos.");
    return;
  }
  if (inicial < 1 || final < 1) {
    alert("Los números deben ser 1 o mayores.");
    return;
  }
  if (final < inicial) {
    alert("El número final debe ser mayor o igual al número inicial.");
    return;
  }
    try {
      const res = await fetch(`${API_URL}/api/configuracion/numeracion/${usuarioId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tipo_documento: nuevoRango.tipo_documento,
          numero_inicial: nuevoRango.numero_inicial,
          numero_final: nuevoRango.numero_final,
          resolucion: "Resolución automática",
          fecha_resolucion: new Date().toISOString(),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al guardar numeración");

      setNumeraciones(data.numeraciones);
      setMostrarCampos(false);
      setNuevoRango({ tipo_documento: "Factura", numero_inicial: "", numero_final: "" });
    } catch (error) {
      console.error("Error al guardar numeración:", error);
    }
  };

  const estadoCertificado = (fechaExpiracion) => {
    const hoy = new Date();
    const exp = new Date(fechaExpiracion);
    const diff = (exp - hoy) / (1000 * 60 * 60 * 24);
    if (diff < 0) return "Expirado";
    if (diff <= 30) return "Próximo a vencer";
    return "Activo";
  };

  const handleGuardarCertificado = async () => {
    if (!nuevoCert.archivo || !nuevoCert.fecha_expedicion) {
      alert("Debes seleccionar un archivo .p12 y una fecha de expedición.");
      return;
    }
    try {
      const formData = new FormData();
      formData.append("certificado_firma", nuevoCert.archivo);
      formData.append("fecha_expiracion", nuevoCert.fecha_expedicion);
      const res = await fetch(`${API_URL}/api/configuracion/regenerar-certificado/${usuarioId}`, {

        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al regenerar certificado");

      setConfig({ ...config, certificado_firma: data.certificado, fecha_expiracion: data.fecha_expiracion });
      setMostrarModalCert(false);
      setNuevoCert({ archivo: null, fecha_expedicion: "" });
    } catch (error) {
      console.error("Error al regenerar certificado:", error);
    }
  };

  if (!config) return <p>Cargando configuración...</p>;

  const estado = estadoCertificado(config.fecha_expiracion);

  return (
    <div className="p-6 font-sans">
      <div className="mb-6">
        <p><strong>Nombre de empresa:</strong> {config.usuario?.nombre_usuario || "Sin nombre"}</p>
        <p><strong>NIT:</strong> {config.usuario?.nit_empresa}</p>
        <p><strong>Régimen fiscal:</strong> {config.regimen_tributario}</p>
      </div>
      <h3 className="font-semibold mb-2">Numeraciones autorizadas</h3>
      <table className="table-auto border-collapse border border-gray-300 w-full mb-4">
        <thead>
          <tr className="bg-gray-200">
            <th className="border border-gray-300 p-2">Prefijo</th>
            <th className="border border-gray-300 p-2">Rango</th>
            <th className="border border-gray-300 p-2">Resolución</th>
            <th className="border border-gray-300 p-2">Fecha resolución</th>
            <th className="border border-gray-300 p-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          {numeraciones.map((num) => (
            <tr key={num.id}>
              <td className="border border-gray-300 p-2">{num.prefijo}</td>
              <td className="border border-gray-300 p-2">{num.numero_inicial} - {num.numero_final}</td>
              <td className="border border-gray-300 p-2">{num.resolucion}</td>
              <td className="border border-gray-300 p-2">{new Date(num.fecha_resolucion).toLocaleDateString()}</td>
              <td className="border border-gray-300 p-2">{num.estado}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        onClick={handleMostrarCampos}
        className="text-white px-4 py-2 rounded mb-4 hover:opacity-90 transition-all"
        style={{ backgroundColor: "#27374D" }}>
        {mostrarCampos ? "Cancelar" : "Añadir numeración"}
      </button>
      {mostrarCampos && (
        <div className="mb-6 bg-gray-100 p-4 rounded-lg border border-gray-300">
          <div className="flex gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Tipo de documento:</label>
              <select
                value={nuevoRango.tipo_documento}
                onChange={(e) => setNuevoRango({ ...nuevoRango, tipo_documento: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 w-48"
              >
                <option value="Factura">Factura</option>
                <option value="Nota Crédito">Nota Crédito</option>
                <option value="Nota Débito">Nota Débito</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número inicial:</label>
              <input
                type="number"
                value={nuevoRango.numero_inicial}
                onChange={(e) => setNuevoRango({ ...nuevoRango, numero_inicial: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 w-32"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Número final:</label>
              <input
                type="number"
                value={nuevoRango.numero_final}
                onChange={(e) => setNuevoRango({ ...nuevoRango, numero_final: e.target.value })}
                className="border border-gray-300 rounded px-2 py-1 w-32"
              />
            </div>
          </div>
          <button
            onClick={handleGuardarNumeracion}
            className="text-white px-4 py-2 rounded hover:opacity-90"
            style={{ backgroundColor: "#1B263B" }}>
            Guardar numeración
          </button>
        </div>
      )}
      <h3 className="font-semibold mb-2">Certificado digital</h3>
      <p><strong>Certificado:</strong> {config.certificado_firma}</p>
      <p><strong>Fecha de expiración:</strong> {new Date(config.fecha_expiracion).toLocaleDateString()}</p>
      <p><strong>Estado:</strong> {estado}</p>
      {(estado === "Expirado" || estado === "Próximo a vencer") && (
        <button
          className="text-white px-4 py-2 rounded mt-2 hover:opacity-90 transition-all duration-300"
          onClick={() => setMostrarModalCert(true)}
          style={{ backgroundColor: "#8B0000" }}>
          Regenerar certificado
        </button>
      )}
      {mostrarModalCert && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-lg font-semibold mb-4">Regenerar certificado</h2>
            <label className="block mb-2 text-sm font-medium">Archivo de certificado (.p12):</label>
            <input
              type="file"
              accept=".p12"
              onChange={(e) => setNuevoCert({ ...nuevoCert, archivo: e.target.files[0] })}
              className="border border-gray-300 rounded w-full px-2 py-1 mb-3"/>
            <label className="block mb-2 text-sm font-medium">Fecha de expedición:</label>
            <input
              type="date"
              value={nuevoCert.fecha_expedicion}
              onChange={(e) => setNuevoCert({ ...nuevoCert, fecha_expedicion: e.target.value })}
              className="border border-gray-300 rounded w-full px-2 py-1 mb-4"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setMostrarModalCert(false)}
                className="px-4 py-2 rounded text-gray-700 border border-gray-400 hover:bg-gray-200">
                Cancelar
              </button>
              <button
                onClick={handleGuardarCertificado}
                className="text-white px-4 py-2 rounded hover:opacity-90"
                style={{ backgroundColor: "#27374D" }}>
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
      <h3 className="font-semibold mt-6 mb-2">Acceso a API</h3>
      <p><strong>Token de autenticación:</strong> {token}</p>
      <button
        className="text-white px-4 py-2 rounded mt-2 hover:opacity-90 transition-all duration-300"
        onClick={handleRegenerarToken}
        style={{ backgroundColor: "#27374D" }}>
        Regenerar token
      </button>
    </div>
  );
}