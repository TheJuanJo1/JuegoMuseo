import { useState, useEffect } from "react";
import { API_URL } from "../config/api";

export default function FacturasNotas() {
  const [form, setForm] = useState({
    tipo_documento: "Factura",
    numero_documento: "",
    fecha_emision: "",
    id_usuario: "",
    id_cliente: "",
    numero_serie: "",
    valor_total: "",
    impuestos: "",
    motivo_nota: "",
    monto_nota: "",
  });

  const [productos, setProductos] = useState([]);
  const [productoTemp, setProductoTemp] = useState({
    descripcion: "",
    cantidad: 0,
    precio_unitario: 0,
    iva: 0,
  });
  const [productosFactura, setProductosFactura] = useState([]);
  const [productoSeleccionado, setProductoSeleccionado] = useState(null);
  const [cantidadDevuelta, setCantidadDevuelta] = useState(1);
  const [devoluciones, setDevoluciones] = useState({}); 
  const [montoCalculado, setMontoCalculado] = useState(0);
  const [bloquearProductos, setBloquearProductos] = useState(false);
  const [msg, setMsg] = useState("");
  const [facturaValida, setFacturaValida] = useState(null); // objeto factura validada
  const [mostarCamposNota, setMostarCamposNota] = useState(false); // controla visibilidad de campos extra
  const formatCOP = (valor) =>
    new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 2,
    }).format(valor);

  useEffect(() => {
  if (!productosFactura.length) return;
  if (form.tipo_documento !== "Nota Crédito") return;

  let total = 0;

  productosFactura.forEach((p, index) => {
    const cant = parseFloat(devoluciones[index]);
    if (!isNaN(cant) && cant > 0) {
      const subtotal = cant * Number(p.precio_unitario);
      const iva = subtotal * (Number(p.iva) / 100);
      total += subtotal + iva;
    }
  });

  setMontoCalculado(total);
  setForm((prev) => ({ ...prev, monto_nota: total }));
}, [devoluciones, productosFactura, form.tipo_documento]);


const handleMontoNotaChange = (e) => {
  let valor = e.target.value;
  if (valor === "") {
    setForm((prev) => ({ ...prev, monto_nota: "" }));
    return;
  }

  valor = Number(valor);

  if (productos.length > 0) {
    setMsg("No se puede cambiar manualmente el total, ya hay productos agregados");
    return;
  }
  //Si es Nota Crédito, no puede superar el total de la factura original
  if (form.tipo_documento === "Nota Crédito") {
    const totalFactura = Number(facturaValida?.valor_total || 0);

    if (valor > totalFactura) {
      setMsg(`El monto no puede ser mayor al total de la factura (${formatCOP(totalFactura)})`);
      return;
    }
  }
  if (form.tipo_documento === "Nota Débito") {
    if (valor > 1000000) {
      setMsg("El monto máximo permitido es 1,000,000");
      return;
    }
  }
  setForm((prev) => ({ ...prev, monto_nota: valor }));
};



useEffect(() => {
    let total = 0;
    productos.forEach((p) => {
      const subtotal = Number(p.cantidad) * Number(p.precio_unitario);
      const iva = subtotal * (Number(p.iva) / 100);
      total += subtotal + iva;
    });
    
    // guardamos número (no string) para facilitar envíos
    setForm((prev) => ({ ...prev, valor_total: total }));
  }, [productos]);

  useEffect(() => {
  if (form.tipo_documento !== "Nota Débito") return;
  if (!productosFactura.length) return;

  let total = 0;

  productosFactura.forEach((p) => {
    if (p.cantidad_extra && Number(p.cantidad_extra) > 0) {
      const subtotal = Number(p.cantidad_extra) * Number(p.precio_unitario);
      const iva = subtotal * (Number(p.iva) / 100);
      total += subtotal + iva;
    }
  });

  // suma también productos nuevos agregados
  productos.forEach((p) => {
    const subtotal = Number(p.cantidad) * Number(p.precio_unitario);
    const iva = subtotal * (Number(p.iva) / 100);
    total += subtotal + iva;
  });

  setMontoCalculado(total);
  setForm((prev) => ({ ...prev, monto_nota: total }));
    if (!form.monto_nota) {
    setForm((prev) => ({ ...prev, monto_nota: total }));
  }
}, [productosFactura, productos, form.tipo_documento]);
  
