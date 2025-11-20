// src/backend/api/userRoutes.js
import express from "express";
import { query } from "../database/db_connection.js";

const router = express.Router();

// GET /users/:userId/balance
router.get("/:userId/balance", async (req, res) => {
    const { userId } = req.params;

    const sql = `
        SELECT balance
        FROM users
        WHERE id = $1
        LIMIT 1;
    `;

    try {
        const { rows } = await query(sql, [userId]);
        if (!rows.length) return res.status(404).json({ error: "Usuário não encontrado." });
        return res.status(200).json({ balance: rows[0].balance });
    } catch (err) {
        console.error("Erro ao buscar saldo:", err);
        return res.status(500).json({ error: "Erro interno." });
    }
});

export default router;
