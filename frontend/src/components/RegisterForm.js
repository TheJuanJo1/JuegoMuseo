import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config"; // <--- IMPORTANTE

import fluxLogo from "../assets/fluxdata.png";
import backArrow from "../assets/back-arrow.png";
import registerImage from "../assets/register.jpg"; 
import verifyImage from "../assets/Imagenes (7).jpg";
import im3 from "../assets/im3.png";
import im2 from "../assets/im2.png";

export default function RegisterForm() {
  const [form, setForm] = useState({
    nombre_empresa: "",
    nit_empresa: "",
    correo_contacto: "",
    contrasena: "",
    confirmar_contrasena: "",
  });

  const [msg, setMsg] = useState("");
  const [msgCodigo, setMsgCodigo] = useState("");
  const [step, setStep] = useState(1);
  const [codigo, setCodigo] = useState(Array(6).fill(""));

  const navigate = useNavigate();
  const location = useLocation();

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleCodigoChange = async (e, index) => {
    const value = e.target.value.slice(-1);
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    if (value && index < 5) {
      document.getElementById(`codigo-${index + 1}`).focus();
    }

    if (newCodigo.join("").length === 6) {
      await handleVerify(newCodigo.join(""));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgCodigo("");

    const {
      nombre_empresa,
      nit_empresa,
      correo_contacto,
      contrasena,
      confirmar_contrasena,
    } = form;

    if (
      !nombre_empresa &&
      !nit_empresa &&
      !correo_contacto &&
      !contrasena &&
      !confirmar_contrasena
    ) {
      setMsg("Todos los campos son requeridos");
      return;
    }

    if (!nombre_empresa.trim()) {
      setMsg("El nombre de la empresa es obligatorio");
      return;
    }

    if (!nit_empresa.trim()) {
      setMsg("El NIT es obligatorio");
      return;
    }

    if (!/^\d{10}$/.test(nit_empresa)) {
      setMsg("El NIT debe tener 10 dígitos numéricos");
      return;
    }

    if (!correo_contacto.trim()) {
      setMsg("El correo de contacto es obligatorio");
      return;
    }

    if (!contrasena.trim()) {
      setMsg("La contraseña es obligatoria");
      return;
    }

    if (contrasena.length < 6) {
      setMsg("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    if (!confirmar_contrasena.trim()) {
      setMsg("Debes confirmar la contraseña");
      return;
    }

    if (contrasena !== confirmar_contrasena) {
      setMsg("Las contraseñas no coinciden");
      return;
    }

    try {
      const res = await fetch(`${API_URL}/empresas/pre-register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || "Error en el registro");
        return;
      }

      setStep(2);
    } catch (error) {
      setMsg("Error de conexión con el servidor");
    }
  };

  const handleVerify = async (codigoCompleto) => {
    setMsgCodigo("");

    try {
      const res = await fetch(`${API_URL}/empresas/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          correo_contacto: form.correo_contacto,
          codigo: codigoCompleto,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsgCodigo(data.error || "Código inválido");
        setCodigo(Array(6).fill(""));

        setTimeout(() => {
          const firstInput = document.getElementById("codigo-0");
          if (firstInput) firstInput.focus();
        }, 50);

        return;
      }

      setMsgCodigo("Empresa registrada exitosamente");

      setTimeout(() => {
        if (location.state?.fromInicio) {
          navigate("/", { replace: true });
        } else {
          navigate("/login");
        }
      }, 2000);
    } catch (error) {
      setMsgCodigo("Error de conexión con el servidor");
    }
  };

  const resendCode = async () => {
    try {
      const res = await fetch(`${API_URL}/empresas/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_contacto: form.correo_contacto }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMsgCodigo(data.error || "Error reenviando código");
      } else {
        setMsgCodigo("Se ha enviado un nuevo código a tu correo");
        setCodigo(Array(6).fill(""));
      }
    } catch (error) {
      setMsg("Error de conexión con el servidor");
    }
  };

  // ------------------------------------------------------------------
  // ✅ CORRECCIÓN CLAVE: SE AGREGÓ LA SENTENCIA RETURN CON EL JSX
  // ------------------------------------------------------------------

  return (
    <div className="flex min-h-screen">
      {/* Columna de la Imagen */}
      <div className="hidden lg:block w-1/2 bg-gray-100 relative">
        <img
          src={step === 1 ? registerImage : verifyImage}
          alt="Registro"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-8 left-8">
          <img src={fluxLogo} alt="FluxData Logo" className="h-10" />
        </div>
      </div>

      {/* Columna del Formulario */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="max-w-md w-full">
          <Link to="/login" className="flex items-center text-sm text-gray-600 hover:text-gray-800 mb-4">
            <img src={backArrow} alt="Atrás" className="h-4 w-4 mr-2" />
            Volver a Iniciar Sesión
          </Link>

          <h2 className="text-3xl font-bold mb-6 text-[#27374D]">
            {step === 1 ? "Crea tu Cuenta Empresarial" : "Verificación de Correo"}
          </h2>
          
          {step === 1 ? (
            // --- Paso 1: Formulario de Registro ---
            <form onSubmit={handleSubmit} className="space-y-4">
              {msg && <p className="text-red-600 bg-red-100 p-2 rounded text-sm">{msg}</p>}

              <input
                type="text"
                name="nombre_empresa"
                placeholder="Nombre de la Empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="text"
                name="nit_empresa"
                placeholder="NIT de la Empresa (10 dígitos)"
                value={form.nit_empresa}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="email"
                name="correo_contacto"
                placeholder="Correo de Contacto"
                value={form.correo_contacto}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="password"
                name="contrasena"
                placeholder="Contraseña"
                value={form.contrasena}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
              <input
                type="password"
                name="confirmar_contrasena"
                placeholder="Confirmar Contraseña"
                value={form.confirmar_contrasena}
                onChange={handleChange}
                className="w-full border p-3 rounded-lg"
              />
              
              <button
                type="submit"
                className="w-full bg-[#27374D] text-white p-3 rounded-lg font-semibold hover:bg-[#1f2937] transition duration-200"
              >
                Registrar y Enviar Código
              </button>
            </form>
          ) : (
            // --- Paso 2: Verificación de Código ---
            <div className="space-y-6">
              <p className="text-gray-600">
                Hemos enviado un código de 6 dígitos a **{form.correo_contacto}**. Por favor, revísalo para verificar tu cuenta.
              </p>
              
              {msgCodigo && <p className={`p-2 rounded text-sm ${msgCodigo.includes("exitosamente") ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>{msgCodigo}</p>}

              <div className="flex justify-between gap-2">
                {codigo.map((digit, index) => (
                  <input
                    key={index}
                    id={`codigo-${index}`}
                    type="text"
                    maxLength="1"
                    value={digit}
                    onChange={(e) => handleCodigoChange(e, index)}
                    className="w-12 h-12 text-center text-xl border-2 border-gray-300 rounded-lg focus:border-[#27374D] focus:ring-0 transition"
                  />
                ))}
              </div>

              <div className="text-sm text-gray-600">
                ¿No recibiste el código?
                <button
                  onClick={resendCode}
                  className="text-[#27374D] hover:underline ml-1 font-medium"
                >
                  Reenviar Código
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}