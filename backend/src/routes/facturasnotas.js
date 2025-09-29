import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import crypto from "crypto";

const router = Router();

function generarCodigo(tipo, numero, fecha) {
  const base = `${tipo}-${numero}-${fecha}-${Date.now()}`;
  return crypto.createHash("sha256").update(base).digest("hex").slice(0, 44);
}

router.post("/enviar", async (req, res) => {
  try {
    const {
      tipo_documento,
      numero_documento,
      fecha_emision,
      valor_total,
      impuestos,
      id_usuario,
      id_cliente,
      factura_relacionada,
      productos,
    } = req.body;

    if (!tipo_documento || !numero_documento || !fecha_emision || !id_usuario) {
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    }

    // Calcular totales desde productos si no vienen manualmente
    let totalProductos = 0;
    let impuestosProductos = 0;

    if (Array.isArray(productos) && productos.length > 0) {
      productos.forEach(p => {
        const subtotal = p.cantidad * p.precio_unitario;
        const iva = subtotal * (p.iva / 100);
        totalProductos += subtotal + iva;
        impuestosProductos += iva;
      });
    }

    const totalFinal = valor_total ? parseFloat(valor_total) : totalProductos;
    const impuestosFinal = impuestos ? parseFloat(impuestos) : impuestosProductos;

    // Determinar estado
    const fechaHoy = new Date();
    const fechaDoc = new Date(fecha_emision);
    let estado = "Pendiente";

    if (fechaDoc > fechaHoy) estado = "Rechazado";
    else if (!impuestosFinal || impuestosFinal <= 0) estado = "Pendiente";
    else estado = "Aceptado";

    const codigo = tipo_documento === "Factura"
      ? generarCodigo("CUFE", numero_documento, fecha_emision)
      : generarCodigo("CUDE", numero_documento, fecha_emision);

    // Crear documento
    const documento = await prisma.Documentos_XML.create({
      data: {
        tipo_documento,
        numero_documento,
        fecha_emision: new Date(fecha_emision),
        valor_total: totalFinal,
        impuestos: impuestosFinal,
        estado_dian: estado,
        mensaje_dian: estado === "Aceptado" ? "Documento válido" : "Pendiente de revisión",
        codigo_dian: codigo,
        cufe: tipo_documento === "Factura" ? codigo : null,
        cude: tipo_documento !== "Factura" ? codigo : null,
        xml_archivo: "<xml>simulado</xml>",
        pdf_archivo: Buffer.from("PDF simulado"),
        id_usuario: parseInt(id_usuario),
        id_cliente: id_cliente ? parseInt(id_cliente) : null,
        factura_relacionada: factura_relacionada || null,
        fecha_respuesta_dian: new Date(),
      },
    });

    // Guardar productos
    if (Array.isArray(productos) && productos.length > 0) {
      const productosToCreate = productos.map(p => ({
        descripcion: p.descripcion,
        cantidad: p.cantidad,
        precio_unitario: p.precio_unitario,
        iva: p.iva,
        total: p.cantidad * p.precio_unitario * (1 + p.iva / 100),
        id_documento: documento.id_documento,
      }));
      for (const p of productosToCreate) {
        await prisma.Producto_Factura.create({ data: p });
      }
    }

    res.json({ mensaje: "Documento creado correctamente", documento });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al crear documento" });
  }
});

// HISTORIAL
router.get("/historial", async (req, res) => {
  try {
    const historial = await prisma.Documentos_XML.findMany({
      orderBy: { fecha_emision: "desc" },
      include: { Producto_Factura: true },
    });

    res.json(historial);
  } catch (err) {
    console.error("Error obteniendo historial:", err);
    res.status(500).json({ error: err.message });
  }
});

// DESCARGAR PDF
router.get("/descargar-pdf/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await prisma.documentos_XML.findUnique({ where: { id_documento: parseInt(id) } });
  if (!doc || !doc.pdf_archivo) return res.status(404).send("PDF no encontrado");

  res.setHeader("Content-Disposition", `attachment; filename=doc_${doc.numero_documento}.pdf`);
  res.setHeader("Content-Type", "application/pdf");
  res.send(doc.pdf_archivo);
});

// DESCARGAR XML
router.get("/descargar-xml/:id", async (req, res) => {
  const { id } = req.params;
  const doc = await prisma.documentos_XML.findUnique({ where: { id_documento: parseInt(id) } });
  if (!doc || !doc.xml_archivo) return res.status(404).send("XML no encontrado");

  res.setHeader("Content-Disposition", `attachment; filename=doc_${doc.numero_documento}.xml`);
  res.setHeader("Content-Type", "application/xml");
  res.send(doc.xml_archivo);
});

export default router;
