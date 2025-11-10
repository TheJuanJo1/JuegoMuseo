import express from "express";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar documento
    const docData = await prisma.documentos_XML.findUnique({
      where: { id_documento: Number(id) },
      include: { Producto_Factura: true, Clientes: true },
    });

    if (!docData) return res.status(404).send("Documento no encontrado");

    // Crear PDF
    const doc = new PDFDocument();
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${docData.numero_documento}.pdf`);
    doc.pipe(res);

    // Encabezado
    doc.fontSize(20).text("Documento Electrónico", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Tipo: ${docData.tipo_documento}`);
    doc.text(`Número: ${docData.numero_documento}`);
    doc.text(`Fecha: ${docData.fecha_emision}`);
    doc.text(`Cliente: ${docData.Clientes?.nombre_cliente || "-"}`);
    doc.text(`Estado DIAN: ${docData.estado_dian}`);
    doc.text(`CUFE/CUDE: ${docData.cufe || docData.cude}`);

    doc.moveDown().fontSize(14).text("Productos", { underline: true });
    doc.moveDown();

    // Tabla básica de productos
    doc.fontSize(12);
    docData.Producto_Factura.forEach((p) => {
      doc.text(
        `${p.descripcion} - Cant: ${p.cantidad} - Precio: $${p.precio_unitario} - IVA: ${p.iva}% - Total: $${p.total}`
      );
    });

    // Generar QR
    const qrData = `CUFE: ${docData.cufe || docData.cude} | Numero: ${docData.numero_documento}`;
    const qrImage = await QRCode.toDataURL(qrData);

    // Insertar QR
    doc.moveDown(2);
    doc.fontSize(14).text("Código QR:", { underline: true });
    doc.image(qrImage, { fit: [120, 120] });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando PDF");
  }
});

export default router;
