import express from "express";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma.js";

const router = express.Router();

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    // Buscar documento con empresa y productos
    const docData = await prisma.documentos_XML.findUnique({
      where: { id_documento: Number(id) },
      include: { Producto_Factura: true, Clientes: true, Usuarios: true },
    });

    if (!docData) return res.status(404).send("Documento no encontrado");

    // Productos completos (factura + agregados)
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

    // Formatear fecha en español
    const fechaES = new Date(docData.fecha_emision).toLocaleString("es-CO", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

    // Generar XML de productos
    const productosXML = productosCompletos.map((p) => {
      let cantidad = p.cantidad;
      let tipo = "Normal";
      if (docData.tipo_documento === "Nota Crédito" && p.cantidad_devuelta) {
        cantidad = p.cantidad_devuelta;
        tipo = "Devueltos";
      } else if (docData.tipo_documento === "Nota Débito" && p.cantidad_extra) {
        cantidad = p.cantidad_extra;
        tipo = "Extra";
      }

      return `
      <Producto>
        <Descripcion>${p.descripcion}</Descripcion>
        <Tipo>${tipo}</Tipo>
        <Cantidad>${cantidad}</Cantidad>
        <PrecioUnitario>${p.precio_unitario}</PrecioUnitario>
        <IVA>${p.iva}</IVA>
        <Total>${(cantidad * p.precio_unitario * (1 + p.iva / 100)).toFixed(2)}</Total>
      </Producto>`;
    }).join("");

    // Construir objeto QR completo (igual que PDF)
    const qrObject = {
      empresa: {
        nombre: docData.Usuarios?.nombre_usuario,
        rol: docData.Usuarios?.rol_usuario,
        nit: docData.Usuarios?.nit_empresa,
        correo: docData.Usuarios?.correo_contacto
      },
      tipo_documento: docData.tipo_documento,
      numero_documento: docData.numero_documento,
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
          total: (cantidad * p.precio_unitario * (1 + p.iva / 100)).toFixed(2),
        };
      })
    };

    // Generar QR en Base64
    const qrImageBase64 = await QRCode.toDataURL(JSON.stringify(qrObject, null, 2));

    // Construir XML final
    const xml = `
<Documento>
  <Tipo>${docData.tipo_documento}</Tipo>
  <Numero>${docData.numero_documento}</Numero>
  <NumeroSerie>${docData.numero_serie || "-"}</NumeroSerie>
  <Fecha>${fechaES}</Fecha>
  <Cliente>${docData.Clientes?.nombre_cliente || "-"}</Cliente>
  <EstadoDIAN>${docData.estado_dian}</EstadoDIAN>
  <CUFE>${docData.cufe || docData.cude}</CUFE>
  <MontoNota>${montoNota.toFixed(2)}</MontoNota>
  <DetalleNota>${docData.detalle_nota || "-"}</DetalleNota>
  <Empresa>
    <Nombre>${docData.Usuarios?.nombre_usuario || "-"}</Nombre>
    <Rol>${docData.Usuarios?.rol_usuario || "-"}</Rol>
    <NIT>${docData.Usuarios?.nit_empresa || "-"}</NIT>
    <Correo>${docData.Usuarios?.correo_contacto || "-"}</Correo>
  </Empresa>
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
