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
        // CORREÇÃO: Mudamos de 'capiba_balance' para 'balance'
        const result = await pool.query('SELECT balance FROM users WHERE user_id = $1', [userId]);
        
        if (result.rows.length === 0) {
            return res.json({ balance: 0 });
        }
        
        res.json({ balance: result.rows[0].balance });
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

// NOVO: Rota para buscar desafios com progresso real
router.get('/users/:userId/challenges', async (req, res) => {
    try {
        const { userId } = req.params;

        // 1. Buscar dados do usuário (Streak e Total KM)
        const userRes = await pool.query('SELECT streak_count, total_km FROM users WHERE user_id = $1', [userId]);
        
        if (userRes.rows.length === 0) return res.json([]); // Usuário não encontrado

        const userStats = userRes.rows[0];
        const currentStreak = userStats.streak_count || 0;
        const currentKm = parseFloat(userStats.total_km) || 0;

        // 2. Buscar lista de desafios
        const challengesRes = await pool.query('SELECT * FROM challenges ORDER BY id ASC');

        // 3. Mapear e calcular progresso para cada um
        const data = challengesRes.rows.map(challenge => {
            let currentProgress = 0;

            if (challenge.type === 'streak') {
                currentProgress = currentStreak;
            } else if (challenge.type === 'distance') {
                currentProgress = currentKm;
            }

            return {
                id: challenge.id,
                title: challenge.title,
                reward: challenge.reward_amount,
                type: challenge.type,
                target: challenge.target_value,
                current: currentProgress // Valor real do banco!
            };
        });

        res.json(data);

    } catch (error) {
        console.error("Erro ao buscar desafios:", error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// Rota para o Extrato (Histórico de Transações)
// Rota para o Extrato (Histórico de Transações)
router.get('/users/:userId/transactions', async (req, res) => {
    try {
        const { userId } = req.params;

        // Buscamos as colunas exatas que vimos no seu print
        const query = `
            SELECT 
                transaction_id, 
                amount_capiba, 
                activity_type, 
                activity_details, 
                created_at,
                date_time 
            FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC 
            LIMIT 50
        `;
        
        const result = await pool.query(query, [userId]);
        res.json(result.rows);

    } catch (error) {
        console.error("Erro ao buscar extrato:", error);
        res.status(500).json({ error: "Erro interno ao buscar extrato." });
    }
});

// --- ROTA DE CADASTRO ATUALIZADA ---
router.post('/auth/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const check = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        if (check.rows.length > 0) return res.status(400).json({ error: "Email já cadastrado." });

        // AQUI ESTÁ O SEGREDO: Forçamos first_login = true
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



// --- NOVA ROTA: CONCLUIR ONBOARDING ---
// O Frontend chama isso quando o usuário termina os slides/desafio inicial
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

// --- ROTA DE LOGIN ATUALIZADA ---
router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        // Buscamos o first_login junto
        const result = await pool.query('SELECT user_id, name, email, password, first_login, welcome_challenge_completed FROM users WHERE email = $1', [email]);
        
        if (result.rows.length === 0) return res.status(400).json({ error: "Usuário não encontrado." });
        const user = result.rows[0];

        if (user.password !== password) return res.status(401).json({ error: "Senha incorreta." });

        res.json({
            user_id: user.user_id,
            name: user.name,
            email: user.email,
            first_login: user.first_login, // Envia para o frontend decidir a rota
            welcome_challenge_completed: user.welcome_challenge_completed
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro no servidor." });
    }
});

// --- ROTA DE PERFIL ---

// Atualizar dados do usuário (Nome, Meta, etc)
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
        console.error("Erro ao atualizar perfil:", error);
        res.status(500).json({ error: "Erro interno." });
    }
});

// Pegar dados completos do perfil (incluindo totais)
router.get('/users/:userId/profile', async (req, res) => {
    const { userId } = req.params;
    try {
        const userRes = await pool.query('SELECT name, email, daily_goal, total_km, streak_count, balance FROM users WHERE user_id = $1', [userId]);
        res.json(userRes.rows[0]);
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar perfil." });
    }
});


export default router;