const handleChangeForm = (e) => {
  const { name, value } = e.target;

  if (name === "tipo_documento") {

    // Reset general
    setFacturaValida(null);
    setMostarCamposNota(false);
    setProductos([]);
    setProductoTemp({ descripcion: "", cantidad: 0, precio_unitario: 0, iva: 0 });
    setDevoluciones({});
    setMontoCalculado(0);
    setMsg("");

    // Lógica por tipo
    if (value === "Factura") {
      // Factura normal
      setBloquearProductos(false); // permite agregar productos
      setForm({
        tipo_documento: "Factura",
        numero_documento: "",
        fecha_emision: "",
        id_usuario: "",
        id_cliente: "",
        numero_serie: "",
        valor_total: "",
        impuestos: "",
        motivo_nota: "",
        monto_nota: "",
      });
    }

    if (value === "Nota Crédito") {
      setBloquearProductos(true); // no se pueden agregar productos
      setForm({
        tipo_documento: "Nota Crédito",
        numero_documento: "",
        fecha_emision: "",
        id_usuario: "",
        id_cliente: "",
        numero_serie: "",
        valor_total: "", 
        impuestos: "",
        motivo_nota: "",
        monto_nota: 0,
      });
    }

    if (value === "Nota Débito") {
      setBloquearProductos(false); // sí permite agregar productos nuevos
      setForm({
        tipo_documento: "Nota Débito",
        numero_documento: "",
        fecha_emision: "",
        id_usuario: "",
        id_cliente: "",
        numero_serie: "",
        valor_total: "", // se calcula con productos nuevos
        impuestos: "",
        motivo_nota: "",
        monto_nota: 0, // se calcula dinámicamente igual que NC
      });
    }

    return;
  }
  // Cambio normal de cualquier otro campo
  setForm((prev) => ({ ...prev, [name]: value }));
};


  const handleChangeProducto = (e) => {
    const { name, value } = e.target;
    setProductoTemp({
      ...productoTemp,
      [name]: name === "descripcion" ? value : (value === "" ? "" : Number(value))
    });
  };
  
  const agregarProducto = () => {
  if (!productoTemp.descripcion) return setMsg("Completa la descripción del producto");
  if (!productoTemp.cantidad || productoTemp.cantidad <= 0) return setMsg("La cantidad debe ser mayor a 0");
  if (!productoTemp.precio_unitario || productoTemp.precio_unitario <= 0) return setMsg("El precio debe ser mayor a 0");

  const total = productoTemp.cantidad * productoTemp.precio_unitario * (1 + productoTemp.iva / 100);

  // Buscar si ya existe un producto con la misma descripción
  const indexExistente = productos.findIndex(p => p.descripcion === productoTemp.descripcion);

  if (indexExistente >= 0) {
    // Si existe, sumamos cantidades y recalculamos el total
    const nuevosProductos = [...productos];
    nuevosProductos[indexExistente].cantidad += productoTemp.cantidad;
    nuevosProductos[indexExistente].precio_unitario = productoTemp.precio_unitario; // opcional: actualizar precio
    nuevosProductos[indexExistente].iva = productoTemp.iva; // opcional: actualizar IVA
    nuevosProductos[indexExistente].total += total;
    setProductos(nuevosProductos);
  } else {
    // Si no existe, lo agregamos normal
    setProductos(prev => [...prev, { ...productoTemp, total }]);
  }

  setProductoTemp({ descripcion: "", cantidad: 0, precio_unitario: 0, iva: 0 });
  setMsg("");
};


  const eliminarProducto = (index) => setProductos(productos.filter((_, i) => i !== index));
  const validarNumeroSerie = async () => {
    setMsg("");
    setFacturaValida(null);
    setMostarCamposNota(false);
    setProductoSeleccionado(null);
    setCantidadDevuelta(1);
    setMontoCalculado(0);
  
    if (!form.numero_serie) return setMsg("Ingresa el número de serie a validar");
    if (!form.id_usuario) return setMsg("Ingresa el ID de usuario antes de validar");
    if (!form.id_cliente) return setMsg("Ingresa el ID del cliente antes de validar");
    if (form.tipo_documento === "Nota Crédito") {
  const totalFactura = Number(facturaValida?.valor_total || 0);

  if (Number(form.monto_nota) > totalFactura) {
    return setMsg(`El monto de la nota no puede ser mayor al total de la factura (${formatCOP(totalFactura)})`);
  }
}

    try {
      const res = await fetch(
        `${API_URL}/api/facturas-notas/validar-factura/${encodeURIComponent(form.numero_serie)}/${encodeURIComponent(form.id_usuario)}/${encodeURIComponent(form.id_cliente)}`
      );
      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Factura no válida");
        return;
      }
      const factura = data.factura;
      if (!factura) {
        setMsg("Factura no encontrada");
        return;
      }

      if (factura.estado_dian !== "Aceptado") {
        setMsg("La factura no está ACEPTADA. Solo se pueden aplicar notas a facturas ACEPTADAS.");
        return;
      }
      setFacturaValida(factura);
      setMostarCamposNota(true);
      setProductosFactura(factura.Producto_Factura || []);
      const devolucionesIniciales = {};
      (factura.Producto_Factura || []).forEach((p, index) => {
        devolucionesIniciales[index] = 0;
      });
      setDevoluciones(devolucionesIniciales);

      setMsg("Factura validada y ACEPTADA. Ahora selecciona motivo y monto si aplica.");
      if (form.tipo_documento === "Nota Crédito") {
        setBloquearProductos(true);
      }
    } catch (err) {
      console.error(err);
      setMsg("Error conectando al servidor para validar la serie");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.numero_documento || !form.fecha_emision || !form.id_usuario) {
      return setMsg("Faltan campos obligatorios");
    }
    if (!form.id_cliente) {
    return setMsg("Debes ingresar el ID del cliente");
  }
  // Para Factura usamos productos agregados
