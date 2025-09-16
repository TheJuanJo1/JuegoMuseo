import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({
    nombre_empresa: "",
    nit_empresa: "",
    correo_contacto: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  const [msg, setMsg] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      const res = await fetch("http://localhost:3000/api/empresas/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Error en el registro");
      } else {
        setMsg("✅ Empresa registrada exitosamente");
        setForm({
          nombre_empresa: "",
          nit_empresa: "",
          correo_contacto: "",
          contrasena: "",
          confirmar_contrasena: "",
        });
      }
    } catch (error) {
      console.error(error);
      setMsg("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-assets-globales-azul">
      <form
        onSubmit={handleSubmit}
        className="bg-assets-globales-blanco p-8 rounded-2xl shadow-lg w-[400px]"
      >
        <h2 className="text-h2 text-center mb-6">Registro de Empresa</h2>

        <input
          type="text"
          name="nombre_empresa"
          placeholder="Nombre de la empresa"
          value={form.nombre_empresa}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg focus:outline-none focus:ring-2 focus:ring-assets-globales-azul"
        />

        <input
          type="text"
          name="nit_empresa"
          placeholder="NIT"
          value={form.nit_empresa}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg"
        />

        <input
          type="email"
          name="correo_contacto"
          placeholder="Correo de contacto"
          value={form.correo_contacto}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg"
        />

        <input
          type="password"
          name="contrasena"
          placeholder="Contraseña"
          value={form.contrasena}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg"
        />

        <input
          type="password"
          name="confirmar_contrasena"
          placeholder="Confirmar contraseña"
          value={form.confirmar_contrasena}
          onChange={handleChange}
          className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg"
        />

        <button
          type="submit"
          className="w-full bg-assets-globales-azul text-assets-globales-blanco p-3 rounded-lg font-botones hover:opacity-80 transition"
        >
          Registrar
        </button>

        {msg && (
          <p className="mt-3 text-center text-sm text-red-500">{msg}</p>
        )}

        <p className="mt-4 text-sm text-center">
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="text-assets-globales-azul hover:underline">
            Inicia sesión aquí
          </Link>
        </p>
      </form>
    </div>
  );
}
