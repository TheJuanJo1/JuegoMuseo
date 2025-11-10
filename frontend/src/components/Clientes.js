import { useState } from "react";

export default function ClientesForm() {
  const [form, setForm] = useState({
    nombre_cliente: "",
    apellido_cliente: "",
    tipo_documento: "",
    numero_documento: "",
    direccion_cliente: "",
    correo_cliente: "",
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("http://localhost:3000/api/clientes/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) return setMsg(data.error || "Error registrando cliente");

      setMsg(`Cliente registrado: ${data.cliente.nombre_cliente} ${data.cliente.apellido_cliente}`);

      setForm({
        nombre_cliente: "",
        apellido_cliente: "",
        tipo_documento: "",
        numero_documento: "",
        direccion_cliente: "",
        correo_cliente: "",
      });
    } catch (err) {
      console.error(err);
      setMsg("Error de conexión");
    }
  };

  return (
    <div className="flex justify-center p-6">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow-md w-[500px] space-y-3">
        <h2 className="text-2xl font-bold mb-4 text-center">Registrar Cliente</h2>

        <input type="text" name="nombre_cliente" placeholder="Nombre" value={form.nombre_cliente} onChange={handleChange} className="w-full p-2 border rounded"/>
        <input type="text" name="apellido_cliente" placeholder="Apellido" value={form.apellido_cliente} onChange={handleChange} className="w-full p-2 border rounded"/>
        <select name="tipo_documento" value={form.tipo_documento} onChange={handleChange} className="w-full p-2 border rounded">
          <option value="">Selecciona tipo de documento</option>
          <option value="CC">Cédula de ciudadanía</option>
          <option value="NIT">NIT</option>
          <option value="TI">Tarjeta de identidad</option>
          <option value="CE">Cédula extranjera</option>
        </select>
        <input type="text" name="numero_documento" placeholder="Número de documento" value={form.numero_documento} onChange={handleChange} className="w-full p-2 border rounded"/>
        <input type="text" name="direccion_cliente" placeholder="Dirección" value={form.direccion_cliente} onChange={handleChange} className="w-full p-2 border rounded"/>
        <input type="email" name="correo_cliente" placeholder="Correo electrónico" value={form.correo_cliente} onChange={handleChange} className="w-full p-2 border rounded"/>

        <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">Registrar</button>
        {msg && <p className="text-sm mt-2 text-center">{msg}</p>}
      </form>
    </div>
  );
}
