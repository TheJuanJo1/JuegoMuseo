// backend/src/routes/dashboardAdmin.js
import { Router } from "express";
import { prisma } from "../lib/prisma.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    // Obtener empresas
    const empresas = await prisma.usuarios.findMany({
      select: { id_usuario: true, nombre_usuario: true, estado: true }
    });

    // Obtener documentos con empresa
    const documentos = await prisma.Documentos_XML.findMany({
      orderBy: { fecha_emision: "desc" },
      include: { Usuarios: { select: { nombre_usuario: true, estado: true } } }
    });

    // Totales
    const totalEmpresas = empresas.length;
    const totalDocumentos = documentos.length;
    const erroresDocumentos = documentos.filter(d => d.estado_dian !== "Aceptado").length;

    // Volumen por tipo de documento
    const tipos = ["Factura", "Nota Crédito", "Nota Débito"];
    const volumenDocs = tipos.map(tipo => ({
      tipo,
      cantidad: documentos.filter(d => d.tipo_documento === tipo).length
    }));

    // Últimos 5 documentos
    const ultimosDocs = documentos.map(d => ({
      empresa: d.Usuarios?.nombre_usuario || "Sin Empresa",
      tipo: d.tipo_documento,
      numero_serie: d.numero_serie, 
      fecha: new Date(d.fecha_emision).toLocaleDateString(),
      estado: d.estado_dian,
      estadoEmpresa: d.Usuarios?.estado || "Inactivo"
    }));

    // Documentos validados por semana
    const semanasMap = {};
    documentos.forEach(doc => {
      const fecha = new Date(doc.fecha_emision);
      const semana = `Sem ${Math.ceil(fecha.getDate() / 7)}`;
      if (!semanasMap[semana]) semanasMap[semana] = 0;
      if (doc.estado_dian === "Aceptado") semanasMap[semana]++;
    });
    const validacionesSemana = Object.keys(semanasMap).map(sem => ({
      semana: sem,
      validados: semanasMap[sem]
    }));

    // Conteo por estado
    const estados = { Aceptado: 0, Rechazado: 0, Pendiente: 0 };
    documentos.forEach(d => {
      if (estados[d.estado_dian] !== undefined) estados[d.estado_dian]++;
    });

    res.json({
      totalEmpresas,
      totalDocumentos,
      erroresDocumentos,
      volumenDocs,
      ultimosDocs,
      validacionesSemana,
      estados
    });

  } catch (err) {
    console.error("Error obteniendo dashboard admin:", err);
    res.status(500).json({ error: "Error obteniendo dashboard admin" });
  }
});

export default router;