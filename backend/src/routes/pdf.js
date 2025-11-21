import express from "express";
import PDFDocument from "pdfkit";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener documento con cliente y productos
    const docData = await prisma.documentos_XML.findUnique({
      where: { id_documento: Number(id) },
      include: {
        Producto_Factura: true,
        Clientes: true,
        Usuarios: true,
      },
    });

    if (!docData) return res.status(404).send("Documento no encontrado");

    // Productos combinados
    let productosCompletos = [...docData.Producto_Factura];
    if (docData.productos_agregados && Array.isArray(docData.productos_agregados)) {
      productosCompletos = productosCompletos.concat(docData.productos_agregados);
    }

    // Calcular monto de nota según tipo
    let montoNota = 0;
    productosCompletos.forEach((p) => {
      let cantidad = p.cantidad;
      if (docData.tipo_documento === "Nota Crédito" && p.cantidad_devuelta) cantidad = p.cantidad_devuelta;
      if (docData.tipo_documento === "Nota Débito" && p.cantidad_extra) cantidad = p.cantidad_extra;
      const subtotal = cantidad * p.precio_unitario;
      const iva = subtotal * (p.iva / 100);
      montoNota += subtotal + iva;
    });

    const fechaES = new Date(docData.fecha_emision).toLocaleString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${docData.numero_documento}.pdf`);
    doc.pipe(res);

    // ----------------------------
    // DATOS DE LA EMPRESA
    // ----------------------------
    doc.fontSize(20).text(docData.Usuarios?.nombre_usuario || "Nombre Empresa", { align: "center" });
    doc.fontSize(12)
      .text(`Rol: ${docData.Usuarios?.rol_usuario || "-"}`, { align: "center" })
      .text(`NIT: ${docData.Usuarios?.nit_empresa || "-"}`, { align: "center" })
      .text(`Correo: ${docData.Usuarios?.correo_contacto || "-"}`, { align: "center" });
    doc.moveDown(2);

    // ----------------------------
    // ENCABEZADO DEL DOCUMENTO
    // ----------------------------
    doc.fontSize(20).text(
      docData.tipo_documento === "Factura" ? "Factura Electrónica" : docData.tipo_documento,
      { align: "center" }
    );
    doc.moveDown(1);

    doc.fontSize(12).text(`Número: ${docData.numero_documento}`, { align: "left" });
    doc.text(`Número de Serie: ${docData.numero_serie || "-"}`, { align: "left" });
    doc.text(`Fecha: ${fechaES}`, { align: "left" });
    doc.text(`Cliente: ${docData.Clientes?.nombre_cliente || "-"}`, { align: "left" });
    doc.text(`Estado DIAN: ${docData.estado_dian}`, { align: "left" });
    doc.text(`CUFE/CUDE: ${docData.cufe || docData.cude}`, { align: "left" });

    if (docData.tipo_documento !== "Factura") {
      doc.moveDown();
      doc.text(`Factura relacionada: ${docData.factura_relacionada || "-"}`, { align: "left" });
      doc.text(`Monto nota: $${montoNota.toFixed(2)}`, { align: "left" });
      doc.text(`Descripción detallada: ${docData.detalle_nota || "-"}`, { align: "left" });
    }

    // ----------------------------
    // PRODUCTOS
    // ----------------------------
    doc.moveDown(1);
    doc.fontSize(14).text("Productos", { align: "center", underline: true });
    doc.moveDown(0.5);
    doc.fontSize(12);

    // Encabezado tabla
    doc.text(`Descripción | Cantidad | Precio Unitario | IVA | Total`, { underline: true });

    productosCompletos.forEach((p) => {
      let cantidad = p.cantidad;
      let tipo = "";
      if (docData.tipo_documento === "Nota Crédito" && p.cantidad_devuelta) {
        cantidad = p.cantidad_devuelta;
        tipo = "Devueltos";
      } else if (docData.tipo_documento === "Nota Débito" && p.cantidad_extra) {
        cantidad = p.cantidad_extra;
        tipo = "Extra";
      }
      const subtotal = cantidad * p.precio_unitario;
      const iva = subtotal * (p.iva / 100);
      const total = subtotal + iva;

      doc.text(
        `${p.descripcion} | ${tipo ? tipo + ": " : ""}${cantidad} | $${p.precio_unitario.toFixed(
          2
        )} | $${iva.toFixed(2)} | $${total.toFixed(2)}`
      );
    });

    // ----------------------------
    // QR
    // ----------------------------
    const qrObject = {
      empresa: {
        nombre: docData.Usuarios?.nombre_usuario,
        rol: docData.Usuarios?.rol_usuario,
        nit: docData.Usuarios?.nit_empresa,
        correo: docData.Usuarios?.correo_contacto,
      },
      tipo_documento: docData.tipo_documento,
      numero: docData.numero_documento,
      numero_serie: docData.numero_serie,
      fecha: fechaES,
      cliente: docData.Clientes?.nombre_cliente,
      estado_dian: docData.estado_dian,
      cufe_cude: docData.cufe || docData.cude,
      factura_relacionada: docData.factura_relacionada || null,
      monto_nota: montoNota,
      productos: productosCompletos.map((p) => {
        let cantidad = p.cantidad;
        if (docData.tipo_documento === "Nota Crédito" && p.cantidad_devuelta) cantidad = p.cantidad_devuelta;
        if (docData.tipo_documento === "Nota Débito" && p.cantidad_extra) cantidad = p.cantidad_extra;
        return {
          descripcion: p.descripcion,
          cantidad,
          iva: p.iva,
          precio: p.precio_unitario,
          total: cantidad * p.precio_unitario * (1 + p.iva / 100),
        };
      }),
    };

    const qrText = JSON.stringify(qrObject, null, 2);
    const qrImage = await QRCode.toDataURL(qrText);
    doc.moveDown(2); // un espacio antes
doc.fontSize(14).text("Código QR", { align: "center", underline: true });
    const pageWidth = doc.page.width;
const imageWidth = 140; // mismo tamaño que pusiste
const x = (pageWidth - imageWidth) / 2; // centrado exacto

// Insertar QR
doc.image(qrImage, x, doc.y, { width: imageWidth, height: 140 });

    doc.moveDown(2);
    doc.fontSize(14).text("Código QR", { align: "center", underline: true });

    doc.end();
  } catch (err) {
    console.error(err);
    res.status(500).send("Error generando PDF");
  }
});

export default router;
