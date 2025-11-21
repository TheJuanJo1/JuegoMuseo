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
}
