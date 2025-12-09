import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import jwt from "jsonwebtoken";

const router = Router();

// Últimos documentos del usuario autenticado
router.get("/", async (req, res) => {
  try {
    const token = req.cookies.token;
    if (!token) return res.status(401).json({ error: "No autenticado" });

    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // Convertir payload.sub a número
    const userId = parseInt(payload.sub, 10);
    if (isNaN(userId)) {
      return res.status(400).json({ error: "ID de usuario inválido" });
    }

    // Traer últimos 20 documentos
    const docs = await prisma.documentos_XML.findMany({
  where: { id_usuario: userId },
  orderBy: { numero_factura: "desc" },
  take: 20,
  select: {
    id_documento: true,
    tipo_documento: true,
    numero_documento: true,
    numero_serie: true,
    prefijo: true,
    consecutivo_completo: true,
    fecha_emision: true,
    subtotal: true,
    descuentos: true,
    valor_total: true,
    impuestos: true,
    moneda: true,
    forma_pago: true,
    metodo_pago: true,
    estado_dian: true,
    numero_factura: true,
    medio_pago: true,
    fecha_vencimiento: true,
    tipo_operacion: true,
    cufe: true,
    cude: true,

    // Relación con cliente
    Clientes: {
      select: {
        nombre_completo: true,
        razon_social: true,
        correo_cliente: true,
        numero_documento: true,
        tipo_documento: true,
        direccion_cliente: true,
        ciudad: true,
        departamento: true,
        pais: true,
        telefono: true,
        tipo_contribuyente: true,
        regimen_fiscal: true,
        responsabilidad_tributaria: true,
      },
    },

    // Documento padre (para NC / ND)
    DocumentoPadre: {
      select: {
        id_documento: true,
        tipo_documento: true,
        numero_documento: true,
        consecutivo_completo: true,
      },
    },

    // Notas relacionadas (NC / ND)
    NotasRelacionadas: {
      select: {
        id_documento: true,
        tipo_documento: true,
        numero_documento: true,
        consecutivo_completo: true,
      },
    },

    // Productos del documento
    Producto_Factura: {
      select: {
        id_producto: true,
        codigo: true,
        descripcion: true,
        unidad_medida: true,
        cantidad: true,
        precio_unitario: true,
        iva: true,
        total: true,
        codigo_estandar: true,
        tipo_impuesto: true,
      },
    },
  },
});


    res.json(docs);

  } catch (err) {
    console.error("Error en /ultimos:", err);
    res.status(500).json({ error: "Error al cargar los últimos documentos" });
  }
});

export default router;
