import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import fluxLogo from "../assets/fluxdata.svg";
import backArrow from "../assets/back-arrow.svg";
import registerImage from "../assets/register.jpg";
import verifyImage from "../assets/im4.jpg";
import im3 from "../assets/im3.png";
import im2 from "../assets/im2.png";
import { API_URL } from "../config.js";

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
      const res = await fetch(`${API_URL}/api/empresas/pre-register`, {
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
      const res = await fetch(`${API_URL}/api/empresas/verify-code`, {
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

  return (
    <div
      className="
        flex items-center justify-center min-h-screen font-[Work Sans] bg-[#EAF0F6]
        relative
      "
      style={{
        backgroundImage: `url(${step === 1 ? im2 : im3})`,
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: "cover", // fondo completo en móvil
      }}
    >
      <div
        className="
          shadow-xl rounded-2xl flex overflow-hidden 
          w-[1050px] h-[650px] bg-white
          max-lg:w-[90%] max-lg:h-auto
          max-md:flex-col
        "
      >
        {/* FORM CONTAINER */}
        <div
          className="
            w-1/2 flex flex-col justify-center px-12 py-10 
            rounded-l-2xl 
            max-md:w-full max-md:px-6 max-md:py-10
          "
          style={{
            backgroundColor: "#FFFFFF",
            clipPath: "polygon(0 0, 92% 0, 100% 100%, 0% 100%)",
          }}
        >
          {/* QUITAR CLIP PATH EN MÓVIL */}
          <style>
            {`
              @media(max-width: 768px){
                div[style*="clip-path"] {
                  clip-path: none !important;
                }
              }
            `}
          </style>

          {/* ENCABEZADO */}
          <div className="flex justify-between items-center mb-6">
            <img src={fluxLogo} alt="FluxData" className="h-4" />

            <img
              src={backArrow}
              alt="Volver"
              className="h-6 cursor-pointer"
              onClick={() => {
                setMsg("");
                setMsgCodigo("");
                setCodigo(Array(6).fill(""));
                if (step === 2) {
                  setStep(1);
                } else {
                  if (location.state?.fromInicio) navigate("/", { replace: true });
                  else navigate(-1);
                }
              }}
            />
          </div>

          {/* TITULO */}
          <div className="text-center mb-8">
            {step === 1 ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  Registro
                </h1>
                <p className="text-gray-500 text-lg">Crea tu cuenta</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">
                  Verificación de correo
                </h1>
                <p className="text-gray-500 text-md">
                  Ingresa el código enviado a tu correo
                </p>
              </>
            )}
          </div>

          {/* FORMULARIO PASO 1 */}
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              <input
                type="text"
                name="nombre_empresa"
                placeholder="Nombre de Empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="text"
                name="nit_empresa"
                placeholder="NIT"
                maxLength="10"
                value={form.nit_empresa}
                onChange={(e) =>
                  setForm({
                    ...form,
                    nit_empresa: e.target.value.replace(/\D/g, ""),
                  })
                }
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="email"
                name="correo_contacto"
                placeholder="Correo Electrónico"
                value={form.correo_contacto}
                onChange={handleChange}
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="password"
                name="contrasena"
                placeholder="Contraseña"
                value={form.contrasena}
                onChange={handleChange}
                className="w-full p-3 mb-4 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="password"
                name="confirmar_contrasena"
                placeholder="Confirmar Contraseña"
                value={form.confirmar_contrasena}
                onChange={handleChange}
                className="w-full p-3 mb-6 border rounded-lg focus:ring-2 focus:ring-blue-400"
              />

              <button
                type="submit"
                className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition mb-4"
              >
                Registrarse
              </button>

              {msg && (
                <p className="text-red-500 text-xs text-center mb-4">{msg}</p>
              )}

              <p className="text-center text-sm text-gray-600 mt-0">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Inicia Sesión
                </Link>
              </p>
            </form>
          ) : (
            /* FORMULARIO PASO 2 */
            <div className="w-full max-w-sm mx-auto text-center">
              <div className="flex justify-between mb-6">
                {codigo.map((val, i) => (
                  <input
                    key={i}
                    id={`codigo-${i}`}
                    type="text"
                    value={val}
                    maxLength="1"
                    onChange={(e) => handleCodigoChange(e, i)}
                    className="w-12 h-12 text-center text-lg border rounded-lg focus:ring-2 focus:ring-blue-400"
                  />
                ))}
              </div>

              {msgCodigo && (
                <p className="text-red-500 text-center mb-4">{msgCodigo}</p>
              )}

              <button
                type="button"
                onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/empresas/resend-code`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        correo_contacto: form.correo_contacto,
                      }),
                    });

                    const data = await res.json();
                    if (!res.ok) {
                      setMsgCodigo(data.error || "Error reenviando código");
                    } else {
                      setMsgCodigo("Se ha enviado un nuevo código");
                      setCodigo(Array(6).fill(""));
                    }
                  } catch (error) {
                    setMsg("Error de conexión con el servidor");
                  }
                }}
                className="bg-[#2E3A59] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1f2a40] transition"
              >
                Reenviar código
              </button>
            </div>
          )}
        </div>

        {/* IMAGEN DERECHA (OCULTA EN CELULAR) */}
        <div
          className="
            w-1/2 p-4 rounded-r-2xl flex
            max-md:hidden
          "
        >
          <img
            src={step === 1 ? registerImage : verifyImage}
            alt="Panel derecho"
            className="object-contain w-full h-full rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
