import { format } from "date-fns";
import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { authRequired } from "../middleware/auth.js";
import crypto from "crypto";

const router = Router();
function generarCodigo(tipo, numero, fecha) {
  const base = `${tipo}-${numero}-${fecha}-${Date.now()}`;
  return crypto.createHash("sha256").update(base).digest("hex").slice(0, 44);
}
function fechaColombia(fecha) {
  const d = new Date(fecha);
  const utc = d.getTime() + d.getTimezoneOffset() * 60000;
  return new Date(utc - 5 * 60 * 60000);
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
    const fechaEmisionCol = fechaColombia(fecha_emision);
    const fechaHoyCol = fechaColombia(new Date());
    const fechaActual = format(fechaHoyCol, "yyyy-MM-dd");
    let totalProductos = 0;
    let impuestosProductos = 0;

    if (Array.isArray(productos) && productos.length > 0) {
      productos.forEach((p) => {
        const subtotal = p.cantidad * p.precio_unitario;
        const iva = subtotal * (p.iva / 100);
        totalProductos += subtotal + iva;
        impuestosProductos += iva;
      });
    }

    const totalFinal = valor_total ? parseFloat(valor_total) : totalProductos;
    const impuestosFinal = impuestos !== undefined && impuestos !== null && impuestos !== ""
    ? parseFloat(impuestos) : 0;
    let estado = "Pendiente";
    if (fechaEmisionCol > fechaHoyCol) estado = "Rechazado";
    else if (!impuestos || impuestosFinal <= 0) estado = "Pendiente";
    else estado = "Aceptado";
    const tipo =
      tipo_documento === "Factura"
        ? "Factura"
        : tipo_documento === "Nota Crédito"
        ? "Nota Crédito"
        : "Nota Débito";

    const prefijo =
      tipo === "Factura" ? "FE" : tipo === "Nota Crédito" ? "NC" : "ND";
    const config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });
    if (!config) {
      await prisma.Configuracion_Tecnica.create({
        data: {
          id_usuario: parseInt(id_usuario),
          numeraciones: [
            {
              id: Date.now(),
              tipo_documento: "Global",
              prefijo: "",
              numero_inicial: 1,
              numero_final: 100,
              resolucion: "Automática",
              fecha_resolucion: fechaActual,
              estado: "Activo",
            },
          ],
        },
      });
    }

    const configuracion = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    let numeraciones = Array.isArray(configuracion.numeraciones)
      ? [...configuracion.numeraciones]
      : [];
    let numeracionGlobal = numeraciones.find((n) => n.tipo_documento === "Global");

    if (!numeracionGlobal) {
      numeracionGlobal = {
        id: Date.now(),
        tipo_documento: "Global",
        prefijo: "",
        numero_inicial: 1,
        numero_final: 100,
        resolucion: "Automática",
        fecha_resolucion: fechaActual,
        estado: "Activo",
      };
      numeraciones.push(numeracionGlobal);
    }
    const totalEmitidos = await prisma.Documentos_XML.count({
      where: { id_usuario: parseInt(id_usuario) },
    });

    const limite =
      (numeracionGlobal.numero_final || 0) - (numeracionGlobal.numero_inicial || 0) + 1;

    if (totalEmitidos >= limite) {
      numeracionGlobal.estado = "Inactivo";
      await prisma.Configuracion_Tecnica.update({
        where: { id_usuario: parseInt(id_usuario) },
        data: { numeraciones },
      });
      return res.status(400).json({
        error: `Se ha alcanzado el límite de ${limite} documentos en el rango global.`,
      });
    }
    if (!numeracionGlobal.prefijo) {
      numeracionGlobal.prefijo = prefijo;
    }
    await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: { numeraciones },
    });
    const codigo =
      tipo_documento === "Factura"
        ? generarCodigo("CUFE", numero_documento, fecha_emision)
        : generarCodigo("CUDE", numero_documento, fecha_emision);
    
        let mensajeDian = "";
        if (estado === "Aceptado") {
          mensajeDian = "El documento fue aceptado por cumplir con todos los requisitos exigidos por la DIAN.";
        } else if (estado === "Pendiente") {
          mensajeDian = "El documento está en proceso porque no se añadieron impuestos, los cuales son obligatorios.";
        } else if (estado === "Rechazado") {
          mensajeDian = "El documento fue rechazado porque la fecha de emisión no puede ser mayor a la fecha actual.";
        }
    const documento = await prisma.Documentos_XML.create({
      data: {
        tipo_documento,
        numero_documento,
        prefijo,
        fecha_emision: fechaEmisionCol,
        valor_total: totalFinal,
        impuestos: impuestosFinal,
        estado_dian: estado,
        mensaje_dian: mensajeDian,
        codigo_dian: codigo,
        cufe: tipo_documento === "Factura" ? codigo : null,
        cude: tipo_documento !== "Factura" ? codigo : null,
        xml_archivo: "<xml>simulado</xml>",
        pdf_archivo: Buffer.from("PDF simulado"),
        id_usuario: parseInt(id_usuario),
        id_cliente: id_cliente ? parseInt(id_cliente) : null,
        factura_relacionada: factura_relacionada || null,
        fecha_respuesta_dian: fechaEmisionCol,
      },
    });
    if (Array.isArray(productos) && productos.length > 0) {
      for (const p of productos) {
        await prisma.Producto_Factura.create({
          data: {
            descripcion: p.descripcion,
            cantidad: p.cantidad,
            precio_unitario: p.precio_unitario,
            iva: p.iva,
            total: p.cantidad * p.precio_unitario * (1 + p.iva / 100),
            id_documento: documento.id_documento,
          },
        });
      }
    }

    const usuario = await prisma.Usuarios.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });
    let mensajeRegistro = "";
    if (estado === "Aceptado") {
      mensajeRegistro = `El documento ${tipo_documento} #${numero_documento} fue ACEPTADO porque cumple con todos los requisitos, incluyendo impuestos válidos y fecha correcta.`;
    } else if (estado === "Pendiente") {
      mensajeRegistro = `El documento ${tipo_documento} #${numero_documento} está en PROCESO porque no se añadieron impuestos, lo cual es obligatorio según las normas DIAN.`;
    } else if (estado === "Rechazado") {
      mensajeRegistro = `El documento ${tipo_documento} #${numero_documento} fue RECHAZADO debido a que la fecha de emisión no puede ser mayor a la fecha actual.`;
    }
    await prisma.Registros_Sistema.create({
      data: {
        id_usuario: parseInt(id_usuario),
        nombre_usuario: usuario?.nombre_usuario || "Desconocido",
        empresa: usuario?.nit_empresa || "Sin NIT",
        tipo_documento,
        numero_documento,
        accion: "Creación de documento",
        resultado: estado,
        mensaje: mensajeRegistro,
      },
    });
    
    res.json({
      mensaje: "Documento creado correctamente",
      documento,
      rango_usado: `${totalEmitidos + 1}/${limite}`,
      fecha_resolucion: numeracionGlobal.fecha_resolucion,
    });
  } catch (err) {
    console.error("Error al crear documento:", err);
    res.status(500).json({ error: "Error al crear documento" });
  }
});

router.get("/historial", authRequired, async (req, res) => {
  try {
    const idUsuario = req.user?.sub;

    if (!idUsuario) {
      return res.status(401).json({ error: "Usuario no autenticado" });
    }
    const historial = await prisma.Documentos_XML.findMany({
      where: { id_usuario: parseInt(idUsuario) },
      orderBy: { fecha_emision: "desc" },
      include: {
        Producto_Factura: true,
        Clientes: true,
        Usuarios: true,
      },
    });

    res.json(historial);
  } catch (err) {
    console.error("Error obteniendo historial:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;

