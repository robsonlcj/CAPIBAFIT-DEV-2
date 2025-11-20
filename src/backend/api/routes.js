// src/backend/api/routes.js
import express from "express";

import activityRoutes from "./activityRoutes.js";
import transactionsRoutes from "./transactionsRoutes.js";
import userRoutes from "./userRoutes.js";
import challengesRoutes from "./challengesRoutes.js";

const router = express.Router();

// Registrar módulos de rotas
router.use("/activities", activityRoutes);      // /activities/sync
router.use("/users", transactionsRoutes);       // /users/:id/transactions
router.use("/users", userRoutes);               // /users/:id/balance
router.use("/challenges", challengesRoutes);    // /challenges/welcome

export default router;
