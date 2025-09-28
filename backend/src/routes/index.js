import { Router } from "express";

import authRoutes from "./auth.routes.js";
import clientesRoutes from "./clientes.routes.js";
import empresasRoutes from "./empresas.routes.js";
import forgotPasswordRoutes from "./forgotPassword.routes.js";
import loginRoutes from "./login.routes.js";
import resetPasswordRoutes from "./resetPassword.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/clientes", clientesRoutes);
router.use("/empresas", empresasRoutes);
router.use("/forgot-password", forgotPasswordRoutes);
router.use("/login", loginRoutes);
router.use("/reset-password", resetPasswordRoutes);

export default router;