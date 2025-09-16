import { useState } from "react";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al enviar enlace");
        return;
      }

      setMessage("Se ha enviado un enlace de recuperación a tu correo.");
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans]">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[400px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Recuperar contraseña
        </h1>
        <p className="text-gray-600 text-sm mb-6">
          Ingresa tu correo y te enviaremos un enlace para restablecer tu
          contraseña.
        </p>

        {error && (
          <div className="bg-red-100 text-red-600 p-2 mb-3 rounded text-sm">
            {error}
          </div>
        )}
        {message && (
          <div className="bg-green-100 text-green-600 p-2 mb-3 rounded text-sm">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          <button
            type="submit"
            className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition"
          >
            Enviar enlace
          </button>
        </form>
      </div>
    </div>
  );
}
