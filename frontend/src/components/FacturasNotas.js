import { useState } from "react";


export default function FacturasNotas() {
  const [form, setForm] = useState({
    tipo_documento: "Factura",
    numero_documento: "",
    fecha_emision: "",
    id_usuario: "",
    id_cliente: "",
    factura_relacionada: "",
    valor_total: "",
    impuestos: "",
  });

  const [productos, setProductos] = useState([]);
  const [productoTemp, setProductoTemp] = useState({ descripcion: "", cantidad: 1, precio_unitario: 0, iva: 0 });
  const [msg, setMsg] = useState("");

  const formatCOP = (valor) => new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", minimumFractionDigits: 2 }).format(valor);

  const handleChangeForm = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleChangeProducto = (e) => setProductoTemp({ ...productoTemp, [e.target.name]: e.target.name === "descripcion" ? e.target.value : parseFloat(e.target.value || 0) });

  const agregarProducto = () => {
    if (!productoTemp.descripcion) return setMsg("Completa la descripción del producto");
    const total = productoTemp.cantidad * productoTemp.precio_unitario * (1 + productoTemp.iva / 100);
    setProductos([...productos, { ...productoTemp, total }]);
    setProductoTemp({ descripcion: "", cantidad: 1, precio_unitario: 0, iva: 0 });
    setMsg("");
  };

  const eliminarProducto = (index) => setProductos(productos.filter((_, i) => i !== index));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    if (!form.numero_documento || !form.fecha_emision || !form.id_usuario) {
      return setMsg("Faltan campos obligatorios");
    }

    const payload = {
      ...form,
      productos,
      valor_total: form.valor_total ? parseFloat(form.valor_total) : undefined,
      impuestos: form.impuestos ? parseFloat(form.impuestos) : undefined,
      factura_relacionada: form.tipo_documento !== "Factura" ? form.factura_relacionada : null,
    };

    try {
      const res = await fetch("http://localhost:3000/api/facturas-notas/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Error enviando documento");
      setMsg(`Documento enviado: ${data.documento.estado_dian}, Total: ${formatCOP(data.documento.valor_total)}`);
      setForm({ tipo_documento: "Factura", numero_documento: "", fecha_emision: "", id_usuario: "", id_cliente: "", factura_relacionada: "", valor_total: "", impuestos: "" });
      setProductos([]);
    } catch (err) {
      console.error(err);
      setMsg("Error de conexión");
    }
  };

  return (
    <div className="flex justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-[700px] space-y-4">
        <h2 className="text-2xl font-bold text-center mb-4">Enviar Factura o Nota</h2>

        <select name="tipo_documento" value={form.tipo_documento} onChange={handleChangeForm} className="w-full p-2 border rounded">
          <option value="Factura">Factura</option>
          <option value="Nota crédito">Nota Crédito</option>
          <option value="Nota débito">Nota Débito</option>
        </select>

        <input type="text" name="numero_documento" placeholder="Número documento" value={form.numero_documento} onChange={handleChangeForm} className="w-full p-2 border rounded" />
        <input type="datetime-local" name="fecha_emision" value={form.fecha_emision} onChange={handleChangeForm} className="w-full p-2 border rounded" />
        <input type="number" name="id_usuario" placeholder="ID Usuario" value={form.id_usuario} onChange={handleChangeForm} className="w-full p-2 border rounded" />
        <input type="number" name="id_cliente" placeholder="ID Cliente" value={form.id_cliente} onChange={handleChangeForm} className="w-full p-2 border rounded" />

        <input type="number" name="valor_total" placeholder="Total (opcional)" value={form.valor_total} onChange={handleChangeForm} className="w-full p-2 border rounded" />
        <input type="number" name="impuestos" placeholder="Impuestos" value={form.impuestos} onChange={handleChangeForm} className="w-full p-2 border rounded" />

        {form.tipo_documento !== "Factura" && <input type="text" name="factura_relacionada" placeholder="Factura relacionada" value={form.factura_relacionada} onChange={handleChangeForm} className="w-full p-2 border rounded" />}

        <h3 className="font-semibold mt-4">Productos</h3>
        {productos.map((p, i) => <div key={i} className="flex justify-between items-center mb-2 bg-gray-50 p-2 rounded"><span>{p.descripcion} - {p.cantidad} x {formatCOP(p.precio_unitario)} (IVA: {p.iva}%) = {formatCOP(p.total)}</span><button type="button" onClick={() => eliminarProducto(i)} className="text-red-500 text-sm">Quitar</button></div>)}

        <div className="flex gap-2 mt-2">
          <input name="descripcion" placeholder="Descripción" value={productoTemp.descripcion} onChange={handleChangeProducto} className="flex-1 p-2 border rounded" />
          <input name="cantidad" type="number" placeholder="Cant." value={productoTemp.cantidad} onChange={handleChangeProducto} className="w-20 p-2 border rounded" />
          <input name="precio_unitario" type="number" placeholder="Precio" value={productoTemp.precio_unitario} onChange={handleChangeProducto} className="w-24 p-2 border rounded" />
          <input name="iva" type="number" placeholder="IVA %" value={productoTemp.iva} onChange={handleChangeProducto} className="w-20 p-2 border rounded" />
          <button type="button" onClick={agregarProducto} className="bg-green-600 text-white px-3 rounded hover:bg-green-700">+ Agregar</button>
        </div>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Enviar</button>
        {msg && <p className="text-center text-sm mt-2">{msg}</p>}
      </form>
    </div>
  );
}
