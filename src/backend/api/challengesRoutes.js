// src/backend/api/challengesRoutes.js

import express from "express";
import { claimWelcomeBonus } from "../services/WelcomeBonusService.js";

const router = express.Router();

/**
 * POST /challenges/welcome
 * ------------------------
 * Rota da HU4 — Desafio de Boas-Vindas.
 * Valida se o usuário pode receber o bônus e aciona o WelcomeBonusService.
 */
router.post("/welcome", async (req, res) => {
    try {
        const { userId } = req.body;

        if (!userId) {
            return res.status(400).json({
                success: false,
                error: "O campo userId é obrigatório."
            });
        }

        const result = await claimWelcomeBonus(userId);

        return res.status(result.code).json(result);

    } catch (err) {
        console.error("Erro no endpoint /challenges/welcome:", err);
        return res.status(500).json({
            success: false,
            error: "Erro interno ao processar o desafio de boas-vindas."
        });
    }
});

export default router;
