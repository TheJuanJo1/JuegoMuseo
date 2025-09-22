import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

export default function RegisterForm() {
  const [form, setForm] = useState({
    nombre_empresa: "",
    nit_empresa: "",
    correo_contacto: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  const [msg, setMsg] = useState("");
  const [step, setStep] = useState(1); // 👈 Paso 1: registro, Paso 2: verificación
  const [codigo, setCodigo] = useState(""); // Para guardar el código ingresado
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      // Paso 1: Pre-registro
      const res = await fetch("http://localhost:3000/api/empresas/pre-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Error en el registro");
      } else {
        setMsg("📧 Código enviado a tu correo, revisa tu bandeja");
        setStep(2); // 👈 Ir al paso de verificación
      }
    } catch (error) {
      console.error(error);
      setMsg("⚠️ Error de conexión con el servidor");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMsg("");

    try {
      // Paso 2: Verificar código
      const res = await fetch("http://localhost:3000/api/empresas/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo_contacto: form.correo_contacto,
          codigo,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Código inválido");
      } else {
        setMsg("✅ Empresa registrada exitosamente");
        // Redirigir al login automáticamente
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (error) {
      console.error(error);
      setMsg("⚠️ Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-assets-globales-azul">
      {step === 1 ? (
        // -------- FORMULARIO DE REGISTRO --------
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
            className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg"
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

          {msg && <p className="mt-3 text-center text-sm text-red-500">{msg}</p>}

          <p className="mt-4 text-sm text-center">
            ¿Ya tienes cuenta?{" "}
            <Link
              to="/login"
              className="text-assets-globales-azul hover:underline"
            >
              Inicia sesión aquí
            </Link>
          </p>
        </form>
      ) : (
        // -------- FORMULARIO DE VERIFICACIÓN --------
        <form
          onSubmit={handleVerify}
          className="bg-assets-globales-blanco p-8 rounded-2xl shadow-lg w-[400px]"
        >
          <h2 className="text-h2 text-center mb-6">Verificación</h2>

          <input
            type="text"
            placeholder="Código de verificación"
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            className="w-full mb-4 p-3 border border-assets-globales-color rounded-lg"
          />

          <button
            type="submit"
            className="w-full bg-green-600 text-white p-3 rounded-lg hover:bg-green-700 transition"
          >
            Validar Código
          </button>

          {msg && <p className="mt-3 text-center text-sm text-red-500">{msg}</p>}
        </form>
      )}
    </div>
  );
}
