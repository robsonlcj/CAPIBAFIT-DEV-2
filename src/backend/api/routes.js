import express from 'express';
// Ajuste de caminho: agora services e database estão irmãos de 'api', então usamos apenas '../'
import { pool } from '../database/db_connection.js'; 
import StreakService from '../services/StreakService.js';
import ActivityController from '../controllers/ActivityController.js'; 
import { WelcomeBonusService } from '../services/WelcomeBonusService.js';

const router = express.Router();

// ==================================================================
// 🔐 AUTENTICAÇÃO E ONBOARDING
// ==================================================================

router.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ error: "Email já cadastrado." });

        const result = await pool.query(
            `INSERT INTO users (name, email, password, balance, streak_count, total_km, daily_goal, first_login, welcome_challenge_completed) 
             VALUES ($1, $2, $3, 0, 0, 0, 5000, true, 'N') 
             RETURNING user_id, name, email, first_login`,
            [name, email, password]
        );
        res.json(result.rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao cadastrar." });
    }
});

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT user_id, name, email, password, first_login, welcome_challenge_completed FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(400).json({ error: "Usuário não encontrado." });
        const user = result.rows[0];

        if (user.password !== password) return res.status(401).json({ error: "Senha incorreta." });

        res.json({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            first_login: user.first_login,
            welcome_challenge_completed: user.welcome_challenge_completed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

router.post('/users/:userId/complete-onboarding', async (req, res) => {
    const { userId } = req.params;
    try {
        await pool.query(
            "UPDATE users SET first_login = false, welcome_challenge_completed = 'S' WHERE user_id = $1", 
            [userId]
        );
        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar status." });
    }
});

// ==================================================================
// 🗺️ PONTOS TURÍSTICOS (ADICIONADO AGORA!)
// ==================================================================
router.get('/tourist-spots', async (req, res) => {
    console.log("📥 [API] Recebi pedido de /tourist-spots"); // Log para debug
    try {
        const result = await pool.query('SELECT * FROM tourist_spots');
        console.log(`✅ [API] Encontrados ${result.rows.length} pontos.`);
        res.json(result.rows);
    } catch (error) {
        console.error("❌ [API] Erro ao buscar pontos:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// ==================================================================
// 🏃 ATIVIDADES E GAMIFICAÇÃO
// ==================================================================

// Finalizar Atividade (Com Bônus Turístico)
router.post('/activity/finish', ActivityController.finishActivity);

// Registrar Atividade Genérica (Streak)
router.post('/users/:userId/activity', async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await StreakService.registerActivity(userId);
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

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
        const result = await pool.query(querySql, [userId, today, steps || 0]);
        res.json({ message: "Sincronizado!", data: result.rows[0] });
    } catch (error) {
        console.error("Erro sync:", error);
        res.status(500).json({ error: "Erro interno no servidor" });
    }
});

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

// ==================================================================
// 👤 USUÁRIOS E PERFIL
// ==================================================================

router.get('/users/:userId/profile', async (req, res) => {
    const { userId } = req.params;
    try {
        const userRes = await pool.query('SELECT name, email, daily_goal, total_km, streak_count, balance FROM users WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
        res.json(userRes.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar perfil." });
    }
});

router.put('/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { name, daily_goal } = req.body;
    try {
        const result = await pool.query(
            'UPDATE users SET name = $1, daily_goal = $2 WHERE user_id = $3 RETURNING name, email, daily_goal',
            [name, daily_goal, userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: "Usuário não encontrado" });
        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Erro interno." });
    }
});

router.get('/users/:userId/balance', async (req, res) => {
    const { userId } = req.params;
    try {
        const result = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
        if (result.rows.length === 0) return res.json({ balance: 0 });
        res.json({ balance: result.rows[0].balance });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar saldo" });
    }
});

router.get('/users/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;
        const status = await StreakService.getStreakStatus(userId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
    }
});

router.get('/users/:userId/transactions', async (req, res) => {
    try {
        const { userId } = req.params;
        const query = `
            SELECT transaction_id, amount_capiba, activity_type, activity_details, created_at, date_time 
            FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC LIMIT 50
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: "Erro interno ao buscar extrato." });
    }
});

// ==================================================================
// 🏆 DESAFIOS
// ==================================================================

router.get('/users/:userId/challenges', async (req, res) => {
    try {
        const { userId } = req.params;
        const userRes = await pool.query('SELECT streak_count, total_km FROM users WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) return res.json([]);

        const userStats = userRes.rows[0];
        const currentStreak = userStats.streak_count || 0;
        const currentKm = parseFloat(userStats.total_km) || 0;

        const challengesRes = await pool.query('SELECT * FROM challenges ORDER BY id ASC');

        const data = challengesRes.rows.map(challenge => {
            let currentProgress = 0;
            if (challenge.type === 'streak') currentProgress = currentStreak;
            else if (challenge.type === 'distance') currentProgress = currentKm;

            return {
                id: challenge.id,
                title: challenge.title,
                reward: challenge.reward_amount,
                type: challenge.type,
                target: challenge.target_value,
                current: currentProgress
            };
        });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
    }
});

router.post('/challenges/welcome', async (req, res) => {
    const id = req.body.userId || req.body.user_id;
    if (!id) return res.status(400).json({ error: "ID obrigatório" });

    try {
        const result = await WelcomeBonusService.execute(id);
        res.json(result);
    } catch (error) {
        res.status(error.status || 500).json({ error: error.message });
    }
});

export default router;