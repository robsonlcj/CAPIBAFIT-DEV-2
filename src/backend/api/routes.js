import express from 'express';
// CORREÇÃO 3: Importar { pool } ao invés de { query }
import { pool } from '../database/db_connection.js';
import StreakService from '../services/StreakService.js';

const router = express.Router();

// --- ROTA DE SINCRONIZAÇÃO (ATIVIDADES) ---
router.post('/activities/sync', async (req, res) => {
    const { userId, steps } = req.body;
    if (!userId) return res.status(400).json({ error: "userId obrigatório" });

    try {
        const today = new Date().toISOString().split('T')[0];
        const querySql = `
            INSERT INTO user_progress (user_id, date, steps_count)
            VALUES ($1, $2, $3)
            ON CONFLICT (user_id, date) 
            DO UPDATE SET steps_count = user_progress.steps_count + $3
            RETURNING *;
        `;
        // CORREÇÃO: pool.query
        const result = await pool.query(querySql, [userId, today, steps || 0]);
        res.json({ message: "Sincronizado!", data: result.rows[0] });
    } catch (error) {
        console.error("Erro sync:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

// --- ROTA DE SALDO (BALANCE) ---
router.get('/users/:userId/balance', async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = "SELECT COALESCE(capiba_balance, 0) as total FROM users WHERE user_id = $1";
        const { rows } = await pool.query(sql, [userId]);
        
        if (rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
        
        res.json({ balance: rows[0].total });
    } catch (error) {
        console.error("Erro saldo:", error);
        res.status(500).json({ error: "Erro ao buscar saldo" });
    }
});

// --- ROTA WELCOME ---
router.post('/challenges/welcome', async (req, res) => {
    const id = req.body.userId || req.body.user_id;
    if (!id) return res.status(400).json({ error: "ID obrigatório" });

    try {
        await pool.query("UPDATE users SET welcome_challenge_completed = 'S' WHERE user_id = $1", [id]);
        res.json({ message: "Desafio aceito!" });
    } catch (error) {
        console.error("Erro welcome:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// --- ROTA USERS ME ---
router.get('/users/me', async (req, res) => {
    const { userId } = req.query;
    if (!userId) return res.status(400).json({ error: "userId obrigatório" });

    try {
        const { rows } = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
        if (rows.length > 0) res.json(rows[0]);
        else res.status(404).json({ error: "Não encontrado" });
    } catch (error) {
        console.error("Erro user:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// --- ROTA TRANSAÇÕES (Extrato) ---
router.get('/users/:userId/transactions', async (req, res) => {
    const { userId } = req.params;
    try {
        const sql = "SELECT * FROM transactions WHERE user_id = $1 ORDER BY date_time DESC LIMIT 20";
        const { rows } = await pool.query(sql, [userId]);
        res.json({ transactions: rows });
    } catch (error) {
        console.error("Erro extrato:", error);
        res.status(500).json({ error: "Erro ao buscar extrato" });
    }
});

// --- ROTA PROGRESSO DIÁRIO ---
router.get('/activities/progress/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const today = new Date().toISOString().split('T')[0];
        const { rows } = await pool.query(
            "SELECT steps_count, daily_goal FROM user_progress WHERE user_id = $1 AND date = $2", 
            [userId, today]
        );
        if (rows.length > 0) res.json(rows[0]);
        else res.json({ steps_count: 0, daily_goal: 5000 });
    } catch (error) {
        console.error("Erro progresso:", error);
        res.status(500).json({ error: "Erro ao buscar progresso" });
    }
});

// --- ROTA PATCH USER ---
router.patch('/users/:user_id', async (req, res) => {
    const { user_id } = req.params;
    const { first_login } = req.body;
    try {
        if (first_login !== undefined) {
             await pool.query('UPDATE users SET first_login = $1 WHERE user_id = $2', [first_login, user_id]);
        }
        res.json({ message: "Atualizado" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro update" });
    }
});

// Task 3: Endpoint GET /users/:userId/streak
router.get('/users/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;
        const status = await StreakService.getStreakStatus(userId);
        res.json(status);
    } catch (error) {
        console.error("Erro ao buscar streak:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

router.post('/users/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await StreakService.registerActivity(userId);
        res.json(result);
    } catch (error) {
        console.error("Erro ao registrar atividade:", error);
        res.status(500).json({ error: error.message });
    }
});

// Endpoint opcional para testar a "atividade" manualmente (útil para dev)
router.post('/users/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await StreakService.registerActivity(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/users/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await StreakService.registerActivity(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.get('/users/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;
        const status = await StreakService.getStreakStatus(userId); // Agora vai funcionar
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
    }
});


export default router;