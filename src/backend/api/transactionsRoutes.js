// src/backend/api/transactionsRoutes.js
import express from "express";
import { query } from "../database/db_connection.js";

const router = express.Router();

// GET /users/:userId/transactions
router.get("/:userId/transactions", async (req, res) => {
    const { userId } = req.params;

    const sqlQuery = `
        SELECT 
            amount_capiba AS valor,
            date_time AS data,
            activity_type AS origem,
            activity_details AS detalhes
        FROM transactions
        WHERE user_id = $1
        ORDER BY date_time DESC
        LIMIT 20;
    `;

    try {
        const { rows } = await query(sqlQuery, [userId]);
        return res.status(200).json({ transactions: rows });
    } catch (err) {
        console.error("Erro ao buscar transações:", err);
        return res.status(500).json({ error: "Erro interno ao buscar extrato." });
    }
});

export default router;
