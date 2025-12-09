import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import fluxLogo from "../assets/fluxdata.svg";
import backArrow from "../assets/back-arrow.svg";
import registerImage from "../assets/register.webp"; 
import verifyImage from "../assets/im4.webp";
import im3 from "../assets/im5.webp";
import im2 from "../assets/im2.webp";
import eye from "../assets/eye.svg";
import eye2 from "../assets/eye2.svg";
import LoadingScreen from "./LoadingScreen";

import { API_URL } from "../config.js";

export default function RegisterForm() {
  const [form, setForm] = useState({
    nombre_empresa: "",
    direccion_empresa: "", 
    nit_empresa: "",
    regimen_tributario: "",
    correo_contacto: "",
    contrasena: "",
    confirmar_contrasena: "",  
    
  });

  const [msg, setMsg] = useState("");
  const [msgCodigo, setMsgCodigo] = useState("");
  const [step, setStep] = useState(1);
  const [codigo, setCodigo] = useState(Array(6).fill(""));
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const location = useLocation(); 
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleCodigoChange = async (e, index) => {
    const value = e.target.value.slice(-1);
    const newCodigo = [...codigo];
    newCodigo[index] = value;
    setCodigo(newCodigo);

    if (value && index < 5){document.getElementById(`codigo-${index + 1}`).focus();
  }
    if (newCodigo.join("").length === 6) {await handleVerify(newCodigo.join(""));
}
  };
  const handleSubmit = async (e) => {
  e.preventDefault();
  setMsg("");
  setMsgCodigo("");

  const { nombre_empresa, direccion_empresa, nit_empresa, regimen_tributario, correo_contacto, contrasena, confirmar_contrasena } = form;

  if (!nombre_empresa && !direccion_empresa && !nit_empresa && !regimen_tributario && !correo_contacto && !contrasena && !confirmar_contrasena) {
    setMsg("Todos los campos son requeridos");
    return;
  }

  // Validación específica
  if (!nombre_empresa.trim()) {
    setMsg("El nombre de la empresa es obligatorio");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!direccion_empresa.trim()) {
    setMsg("La dirección de la empresa es obligatoria");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!regimen_tributario.trim()) {
    setMsg("El régimen tributario es obligatorio");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!nit_empresa.trim()) {
    setMsg("El NIT es obligatorio");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!/^\d{10}$/.test(nit_empresa)) {
    setMsg("El NIT debe tener 10 dígitos numéricos");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!correo_contacto.trim()) {
    setMsg("El correo de contacto es obligatorio");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!contrasena.trim()) {
    setMsg("La contraseña es obligatoria");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (contrasena.length < 6) {
    setMsg("La contraseña debe tener al menos 6 caracteres");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (!confirmar_contrasena.trim()) {
    setMsg("Debes confirmar la contraseña");
    setTimeout(() => setMsg(""), 2000);
    return;
  }

  if (contrasena !== confirmar_contrasena) {
    setMsg("Las contraseñas no coinciden");
    setTimeout(() => setMsg(""), 1000);
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
  if (data.errors) {
      const mensajes = Object.values(data.errors).join("\n");
      setMsg(mensajes);
    } else {
      setMsg(data.error || "Error en el registro");
    }
    setTimeout(() => setMsg(""), 3000);
    return;
  }

    setStep(2);
  } catch (error) {
    setMsg("Error de conexión con el servidor");
    setTimeout(() => setMsg(""), 2000);
  }
};

  const [showPassword, setShowPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleVerify = async (codigoCompleto) => {
  setMsgCodigo("");
  setLoading(true);

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
      setTimeout(() => setMsgCodigo(""), 2000);
      setLoading(false);
      return;
    }

    // Aquí mantenemos el loading unos milisegundos extra para que se vea
    setTimeout(() => {
      setLoading(false);
      if (location.state?.fromInicio) {
        navigate("/", { replace: true, state: { msgRegistro: "Empresa registrada exitosamente" } });
      } else {
        navigate("/login", { state: { msgRegistro: "Empresa registrada exitosamente" } });
      }
    }, 1700); // 500ms de carga extra para animación

  } catch (error) {
    setMsgCodigo("Error de conexión con el servidor");
    setTimeout(() => setMsgCodigo(""), 2000);
    setLoading(false);
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

            {loading && <LoadingScreen />}
            {(msg || msgCodigo) && (
  <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none">
    <div className="absolute inset-0 bg-black bg-opacity-20"></div>
    <div className="relative bg-white rounded-xl px-6 py-4 max-w-sm w-full text-center font-[Work Sans] shadow-lg pointer-events-auto">
      <p className="text-black font-semibold">{msg || msgCodigo}</p>
    </div>
  </div>
)}
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
                  onClick={() => {setMsg("");
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
              <img src={backArrow} alt="Volver" className="h-6 cursor-pointer"
              onClick={() => {
                setMsg("");
                setMsgCodigo("");
                setCodigo(Array(6).fill(""));
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Hola Usuario</h1>
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
  <input
    type="text"
    name="nombre_empresa"
    placeholder="Nombre de Empresa"
    value={form.nombre_empresa}
    onChange={handleChange}
    className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
  />
  <input
    type="text"
    name="direccion_empresa"
    placeholder="Dirección de la empresa"
    value={form.direccion_empresa}
    onChange={handleChange}
    className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
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
    className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
  />

  <select
    name="regimen_tributario"
    value={form.regimen_tributario}
    onChange={handleChange}
   className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
  >
    <option value="">Seleccione Régimen Tributario</option>
    <option value="común">Común</option>
    <option value="simplificado">Simplificado</option>
    <option value="especial">Especial</option>
  </select>


  <input
    type="email"
    name="correo_contacto"
    placeholder="Correo Electrónico"
    value={form.correo_contacto}
    onChange={handleChange}
    className="w-full p-2 mb-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm"
  />
  <div className="relative w-full mb-3">
  <input
    type={showPassword ? "text" : "password"}
    name="contrasena"
    placeholder="Contraseña"
    value={form.contrasena}
    onChange={handleChange}
    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 text-sm"
  />
  <img
    src={showPassword ? eye : eye2}
    alt={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer"
    onClick={() => setShowPassword(!showPassword)}
  />
</div>

<div className="relative w-full mb-3">
  <input
    type={showConfirmPassword ? "text" : "password"}
    name="confirmar_contrasena"
    placeholder="Confirmar Contraseña"
    value={form.confirmar_contrasena}
    onChange={handleChange}
    className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 pr-10 text-sm"
  />
  <img
    src={showConfirmPassword ? eye : eye2}
    alt={showConfirmPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
    className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 cursor-pointer"
    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
  />
</div>


  <button
    type="submit"
    className="w-full bg-[#2E3A59] text-white py-2 rounded-full font-semibold hover:bg-[#1f2a40] transition mb-4"
  >
    Registrarse
  </button>
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
              <div className="flex justify-center">
                <button type="button" onClick={async () => {
                  try {
                    const res = await fetch(`${API_URL}/api/empresas/resend-code`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ correo_contacto: form.correo_contacto }),
                    });
                    const data = await res.json();
                    if (!res.ok) setMsgCodigo(data.error || "Error reenviando código");
                    else {
                      setMsgCodigo("Se ha enviado un nuevo código a tu correo");
                      setCodigo(Array(6).fill(""));
                      setTimeout(() => setMsgCodigo(""), 2000);
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
