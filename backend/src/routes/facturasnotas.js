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

// === Crear documento corregido ===
router.post("/enviar", async (req, res) => {
  try {
    const {
      tipo_documento,
      fecha_emision,
      valor_total,
      impuestos,
      id_usuario,
      id_cliente,
      factura_relacionada,
      productos,
    } = req.body;

    if (!tipo_documento || !fecha_emision || !id_usuario)
      return res.status(400).json({ error: "Faltan campos obligatorios" });
    
    if (!id_cliente && (tipo_documento === "Factura" || tipo_documento === "Nota Crédito" || tipo_documento === "Nota Débito")) {
      return res.status(400).json({ error: "Debes ingresar el ID del cliente" });
    }

    if ((!productos || productos.length === 0) && tipo_documento === "Factura")
      return res.status(400).json({ error: "Debes agregar al menos un producto" });
    
    if (tipo_documento === "Nota Crédito" || tipo_documento === "Nota Débito") {
      
      if (!factura_relacionada) {
        return res.status(400).json({
          error: "Debes seleccionar la factura a la cual deseas asociar la nota."
        });
      }
  const facturaBase = await prisma.Documentos_XML.findFirst({
    where: {
      numero_serie: factura_relacionada,
      id_usuario: parseInt(id_usuario),
      tipo_documento: "Factura",
    },
  });

  if (!facturaBase) {
    return res.status(404).json({
      error: "No se encontró la factura asociada.",
    });
  }

  if (facturaBase.estado_dian === "Pendiente" || facturaBase.estado_dian === "Rechazado") {
    return res.status(400).json({
      error: `No puedes generar una nota porque la factura "${factura_relacionada}" está en estado "${facturaBase.estado_dian}". Solo puedes generar notas sobre facturas Aceptadas.`,
    });
  }
}
    const fechaEmisionCol = fechaColombia(fecha_emision);
    const fechaHoyCol = fechaColombia(new Date());

    // Calcular totales
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
    const impuestosFinal =
      impuestos !== undefined && impuestos !== null && impuestos !== ""
        ? parseFloat(impuestos)
        : impuestosProductos;

    let estado = "Pendiente";
    let mensajeDian = "";
    if (fechaEmisionCol > fechaHoyCol) {
      estado = "Rechazado";
      mensajeDian = "La fecha de emisión es mayor a la actual.";
    } 
    else if (!impuestos || impuestosFinal <= 0) {
      estado = "Pendiente";
      mensajeDian = "El documento está pendiente por validación.";
    } 
    else {
      estado = "Aceptado";
      mensajeDian = "Documento validado correctamente por la DIAN.";
    }
    // Obtener configuración del usuario
    let config = await prisma.Configuracion_Tecnica.findUnique({
      where: { id_usuario: parseInt(id_usuario) },
    });

    // Crear configuración si no existe
    if (!config) {
      await prisma.Configuracion_Tecnica.create({
        data: { id_usuario: parseInt(id_usuario), numeraciones: [] },
      });
      config = await prisma.Configuracion_Tecnica.findUnique({
        where: { id_usuario: parseInt(id_usuario) },
      });
    }

    let numeraciones = Array.isArray(config.numeraciones) ? [...config.numeraciones] : [];

    // Inicializar numero_actual si es null o undefined
    numeraciones.forEach((n) => {
      if (n.numero_actual === undefined || n.numero_actual === null) {
        n.numero_actual = n.numero_inicial ? n.numero_inicial - 1 : 0;
      }
    });

    // Obtener numeración correspondiente
    let numeracion = numeraciones.find((n) => n.tipo_documento.toLowerCase() === tipo_documento.toLowerCase());
    if (!numeracion) {
      return res.status(500).json({ error: `No se encontró numeración para ${tipo_documento}` });
    }

    // Verificar límite

if (numeracion.numero_actual + 1 > numeracion.numero_final) {
  numeracion.estado = "Inactivo";

  // Guardar numeración como inactiva
  await prisma.Configuracion_Tecnica.update({
    where: { id_usuario: parseInt(id_usuario) },
    data: { numeraciones },
  });

  return res.status(409).json({
    error: `Se alcanzó el límite del rango autorizado (${numeracion.numero_final}).`,
    estado: "Inactivo",
  });
}

numeracion.numero_actual += 1;
    const numeroSerie = `${numeracion.prefijo}${String(numeracion.numero_actual).padStart(3, "0")}`;

    // Guardar numeraciones actualizadas
    await prisma.Configuracion_Tecnica.update({
      where: { id_usuario: parseInt(id_usuario) },
      data: { numeraciones },
    });

    const codigo = generarCodigo(tipo_documento === "Factura" ? "CUFE" : "CUDE", numeroSerie, fecha_emision);

    // Crear documento
    const documento = await prisma.Documentos_XML.create({
      data: {
        tipo_documento,
        numero_documento: req.body.numero_documento || null,
        numero_serie: numeroSerie,
        prefijo: numeracion.prefijo,
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
        detalle_nota: req.body.detalle_nota || null,

      },
    });
    const usuarioDB = await prisma.Usuarios.findUnique({
  where: { id_usuario: parseInt(id_usuario) },
  select: { nombre_usuario: true, nit_empresa: true }
});

    // === Registrar actividad en Registros_Sistema ===
await prisma.Registros_Sistema.create({
  data: {
    id_usuario: parseInt(id_usuario),
    nombre_usuario: usuarioDB.nombre_usuario,
    empresa: usuarioDB.nit_empresa,
    tipo_documento: tipo_documento,
    numero_documento: documento.numero_documento,
    numero_serie: documento.numero_serie,
    accion: "Creación de documento",
    resultado: estado,
    mensaje: mensajeDian,
  },
});

    // Guardar productos si existen
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
    
    res.json({
      mensaje: "Documento creado correctamente",
      documento,
      numero_serie: numeroSerie,
      rango_usado: `${numeracion.numero_actual} / ${numeracion.numero_final}`,
    });
  } catch (err) {
    console.error("Error al crear documento:", err);
    res.status(500).json({ error: "Error al crear documento" });
  }
});

router.get("/validar-factura/:serie/:id/:cliente", async (req, res) => {
  const { serie, id, cliente } = req.params;
  try {
    if (!serie || !id || !cliente) return res.status(400).json({ error: "Faltan parámetros (serie, id_usuario, id_cliente)" });

    const factura = await prisma.Documentos_XML.findFirst({
      where: {
        numero_serie: serie,
        id_usuario: parseInt(id),
        tipo_documento: "Factura",
      },
      include: {
        Producto_Factura: true, 
      },
    });

    if (!factura) return res.status(404).json({ error: "Factura no encontrada" });

    // Si quieres forzar que la factura pertenezca exactamente al cliente enviado:
    if (factura.id_cliente && factura.id_cliente !== parseInt(cliente)) {
      return res.status(400).json({ error: "La factura no corresponde al cliente indicado" });
    }

    res.json({ factura });
  } catch (err) {
    console.error("Error validando factura:", err);
    res.status(500).json({ error: "Error validando factura" });
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

