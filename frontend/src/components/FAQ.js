import { useState } from "react";
import { useNavigate } from "react-router-dom";
import backArrow from "../assets/back-arrow.svg";
import Logo1 from "../assets/Logo1.svg";
import V2 from "../assets/V2.png";

export default function FAQ() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const toggle = (i) => setOpen(open === i ? null : i);

  const preguntas = [
    {
      pregunta: "¿Qué documentos maneja?",
      respuesta:
        "Invoice (factura), CreditNote (nota crédito), DebitNote (nota débito), ApplicationResponse (respuesta de la DIAN) y AttachedDocument (documentos anexos).",
    },
    { pregunta: "¿Qué tecnologías se usan?", respuesta: "Node.js, React, PostgreSQL y Prisma." },
    {
      pregunta: "¿Qué funcionalidades principales tiene?",
      respuesta:
        "Gestión de facturas electrónicas, recepción, validación, envío y almacenamiento.",
    },
    { pregunta: "¿Cómo se almacenan los documentos?", respuesta: "En bases de datos PostgreSQL." },
  ];

  return (
    <div className="w-full min-h-screen bg-[#E8EEF2] flex items-center justify-center">
      <div
        className="relative bg-white rounded-xl shadow-xl"
        style={{
          width: "90%",                
          maxWidth: "1200px",          
          height: "90vh",              
          overflow: "hidden",          
        }}>
        <img
          src={backArrow}
          alt="Volver"
          className="absolute top-6 left-6 cursor-pointer hover:scale-110 transition-all"
          style={{ height: "41px", width: "41px", objectFit: "contain", }}
          onClick={() => navigate("/")}/>
        <div style={{ position: "absolute", top: "7rem", left: "4.8rem" }}>
            <h1 className="font-bold text-[50px] text-black leading-[3.3rem]">
                Preguntas
            </h1>
            <h1 className="font-bold text-[50px]"
            style={{ color: "#526D82", lineHeight: "3.3rem" }}>
                frecuentes
            </h1>
        </div>
        <div style={{ position: "absolute", top: "15rem", left: "8rem", }}>
          <img src={Logo1} alt="Logo FluxData" style={{
            height: "160px", width: "auto",}}/>
          </div>
        <div style={{ position: "absolute", top: "12rem", right: "9rem", width: "35%" }}>
          {preguntas.map((item, i) => (
            <div key={i} style={{ paddingBottom: 16 }}>
              <div
                onClick={() => toggle(i)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid #e6edf2",
                  paddingBottom: 12,
                  cursor: "pointer",
                }}>
                <span style={{ fontSize: "1.03rem", color: "#1f2937" }}>{item.pregunta}</span>
                <span style={{ fontSize: "1.5rem", marginLeft: 24 }}>{open === i ? "−" : "+"}</span>
              </div>
              {open === i && (
                <p style={{ color: "#475569", marginTop: 7, fontSize: "0.95rem" }}>{item.respuesta}</p>
              )}
            </div>
          ))}
        </div>
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            bottom: 0,
            left: 0,
            width: "100%",
            height: "250px",
            overflow: "hidden",
          }}>
          <img
            src={V2}
            alt="Olas"
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover", 
              display: "block",
            }}/>
        </div>
      </div>
    </div>
  );
}