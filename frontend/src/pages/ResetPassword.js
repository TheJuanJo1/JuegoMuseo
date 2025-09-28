import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    try {
      const res = await fetch("http://localhost:3000/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al restablecer contraseña");
        return;
      }

      setMessage("Contraseña restablecida con éxito. Redirigiendo...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError("Error de conexión con el servidor.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#EAF0F6] font-[Work Sans]">
      <div className="bg-white shadow-xl rounded-2xl p-10 w-[400px]">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Restablecer contraseña
        </h1>
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
            type="password"
            placeholder="Nueva contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 mb-4 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
          <button
            type="submit"
            className="w-full bg-[#2E3A59] text-white py-3 rounded-full font-semibold hover:bg-[#1f2a40] transition"
          >
            Guardar contraseña
          </button>
        </form>
      </div>
    </div>
  );
}
