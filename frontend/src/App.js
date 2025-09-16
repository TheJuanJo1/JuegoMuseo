import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import RegisterForm from "./components/RegisterForm";
import LoginForm from "./components/LoginForm";
import Dashboard from "./components/Dashboard"; 
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";


function App() {
  const isAuth = localStorage.getItem("token"); // simple check

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginForm />} />
        <Route path="/register" element={<RegisterForm />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/dashboard"
          element={isAuth ? <Dashboard /> : <Navigate to="/login" />}
        />
      </Routes>
    </Router>
  );
}

export default App;