if (form.tipo_documento === "Factura" && productos.length === 0) {
  return setMsg("Debes agregar al menos un producto con precio mayor a 0");
}

// Para Nota Débito usamos productos de factura + productos nuevos
// Para Nota Débito, no es obligatorio agregar productos
if (form.tipo_documento === "Nota Débito") {
  // Calculamos el total de la nota si hay productos, pero no bloqueamos el envío
  const totalNotaDebito = productosFactura.reduce((acc, p) => acc + (Number(p.cantidad_extra || 0) * (1 + Number(p.iva || 0)/100) * Number(p.precio_unitario || 0)), 0) +
                         productos.reduce((acc, p) => acc + (Number(p.cantidad || 0) * (1 + Number(p.iva || 0)/100) * Number(p.precio_unitario || 0)), 0);
  setMontoCalculado(totalNotaDebito); // opcional, para que el total dinámico se actualice si hay productos
}


    if (form.tipo_documento !== "Factura") {
      if (!facturaValida) return setMsg("Debes validar el número de serie de la factura antes de enviar la nota.");
      // monto opcional: si es proporcionado, debe ser número positivo y no mayor al total de la factura original (lógica mínima)
    }
    let productosPayload = [];

if (form.tipo_documento === "Factura") {
  productosPayload = productos; // productos agregados por el usuario
} else if (form.tipo_documento === "Nota Crédito") {
  productosPayload = productosFactura.map((p, index) => ({
    ...p,
    cantidad_devuelta: devoluciones[index] || 0
  }));
} else if (form.tipo_documento === "Nota Débito") {
  // productos de la factura con cantidad_extra + productos nuevos agregados
  productosPayload = [
    ...productosFactura.map((p) => ({
      ...p,
      cantidad_extra: Number(p.cantidad_extra || 0)
    })),
    ...productos
  ];
}

