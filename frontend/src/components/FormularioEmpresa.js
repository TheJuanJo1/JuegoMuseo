import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Logo from "../assets/Logo.svg";
import Fluxdata from "../assets/fluxdata2.svg";
import { API_URL } from "../config";

export default function FormularioEmpresa({ usuarioId }) {
  const navigate = useNavigate();
  // Dentro del useState inicial, agregamos los campos para NC y ND
  const [form, setForm] = useState({
  direccion_empresa: "",
  prefijo_numeracion: "",
  numero_inicial: "",      // Para Facturas
  numero_final: "",        // Para Facturas
  nc_numero_inicial: "",   // Para Notas de Crédito
  nc_numero_final: "",     // Para Notas de Crédito
  nd_numero_inicial: "",   // Para Notas de Débito
  nd_numero_final: "",     // Para Notas de Débito
  regimen_tributario: "",
  certificado_firma: null,
  contrasena_cert: "",
  token_api: "",
  fecha_expiracion: "",
});

  useEffect(() => {
    const verificarEstado = async () => {
      try {
        const res = await fetch(`${API_URL}/api/configuracion/estado/${usuarioId}`);
        const data = await res.json();
        if (data.completado) {
          navigate("/dashboard"); 
        }
      } catch (error) {
        console.error("Error al verificar configuración:", error);
      }
    };
    verificarEstado();
  }, [usuarioId, navigate]);
  useEffect(() => {
    const obtenerToken = async () => {
      try {
        const res = await fetch(`${API_URL}/api/token/${usuarioId}`);
        const data = await res.json();
        if (res.ok && data.token) {
          setForm((prev) => ({ ...prev, token_api: data.token }));
        }
      } catch (error) {
        console.error("Error obteniendo token:", error);
      }
    };
    obtenerToken();
  }, [usuarioId]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm({ ...form, [name]: files ? files[0] : value });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
      // Validación de rangos
  const camposNumericos = [
    { nombre: "Factura", inicio: form.numero_inicial, fin: form.numero_final },
    { nombre: "NC", inicio: form.nc_numero_inicial, fin: form.nc_numero_final },
    { nombre: "ND", inicio: form.nd_numero_inicial, fin: form.nd_numero_final },
  ];

  for (let campo of camposNumericos) {
    const inicio = parseInt(campo.inicio);
    const fin = parseInt(campo.fin);

    if (isNaN(inicio) || isNaN(fin)) {
      alert(`Los números de ${campo.nombre} deben ser válidos.`);
      return;
    }
    if (inicio < 1 || fin < 1) {
      alert(`Los números de ${campo.nombre} deben ser 1 o mayores.`);
      return;
    }
    if (fin < inicio) {
      alert(`El número final de ${campo.nombre} debe ser mayor o igual al número inicial.`);
      return;
    }
  }
    const data = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) {
        data.append(key, form[key]);
      }
    });
    data.append("prefijo_numeracion", "FE");
    data.append("tipo_documento", "Factura");
    data.append("id_usuario", usuarioId);
    try {
      const res = await fetch(`${API_URL}/api/configuracion`, {
        method: "POST",
        body: data,
      });
      if (res.ok) {
        navigate("/dashboard"); 
      } else {
        const errorData = await res.json();
        alert("Error al guardar la configuración: " + (errorData.error || "Desconocido"));
      }
    } catch (error) {
      console.error("Error al enviar formulario:", error);
      alert("Error al enviar el formulario");
    }
  };

   return (
    <div className="flex min-h-screen items-center justify-center bg-[#EAF0F6]">
      <div className="flex rounded-2xl overflow-hidden w-[1250px] h-[780px] bg-white shadow-xl">
        <div className="w-2/5 bg-[#27374D] flex flex-col items-center justify-start text-white p-8">
        <div className="flex flex-row items-center justify-center space-x-10 mb-10 mt-8">
          <img src={Logo} className="w-20" alt="Logo principal" />
          <img src={Fluxdata} className="w-32" alt="Fluxdata" />
        </div>
        <h2 className="text-xl font-semibold mb-3 mt-20">¡Ya casi terminamos!</h2>
        <p className="text-center text-sm leading-relaxed mt-10">Para continuar por favor rellena el siguiente formulario para obtener los últimos datos necesarios para empezar con la facturación</p>
        </div>
        <div className="w-3/5 p-12 bg-white relative flex flex-col">
        <h2 className="text-2xl font-bold mb-6 text-center">Formulario registro empresa</h2>
          <div className="flex-1 overflow-y-auto pr-2 scrollbar-thin">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="block mb-1">Dirección de la empresa</label>
                <input
                  type="text"
                  name="direccion_empresa"
                  placeholder="Ingrese su dirección"
                  className="w-full border rounded px-3 py-2"
                  onChange={handleChange}
                  required/>
              </div>
              <div>
                <label className="block mb-1">Prefijo numeración</label>
                <input type="text"
                name="prefijo_numeracion"
                value={form.prefijo_numeracion}
                onChange={handleChange}
                maxLength={4}
                pattern="[A-Z]{1,4}"
                placeholder="Ej: FAC"
                className="w-full border rounded px-3 py-2"/>
              </div>
              <div className="flex space-x-4">
                <div className="w-1/2">
                  <label className="block mb-1">Número inicial</label>
                  <input
                    type="number"
                    name="numero_inicial"
                    placeholder="Número inicial"
                    className="w-full border rounded px-3 py-2"
                    onChange={handleChange}
                    required/>
                </div>
                <div className="w-1/2">
                  <label className="block mb-1">Número final</label>
                  <input
                    type="number"
                    name="numero_final"
                    placeholder="Número final"
                    className="w-full border rounded px-3 py-2"
                    onChange={handleChange}
                    required/>
                </div>
              </div>
              <div className="mt-4">
                <h3 className="text-lg font-semibold mb-2">Rango Notas de Crédito (NC)</h3>
                <div className="flex space-x-4">
                  <div className="w-1/2">
                  <label className="block mb-1">Número inicial NC</label>
                  <input type="number" name="nc_numero_inicial" placeholder="Número inicial" className="w-full border rounded px-3 py-2"
                  onChange={handleChange}required/>
    </div>
    <div className="w-1/2">
      <label className="block mb-1">Número final NC</label>
      <input
        type="number"
        name="nc_numero_final"
        placeholder="Número final"
        className="w-full border rounded px-3 py-2"
        onChange={handleChange}
        required
      />
    </div>
  </div>
</div>

{/* Rango Notas de Débito */}
<div className="mt-4">
  <h3 className="text-lg font-semibold mb-2">Rango Notas de Débito (ND)</h3>
  <div className="flex space-x-4">
    <div className="w-1/2">
      <label className="block mb-1">Número inicial ND</label>
      <input
        type="number"
        name="nd_numero_inicial"
        placeholder="Número inicial"
        className="w-full border rounded px-3 py-2"
        onChange={handleChange}
        required
      />
    </div>
    <div className="w-1/2">
      <label className="block mb-1">Número final ND</label>
      <input
        type="number"
        name="nd_numero_final"
        placeholder="Número final"
        className="w-full border rounded px-3 py-2"
        onChange={handleChange}
        required
      />
    </div>
  </div>
</div>

              <div>
                <label className="block mb-1">Régimen tributario</label>
                <select
                  name="regimen_tributario"
                  className="w-full border rounded px-3 py-2"
                  onChange={handleChange}
                  required>
                  <option value="">Seleccione régimen</option>
                  <option value="simplificado">Común</option>
                  <option value="común">Simplificado</option>
                  <option value="especial">Especial</option>
                </select>
              </div>
              <div>
                <label className="block mb-1">Certificado firma digital</label>
                <input
                  type="file"
                  name="certificado_firma"
                  className="w-full border rounded px-3 py-2"
                  onChange={handleChange}
                  required/>
              </div>
              <div>
                <label className="block mb-1">Contraseña certificado</label>
                <input
                  type="password"
                  name="contrasena_cert"
                  placeholder="Ingrese contraseña"
                  className="w-full border rounded px-3 py-2"
                  onChange={handleChange}
                  required/>
              </div>
              <div>
                <label className="block mb-1">Token API</label>
                <input
                  type="text"
                  name="token_api"
                  value={form.token_api} 
                  readOnly className="w-full border rounded px-3 py-2 bg-gray-100 cursor-not-allowed"/>
              </div>
              <div>
                <label className="block mb-1">Fecha de expiración certificado</label>
                <input
                  type="date"
                  name="fecha_expiracion"
                  className="w-full border rounded px-3 py-2"
                  onChange={handleChange}
                  required/>
              </div>
              <button type="submit" className="w-full bg-[#27374D] text-white py-3 rounded mt-4">
                Siguiente
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}