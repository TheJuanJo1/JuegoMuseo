export default function Dashboard() {
  const user = localStorage.getItem("token");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-6 rounded-2xl shadow-md w-96 text-center">
        <h1 className="text-2xl font-bold mb-4">Bienvenido a FluxData 🚀</h1>
        <p className="mb-3">Has iniciado sesión correctamente.</p>
        <p className="text-sm text-gray-600 break-all">
          <strong>Token:</strong> {user}
        </p>
      </div>
    </div>
  );
}