const payload = {
  tipo_documento: form.tipo_documento,
  numero_documento: form.numero_documento,
  fecha_emision: form.fecha_emision,
  id_usuario: form.id_usuario,
  id_cliente: form.id_cliente || null,
  productos: productosPayload,
  valor_total: form.tipo_documento === "Factura" ? Number(form.valor_total || 0) : Number(form.monto_nota || 0),
  impuestos: form.impuestos ? Number(form.impuestos) : 0,
  factura_relacionada: form.tipo_documento !== "Factura" ? form.numero_serie : null,
  numero_serie: form.numero_serie || null,
  motivo_nota: form.tipo_documento !== "Factura" ? form.motivo_nota : null,
  monto_nota: form.tipo_documento !== "Factura" && form.monto_nota ? Number(form.monto_nota) : null,
  detalle_nota: form.tipo_documento !== "Factura" ? form.detalle_nota || "" : null,
};


    try {
      const res = await fetch(`${API_URL}api/facturas-notas/enviar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Error enviando documento");

      setMsg(`Documento enviado: ${data.documento.estado_dian} - Total: ${formatCOP(data.documento.valor_total)}`);
      setForm({
        tipo_documento: "Factura",
        numero_documento: "",
        fecha_emision: "",
        id_usuario: "",
        id_cliente: "",
        numero_serie: "",
        valor_total: "",
        impuestos: "",
        motivo_nota: "",
        monto_nota: "",
      });
      setProductos([]);
      setFacturaValida(null);
      setMostarCamposNota(false);
    } catch (err) {
      console.error(err);
      setMsg("Error de conexión");
    }
  };
  return (
  <div className="flex justify-center p-6">
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-[700px] space-y-4">
      <h2 className="text-2xl font-bold text-center mb-4">Enviar Factura o Nota</h2>

      <select
        name="tipo_documento"
        value={form.tipo_documento}
        onChange={handleChangeForm}
        className="w-full p-2 border rounded"
      >
        <option value="Factura">Factura</option>
        <option value="Nota Crédito">Nota Crédito</option>
        <option value="Nota Débito">Nota Débito</option>
      </select>

      <input
        type="text"
        name="numero_documento"
        placeholder="Número documento"
        value={form.numero_documento}
        onChange={handleChangeForm}
        className="w-full p-2 border rounded"
      />

      {form.tipo_documento !== "Factura" && (
        <div className="flex gap-2">
          <input
            type="text"
            name="numero_serie"
            placeholder="Número de serie de la factura"
            value={form.numero_serie}
            onChange={handleChangeForm}
            className="flex-1 p-2 border rounded"
          />
          <button
            type="button"
            onClick={validarNumeroSerie}
            className="bg-[#394867] text-white px-3 rounded hover:bg-[#2f3b55]"
          >
            Validar serie
          </button>
        </div>
      )}

      {/* Detalle condicionado para Nota Crédito / Débito */}
      {mostarCamposNota &&
        facturaValida &&
        (form.tipo_documento === "Nota Crédito" || form.tipo_documento === "Nota Débito") && (
          <div className="p-3 bg-blue-50 rounded border">
            <p className="font-semibold">
              Factura válida: {facturaValida.numero_serie} — Total:{" "}
              {formatCOP(Number(facturaValida.valor_total || 0))}
            </p>

            <div className="mt-3 bg-white p-3 rounded border">
              <p className="font-semibold mb-2">Productos de la factura</p>

              {productosFactura.map((p, index) => (
                <div key={index} className="border p-2 rounded mb-2 bg-gray-50">
                  <p className="font-semibold">{p.descripcion}</p>
                  <p className="text-sm text-gray-600">
                    Cantidad facturada: {p.cantidad} — Precio: {formatCOP(p.precio_unitario)}
                  </p>

                  {form.tipo_documento === "Nota Crédito" && (
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm">Cantidad a devolver:</label>
                      <input
                        type="number"
                        min="0"
                        max={p.cantidad}
                        value={devoluciones[index] === "" ? "" : devoluciones[index]}
                        onChange={(e) => {
                          const v = e.target.value;
                          if (v === "") {
                            setDevoluciones((prev) => ({ ...prev, [index]: "" }));
                            return;
                          }
                          const num = Number(v);
                          if (num <= p.cantidad) {
                            setDevoluciones((prev) => ({ ...prev, [index]: num }));
                          }
                        }}
                        className="w-24 p-1 border rounded"
                      />
                    </div>
                  )}

                  {form.tipo_documento === "Nota Débito" && (
                    <div className="flex items-center gap-2 mt-2">
                      <label className="text-sm">Cantidad adicional:</label>
                      <input
                        type="number"
                        min="0"
                        max="1000000"
                        value={p.cantidad_extra === "" ? "" : p.cantidad_extra}
                        onChange={(e) => {
                          const valor = e.target.value;
                          if (valor === "") {
                            const nuevo = [...productosFactura];
                            nuevo[index].cantidad_extra = "";
                            setProductosFactura(nuevo);
                            return;
                          }
                          const num = Number(valor);
                          if (num <= 1000000) {
                            const nuevo = [...productosFactura];
                            nuevo[index].cantidad_extra = num;
                            setProductosFactura(nuevo);
                          }
                        }}
                        className="w-24 p-1 border rounded"
                      />
                    </div>
                  )}
                </div>
              ))}

              {/* Total dinámico según el tipo */}
              <p className="mt-2 font-bold text-black">
                Total de la nota: {formatCOP(Number(form.monto_nota || montoCalculado))}
              </p>
            </div>

            {/* Monto manual y descripción */}
            <div className="mt-3">
              <label className="block text-sm font-medium">Monto de la nota</label>
              <input
                name="monto_nota"
                type="number"
                step="0.01"
                value={form.monto_nota === "" ? "" : form.monto_nota}
                onChange={handleMontoNotaChange}
                className="w-full p-2 border rounded mt-1"
              />

              <p className="text-xs text-gray-500 mt-1">Total calculado: {formatCOP(montoCalculado)}</p>
            </div>

            <div className="mt-3">
              <label className="block text-sm font-medium">Descripción / detalle</label>
              <textarea
                name="detalle_nota"
                onChange={handleChangeForm}
                value={form.detalle_nota || ""}
                className="w-full p-2 border rounded mt-1"
                placeholder="Explica brevemente el motivo"
              />
            </div>
          </div>
        )}

      {/* Resumen / Productos originales (lista principal) */}
      <div className="mt-3 bg-white p-3 rounded border">
        <p className="font-semibold mb-2">Productos de la factura</p>

        {productosFactura.map((p, index) => (
          <div key={index} className="border p-2 rounded mb-2 bg-gray-50">
            <p className="font-semibold">{p.descripcion}</p>
            <p className="text-sm text-gray-600">
              Cantidad facturada: {p.cantidad} — Precio: {formatCOP(p.precio_unitario)}
            </p>

            {form.tipo_documento === "Nota Crédito" && (
              <div className="flex items-center gap-2 mt-2">
                <label className="text-sm">Cantidad a devolver:</label>
                <input
                  type="number"
                  min="0"
                  max={p.cantidad}
                  value={devoluciones[index] === "" ? "" : devoluciones[index]}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "") {
                      setDevoluciones((prev) => ({ ...prev, [index]: "" }));
                      return;
                    }
                    const num = Number(v);
                    if (num <= p.cantidad) {
                      setDevoluciones((prev) => ({ ...prev, [index]: num }));
                    }
                  }}
                  className="w-24 p-1 border rounded"
                />
              </div>
            )}

            {form.tipo_documento === "Nota Débito" && (
              <div className="flex items-center gap-2 mt-2">
                <label className="text-sm">Cantidad adicional:</label>
                <input
                  type="number"
                  min="0"
                  max="1000000"
                  value={p.cantidad_extra === "" ? "" : p.cantidad_extra}
                  onChange={(e) => {
                    const valor = e.target.value;
                    if (valor === "") {
                      const nuevo = [...productosFactura];
                      nuevo[index].cantidad_extra = "";
                      setProductosFactura(nuevo);
                      return;
                    }
                    const num = Number(valor);
                    if (num <= 1000000) {
                      const nuevo = [...productosFactura];
                      nuevo[index].cantidad_extra = num;
                      setProductosFactura(nuevo);
                    }
                  }}
                  className="w-24 p-1 border rounded"
                />
              </div>
            )}
          </div>
        ))}

        <p className="mt-2 font-bold text-black">
          Total de la nota: {formatCOP(Number(form.monto_nota || montoCalculado))}
        </p>
      </div>

      {/* Monto manual y descripción (sección común si aún no la mostró arriba) */}
      {!(
        mostarCamposNota &&
        facturaValida &&
        (form.tipo_documento === "Nota Crédito" || form.tipo_documento === "Nota Débito")
      ) && (
        <>
          <div className="mt-3">
            <label className="block text-sm font-medium">Monto de la nota</label>
            <input
              name="monto_nota"
              type="number"
              step="0.01"
              value={form.monto_nota === "" ? "" : form.monto_nota}
              onChange={handleMontoNotaChange}
              className="w-full p-2 border rounded mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">Total calculado: {formatCOP(montoCalculado)}</p>
          </div>

          <div className="mt-3">
            <label className="block text-sm font-medium">Descripción / detalle</label>
            <textarea
              name="detalle_nota"
              onChange={handleChangeForm}
              value={form.detalle_nota || ""}
              className="w-full p-2 border rounded mt-1"
              placeholder="Explica brevemente el motivo"
            />
          </div>
        </>
      )}

      <input
        type="datetime-local"
        name="fecha_emision"
        value={form.fecha_emision}
        onChange={handleChangeForm}
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="id_usuario"
        placeholder="ID Usuario"
        value={form.id_usuario}
        onChange={handleChangeForm}
        className="w-full p-2 border rounded"
      />

      <input
        type="number"
        name="id_cliente"
        placeholder="ID Cliente"
        value={form.id_cliente}
        onChange={handleChangeForm}
        className="w-full p-2 border rounded"
      />

      <input
        type="text"
        readOnly
        name="valor_total"
        placeholder="Total automático"
        value={formatCOP(Number(form.valor_total || 0))}
        className="w-full p-2 border rounded bg-gray-100"
      />

      <input
        type="number"
        name="impuestos"
        placeholder="Impuestos"
        value={form.impuestos}
        onChange={handleChangeForm}
        className="w-full p-2 border rounded"
      />

      <h3 className="font-semibold mt-4">Productos</h3>
      {productos.map((p, i) => (
        <div key={i} className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded">
          <span>
            {p.descripcion} - {p.cantidad} x {formatCOP(p.precio_unitario)} (IVA: {p.iva}%) ={" "}
            {formatCOP(p.total)}
          </span>
          <button
            type="button"
            onClick={() => eliminarProducto(i)}
            disabled={bloquearProductos}
            className={`text-sm ${bloquearProductos ? "text-gray-300" : "text-red-500"}`}
          >
            Quitar
          </button>
        </div>
      ))}

      <div className="flex gap-2 mt-2">
        <input
          name="descripcion"
          placeholder="Descripción"
          value={productoTemp.descripcion}
          onChange={handleChangeProducto}
          disabled={bloquearProductos}
          className="flex-1 p-2 border rounded"
        />
        <input
          name="cantidad"
          type="number"
          placeholder="Cant."
          value={productoTemp.cantidad}
          onChange={handleChangeProducto}
          disabled={bloquearProductos}
          className="w-20 p-2 border rounded"
        />
        <input
          name="precio_unitario"
          type="number"
          placeholder="Precio"
          value={productoTemp.precio_unitario}
          onChange={handleChangeProducto}
          disabled={bloquearProductos}
          className="w-24 p-2 border rounded"
        />
        <input
          name="iva"
          type="number"
          placeholder="IVA %"
          value={productoTemp.iva}
          onChange={handleChangeProducto}
          disabled={bloquearProductos}
          className="w-20 p-2 border rounded"
        />
        <button
          type="button"
          onClick={agregarProducto}
          disabled={bloquearProductos}
          className={`px-3 rounded text-white ${bloquearProductos ? "bg-gray-400" : "bg-[#394867] hover:bg-[#2f3b55]"}`}
        >
          + Agregar
        </button>
      </div>

      <button type="submit" className="w-full bg-[#394867] text-white py-2 rounded hover:bg-[#2f3b55]">
        Enviar
      </button>

      {msg && <p className="text-center text-sm mt-2">{msg}</p>}
    </form>
  </div>
);
}
