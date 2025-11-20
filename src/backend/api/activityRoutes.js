// src/backend/api/activityRoutes.js
import express from "express";
import { addActivityToQueue } from "../services/QueueService.js";

const router = express.Router();

// POST /activities/sync
router.post("/sync", async (req, res) => {
    const { userId, distanceKm, timeMinutes, activityType } = req.body;

    if (!userId || !distanceKm || !timeMinutes || !activityType) {
        return res.status(400).json({ error: "Dados de atividade incompletos." });
    }

    try {
        await addActivityToQueue({ userId, distanceKm, timeMinutes, activityType });
        return res.status(202).json({
            message: "Atividade recebida e encaminhada para processamento."
        });
    } catch (error) {
        console.error("Erro ao enfileirar atividade:", error);
        return res.status(500).json({ error: "Erro interno ao enfileirar atividade." });
    }
});

export default router;
