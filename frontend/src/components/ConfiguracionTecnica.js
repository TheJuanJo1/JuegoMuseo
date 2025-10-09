// src/pages/ConfiguracionTecnica.js
import { useState, useEffect } from "react";
import Logo from "../assets/fluxdata.png";

export default function ConfiguracionTecnica({ usuarioId }) {
  const [config, setConfig] = useState(null);
  const [numeraciones, setNumeraciones] = useState([]);
  const [token, setToken] = useState("");

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/configuracion/${usuarioId}`);
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
      const res = await fetch(`http://localhost:3000/api/token/regenerar/${usuarioId}`, {
        method: "POST",
      });
      const data = await res.json();
      if (res.ok) setToken(data.token);
    } catch (error) {
      console.error("Error al regenerar token:", error);
    }
  };

  const estadoCertificado = (fechaExpiracion) => {
    const hoy = new Date();
    const exp = new Date(fechaExpiracion);
    const diff = (exp - hoy) / (1000 * 60 * 60 * 24); // diferencia en días
    if (diff < 0) return "Expirado";
    if (diff <= 30) return "Próximo a vencer";
    return "Activo";
  };

  if (!config) return <p>Cargando configuración...</p>;

  return (
    <div className="p-6 font-sans">
      
      {/* Información de empresa */}
      <div className="mb-6">
        <p><strong>Nombre de empresa:</strong> {config.direccion_empresa}</p>
        <p><strong>NIT:</strong> {config.id_usuario}</p>
        <p><strong>Régimen fiscal:</strong> {config.regimen_tributario}</p>
      </div>

      {/* Numeraciones */}
      <h3 className="font-semibold mb-2">Numeraciones autorizadas</h3>
      <table className="table-auto border-collapse border border-gray-300 w-full mb-6">
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
      className="text-white px-4 py-2 rounded mb-6 hover:opacity-90"
      style={{ backgroundColor: "#27374D" }}>
        Añadir numeración
      </button>
      <h3 className="font-semibold mb-2">Certificado digital</h3>
      <p><strong>Nombre certificado:</strong> {config.certificado_firma}</p>
      <p><strong>Fecha de expiración:</strong> {new Date(config.fecha_expiracion).toLocaleDateString()}</p>
      <p><strong>Estado:</strong> {estadoCertificado(config.fecha_expiracion)}</p>
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
