import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { API_URL } from "../config";

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

    if (!nombre_empresa || !nit_empresa || !correo_contacto || !contrasena) {
      setMsg("Todos los campos son requeridos");
      return;
    }

    if (!/^\d{10}$/.test(nit_empresa)) {
      setMsg("El NIT debe tener 10 dígitos numéricos");
      return;
    }

    if (contrasena.length < 6) {
      setMsg("La contraseña debe tener al menos 6 caracteres");
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

  // ⬇️⬇️⬇️ FALTA EL RETURN → LO AGREGO AHORA ⬇️⬇️⬇️
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      {step === 1 ? (
        <div className="bg-white shadow-xl p-10 rounded-xl w-[500px]">
          <h2 className="text-2xl font-bold mb-4">Registro</h2>

          {msg && <p className="text-red-600 mb-3">{msg}</p>}

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="nombre_empresa"
              placeholder="Nombre de la empresa"
              className="w-full p-3 border rounded mb-3"
              onChange={handleChange}
            />
            <input
              type="text"
              name="nit_empresa"
              placeholder="NIT (10 dígitos)"
              className="w-full p-3 border rounded mb-3"
              onChange={handleChange}
            />
            <input
              type="email"
              name="correo_contacto"
              placeholder="Correo"
              className="w-full p-3 border rounded mb-3"
              onChange={handleChange}
            />
            <input
              type="password"
              name="contrasena"
              placeholder="Contraseña"
              className="w-full p-3 border rounded mb-3"
              onChange={handleChange}
            />
            <input
              type="password"
              name="confirmar_contrasena"
              placeholder="Confirmar Contraseña"
              className="w-full p-3 border rounded mb-3"
              onChange={handleChange}
            />

            <button className="w-full bg-blue-600 text-white p-3 rounded">
              Registrar
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white shadow-xl p-10 rounded-xl w-[500px]">
          <h2 className="text-2xl font-bold mb-4">Verificación</h2>

          {msgCodigo && <p className="text-red-600 mb-3">{msgCodigo}</p>}

          <div className="flex gap-2 justify-center">
            {codigo.map((c, i) => (
              <input
                key={i}
                id={`codigo-${i}`}
                maxLength={1}
                value={c}
                onChange={(e) => handleCodigoChange(e, i)}
                className="w-12 h-12 border text-center text-xl rounded"
              />
            ))}
          </div>

          <button
            onClick={resendCode}
            className="mt-4 text-blue-600 underline text-sm"
          >
            Reenviar código
          </button>
        </div>
      )}
    </div>
  );
}
