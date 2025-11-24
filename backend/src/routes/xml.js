import express from "express";
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

    // Generar XML de productos
    const productosXML = docData.Producto_Factura.map(
      (p) => `
      <Producto>
        <Descripcion>${p.descripcion}</Descripcion>
        <Cantidad>${p.cantidad}</Cantidad>
        <PrecioUnitario>${p.precio_unitario}</PrecioUnitario>
        <IVA>${p.iva}</IVA>
        <Total>${p.total}</Total>
      </Producto>`
    ).join("");

    // Generar QR en Base64
    const qrData = `CUFE: ${docData.cufe || docData.cude} | Numero: ${docData.numero_documento}`;
    const qrImageBase64 = await QRCode.toDataURL(qrData);

    // Construir XML final
    const xml = `
    <Documento>
      <Tipo>${docData.tipo_documento}</Tipo>
      <Numero>${docData.numero_documento}</Numero>
      <Fecha>${docData.fecha_emision}</Fecha>
      <Cliente>${docData.Clientes?.nombre_cliente || "-"}</Cliente>
      <EstadoDIAN>${docData.estado_dian}</EstadoDIAN>
      <CUFE>${docData.cufe || docData.cude}</CUFE>
      <Productos>${productosXML}</Productos>
      <QR>${qrImageBase64}</QR>
    </Documento>`;

    res.setHeader("Content-Type", "application/xml");
    res.setHeader("Content-Disposition", `attachment; filename=${docData.numero_documento}.xml`);
    res.send(xml);
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando XML");
  }
});

export default router;

