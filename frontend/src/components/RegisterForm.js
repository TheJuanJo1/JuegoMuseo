import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import fluxLogo from "../assets/fluxdata.svg";
import backArrow from "../assets/back-arrow.svg";
import registerImage from "../assets/register.jpg";
import verifyImage from "../assets/im4.jpg";
import im3 from "../assets/im3.png";
import im2 from "../assets/im2.png";
import { API_URL } from "../config.js";

export default function RegisterForm() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

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

  // ---------------------- SUBMIT FORM ------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
    setMsgCodigo("");

    const { nombre_empresa, nit_empresa, correo_contacto, contrasena, confirmar_contrasena } = form;

    if (!nombre_empresa && !nit_empresa && !correo_contacto && !contrasena && !confirmar_contrasena) {
      setMsg("Todos los campos son requeridos");
      return;
    }

    if (!nombre_empresa.trim()) return setMsg("El nombre de la empresa es obligatorio");
    if (!nit_empresa.trim()) return setMsg("El NIT es obligatorio");
    if (!/^\d{10}$/.test(nit_empresa)) return setMsg("El NIT debe tener 10 dígitos numéricos");

    if (!correo_contacto.trim()) return setMsg("El correo de contacto es obligatorio");

    if (!contrasena.trim()) return setMsg("La contraseña es obligatoria");
    if (contrasena.length < 6) return setMsg("La contraseña debe tener al menos 6 caracteres");

    if (!confirmar_contrasena.trim()) return setMsg("Debes confirmar la contraseña");
    if (contrasena !== confirmar_contrasena) return setMsg("Las contraseñas no coinciden");

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

  // ---------------------- VERIFY CODE ------------------------
  const handleVerify = async (codigoCompleto) => {
    setMsgCodigo("");

    try {
      const res = await fetch(`${API_URL}/api/empresas/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_contacto: form.correo_contacto, codigo: codigoCompleto }),
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
      className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans] relative"
      style={{
        backgroundImage: isMobile ? `url(${step === 1 ? im2 : im3})` : "none",
        backgroundRepeat: "no-repeat",
        backgroundPosition: "center",
        backgroundSize: isMobile ? "cover" : "auto",
      }}
    >
      <div className="shadow-xl rounded-2xl flex overflow-hidden w-[1050px] h-[650px] bg-white relative">

        {/* --------------------- FORM LEFT --------------------- */}
        <div
          className="w-full md:w-1/2 flex flex-col justify-center px-12 rounded-l-2xl"
          style={{ backgroundColor: "#FFFFFF" }}
        >
          {step === 2 ? (
            <div className="relative mb-6">
              <div className="flex justify-between items-center absolute top-0 w-full" style={{ marginTop: "-130px" }}>
                <img src={fluxLogo} alt="FluxData" className="h-4" />
                <img
                  src={backArrow}
                  alt="Volver"
                  className="h-6 cursor-pointer"
                  onClick={() => {
                    setMsg("");
                    setMsgCodigo("");
                    setCodigo(Array(6).fill(""));
                    setStep(1);
                  }}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-8 mt-2">
              <img src={fluxLogo} alt="FluxData" className="h-4" />
              <img
                src={backArrow}
                alt="Volver"
                className="h-6 cursor-pointer"
                onClick={() => {
                  setMsg("");
                  setMsgCodigo("");
                  setCodigo(Array(6).fill(""));
                  if (location.state?.fromInicio) navigate("/", { replace: true });
                  else navigate(-1);
                }}
              />
            </div>
          )}

          <div className="text-center mb-6">
            {step === 1 ? (
              <>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Hola Usuario</h1>
                <p className="text-gray-500 text-lg">Bienvenido a FluxData</p>
              </>
            ) : (
              <>
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Verificación de correo</h1>
                <p className="text-gray-500 text-md">
                  Escribe el código enviado al correo electrónico:
                </p>
              </>
            )}
          </div>

          {/* ---------------- FORM STEP 1 ---------------- */}
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              <input
                type="text"
                name="nombre_empresa"
                placeholder="Nombre de Empresa"
                value={form.nombre_empresa}
                onChange={handleChange}
                className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="text"
                name="nit_empresa"
                placeholder="NIT"
                value={form.nit_empresa}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  setForm({ ...form, nit_empresa: value });
                }}
                maxLength="10"
                className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="email"
                name="correo_contacto"
                placeholder="Correo Electrónico"
                value={form.correo_contacto}
                onChange={handleChange}
                className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="password"
                name="contrasena"
                placeholder="Contraseña"
                value={form.contrasena}
                onChange={handleChange}
                className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <input
                type="password"
                name="confirmar_contrasena"
                placeholder="Confirmar Contraseña"
                value={form.confirmar_contrasena}
                onChange={handleChange}
                className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
              />

              <button
                type="submit"
                className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition mb-4"
              >
                Registrarse
              </button>

              {msg && <p className="text-red-500 text-xs text-center mb-4">{msg}</p>}

              <p className="text-center text-sm text-gray-600 mt-0">
                ¿Ya tienes cuenta?{" "}
                <Link to="/login" className="text-blue-600 hover:underline">
                  Inicia Sesión
                </Link>
              </p>
            </form>
          ) : (
            /* ---------------- FORM STEP 2 ---------------- */
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
                    className="w-12 h-12 text-center text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />
                ))}
              </div>

              {msgCodigo && <p className="text-red-500 text-center mb-4">{msgCodigo}</p>}

              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const res = await fetch(`${API_URL}/api/empresas/resend-code`, {
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
                  }}
                  className="bg-[#2E3A59] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1f2a40] transition"
                >
                  Reenviar código
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ---------------- RIGHT IMAGE (PC & TABLET ONLY) ---------------- */}
        {!isMobile && (
          <div className="w-1/2 p-4 rounded-r-2xl flex">
            <img
              src={step === 1 ? registerImage : verifyImage}
              alt="Panel derecho"
              className="object-contain w-full h-full rounded-lg"
            />
          </div>
        )}
      </div>
    </div>
  );
}
