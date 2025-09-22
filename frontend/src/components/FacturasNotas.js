import { useState } from "react";

export default function FacturasNotas() {
  const [form, setForm] = useState({
    tipo_documento: "Factura",
    numero_documento: "",
    fecha_emision: "",
    valor_total: "",
    impuestos: "",
    id_usuario: "", //importante, porque el backend lo pide
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("http://localhost:3000/api/facturas-notas/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form), //aquí usas "form", no "datosFormulario"
      });

      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Error enviando documento");

      setMsg(`Documento enviado: ${data.documento.estado_dian}`); //corregido "estado_dian"

      // Reset del formulario
      setForm({
        tipo_documento: "Factura",
        numero_documento: "",
        fecha_emision: "",
        valor_total: "",
        impuestos: "",
        id_usuario: "",
      });
    } catch (err) {
      console.error(err);
      setMsg("Error de conexión");
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Enviar Factura o Nota (Simulación DIAN)</h2>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 rounded shadow-md w-[400px] space-y-3"
      >
        <select
          name="tipo_documento"
          value={form.tipo_documento}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        >
          <option value="Factura">Factura</option>
          <option value="Nota crédito">Nota Crédito</option>
          <option value="Nota débito">Nota Débito</option>
        </select>

        <input
          type="text"
          name="numero_documento"
          placeholder="Número documento"
          value={form.numero_documento}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="date"
          name="fecha_emision"
          value={form.fecha_emision}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="valor_total"
          placeholder="Valor total"
          value={form.valor_total}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="impuestos"
          placeholder="Impuestos"
          value={form.impuestos}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <input
          type="number"
          name="id_usuario"
          placeholder="ID Usuario"
          value={form.id_usuario}
          onChange={handleChange}
          className="w-full p-2 border rounded"
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        >
          Enviar
        </button>

        {msg && <p className="text-sm mt-2 text-center">{msg}</p>}
      </form>
    </div>
  );
}
