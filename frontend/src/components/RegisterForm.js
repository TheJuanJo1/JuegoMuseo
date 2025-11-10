// src/components/RegisterForm.jsx
import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
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

    if (value && index < 5) document.getElementById(`codigo-${index + 1}`).focus();
    if (newCodigo.join("").length === 6) await handleVerify(newCodigo.join(""));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg("");
     if (form.contrasena.length < 6) {
    setMsg("La contraseña debe tener al menos 6 caracteres");
    return;
  }

  if (form.contrasena !== form.confirmar_contrasena) {
    setMsg("Las contraseñas no coinciden");
    return;
  }
    try {
      const res = await fetch("http://localhost:3000/api/empresas/pre-register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || "Error en el registro");
      else setStep(2);
    } catch (error) {
      setMsg("Error de conexión con el servidor");
    }
  };

  const handleVerify = async (codigoCompleto) => {
    setMsg("");
    try {
      const res = await fetch("http://localhost:3000/api/empresas/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo_contacto: form.correo_contacto, codigo: codigoCompleto }),
      });
      const data = await res.json();
      if (!res.ok) setMsg(data.error || "Código inválido");
      else {
        setMsg("Empresa registrada exitosamente");
        setTimeout(() => {
          if (location.state?.fromInicio) {
            navigate("/", { replace: true });
          } else {
            navigate("/login");
          }
        }, 2000);
      }
    } catch (error) {
      setMsg("Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans]"
    style={
      step === 1
        ? {
            backgroundImage: `url(${im2})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "62.5% auto",
          }:
          step === 2 ? {
            backgroundImage: `url(${im3})`,
            backgroundRepeat: "no-repeat",
            backgroundPosition: "right center",
            backgroundSize: "62.5% auto", 
          }:
          {}
          }>
        <div className="shadow-xl rounded-2xl flex overflow-hidden w-[1050px] h-[650px] bg-white">
        <div className="w-1/2 flex flex-col justify-center px-12 rounded-l-2xl" style={{ backgroundColor: "#FFFFFF", clipPath: "polygon(0 0, 92% 0, 100% 100%, 0% 100%)" }}>
          {step === 2 ? (
            <div className="relative mb-6">
              <div className="flex justify-between items-center absolute top-0 w-full" style={{ marginTop: '-130px' }}>
                <img src={fluxLogo} alt="FluxData" className="h-4" />
                <img
                  src={backArrow}
                  alt="Volver"
                  className="h-6 cursor-pointer"
                  onClick={() => setStep(1)}
                />
              </div>
            </div>
          ) : (
            <div className="flex justify-between items-center mb-8 mt-2">
              <img src={fluxLogo} alt="FluxData" className="h-4" />
              <img src={backArrow} alt="Volver" className="h-6 cursor-pointer"
              onClick={() => {
                if (location.state?.fromInicio) {
                  navigate("/", { replace: true });
                } else {
                  navigate(-1);
                }
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
                  Escribe el código de Verificación que se envió al Correo Electrónico:
                </p>
              </>
            )}
          </div>
          {step === 1 ? (
            <form onSubmit={handleSubmit} className="w-full max-w-sm mx-auto">
              <input type="text" name="nombre_empresa" placeholder="Nombre de Empresa" value={form.nombre_empresa} onChange={handleChange} className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="text" name="nit_empresa" placeholder="NIT" value={form.nit_empresa} onChange={handleChange} className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="email" name="correo_contacto" placeholder="Correo Electrónico" value={form.correo_contacto} onChange={handleChange} className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="password" name="contrasena" placeholder="Contraseña" value={form.contrasena} onChange={handleChange} className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <input type="password" name="confirmar_contrasena" placeholder="Confirmar Contraseña" value={form.confirmar_contrasena} onChange={handleChange} className="w-full p-3 mb-6 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
              <button type="submit" className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition mb-4">Registrarse</button>
              {msg && <p className="text-red-500 text-center mb-4">{msg}</p>}
              <p className="text-center text-sm text-gray-600 mt-0">
                ¿Ya tienes cuenta? <Link to="/login" className="text-blue-600 hover:underline">Inicia Sesión</Link>
              </p>
            </form>
          ) : (
            <div className="w-full max-w-sm mx-auto text-center">
              <div className="flex justify-between mb-6">
                {codigo.map((val, i) => (
                  <input key={i} id={`codigo-${i}`} type="text" value={val} maxLength="1" onChange={(e) => handleCodigoChange(e, i)} className="w-12 h-12 text-center text-lg border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" />
                ))}
              </div>
              {msg && <p className="text-red-500 text-center mb-4">{msg}</p>}
              <div className="flex justify-center">
                <button type="button" onClick={async () => {
                  try {
                    const res = await fetch("http://localhost:3000/api/empresas/resend-code", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ correo_contacto: form.correo_contacto }),
                    });
                    const data = await res.json();
                    if (!res.ok) setMsg(data.error || "Error reenviando código");
                    else {
                      setMsg("Se ha enviado un nuevo código a tu correo");
                      setCodigo(Array(6).fill(""));
                    }
                  } catch (error) {
                    setMsg("Error de conexión con el servidor");
                  }
                }} className="bg-[#2E3A59] text-white px-6 py-2 rounded-full font-semibold hover:bg-[#1f2a40] transition">
                  Reenviar código
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-1/2 p-4 rounded-r-2xl flex">
          <img src={step === 1 ? registerImage : verifyImage} alt="Panel derecho" className="object-contain w-full h-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}
