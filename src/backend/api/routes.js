import express from 'express';
// Ajuste de caminho: agora services e database estão irmãos dee 'api', então usamos apenas '../'
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
// 🗺️ PONTOS TURÍSTICOS
// ==================================================================
router.get('/tourist-spots', async (req, res) => {
    console.log("📥 [API] Recebi pedido de /tourist-spots"); 
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
// 💰 CARTEIRA (NOVO: CORREÇÃO DO ERRO DE INSERT)
// ==================================================================

// Rota Manual para Adicionar Capibas (Use isso para testar o extrato)
router.post('/wallet/add', async (req, res) => {
    const { userId, amount, description, type } = req.body; // type deve ser 'credit' ou 'debit'

    try {
        // 1. Atualiza o saldo do usuário
        await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
            [amount, userId]
        );

        // 2. Insere no histórico (USANDO OS NOMES CERTOS DO BANCO)
        // amount_capiba em vez de balance
        // activity_details em vez de description
        // activity_type em vez de type
        await pool.query(
            `INSERT INTO transactions 
            (user_id, amount_capiba, activity_details, activity_type, created_at) 
            VALUES ($1, $2, $3, $4, NOW())`,
            [userId, amount, description, type || 'credit']
        );

        res.json({ success: true, message: "Transação adicionada com sucesso!" });
    } catch (error) {
        console.error("Erro ao adicionar transação:", error);
        res.status(500).json({ error: "Erro ao processar transação" });
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

// Rota de Extrato (Já estava correta, mas confirmei os campos)
router.get('/users/:userId/transactions', async (req, res) => {
    try {
        const { userId } = req.params;
        // O banco usa 'amount_capiba', 'activity_type' e 'activity_details'. 
        // Sua query aqui já estava certa!
        const query = `
            SELECT transaction_id, amount_capiba, activity_type, activity_details, created_at 
            FROM transactions 
            WHERE user_id = $1 
            ORDER BY created_at DESC LIMIT 50
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro extrato:", error);
        res.status(500).json({ error: "Erro interno ao buscar extrato." });
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

router.get('/users/:userId/streak', async (req, res) => {
    try {
        const { userId } = req.params;
        const status = await StreakService.getStreakStatus(userId);
        res.json(status);
    } catch (error) {
        res.status(500).json({ error: "Erro interno" });
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

router.get('/users/:userId/challenges', async (req, res) => {
    try {
        const { userId } = req.params;
        
        // 1. Busca status do usuário
        const userRes = await pool.query('SELECT streak_count, total_km FROM users WHERE user_id = $1', [userId]);
        if (userRes.rows.length === 0) return res.json([]);
        const userStats = userRes.rows[0];
        
        // 2. Busca desafios e quais já foram completados por esse user
        const challengesRes = await pool.query(`
            SELECT c.*, 
                CASE WHEN ucc.id IS NOT NULL THEN true ELSE false END as claimed
            FROM challenges c
            LEFT JOIN user_claimed_challenges ucc 
                ON c.id = ucc.challenge_id AND ucc.user_id = $1
            ORDER BY c.id ASC
        `, [userId]);

        const data = challengesRes.rows.map(challenge => {
            let currentProgress = 0;
            // Converte string para número para evitar erros de comparação
            const userStreak = parseInt(userStats.streak_count) || 0;
            const userKm = parseFloat(userStats.total_km) || 0;

            if (challenge.type === 'streak') currentProgress = userStreak;
            else if (challenge.type === 'distance') currentProgress = userKm;

            return {
                id: challenge.id,
                title: challenge.title,
                reward: challenge.reward_amount,
                type: challenge.type,
                target: challenge.target_value,
                current: currentProgress,
                claimed: challenge.claimed // Frontend precisa disso para desabilitar o botão
            };
        });
        res.json(data);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro interno" });
    }
});

// NOVA ROTA: Resgatar Recompensa
router.post('/challenges/claim', async (req, res) => {
    const { userId, challengeId } = req.body;

    try {
        // 1. Verificar se já resgatou
        const check = await pool.query(
            'SELECT * FROM user_claimed_challenges WHERE user_id = $1 AND challenge_id = $2',
            [userId, challengeId]
        );
        if (check.rows.length > 0) {
            return res.status(400).json({ error: "Você já resgatou este desafio!" });
        }

        // 2. Buscar dados do desafio e do usuário para validar
        const challengeRes = await pool.query('SELECT * FROM challenges WHERE id = $1', [challengeId]);
        const userRes = await pool.query('SELECT streak_count, total_km FROM users WHERE user_id = $1', [userId]);

        if (challengeRes.rows.length === 0) return res.status(404).json({ error: "Desafio não existe" });
        
        const challenge = challengeRes.rows[0];
        const user = userRes.rows[0];
        let passed = false;

        // 3. Validação de Segurança (Backend não confia no Frontend)
        if (challenge.type === 'streak' && user.streak_count >= challenge.target_value) passed = true;
        if (challenge.type === 'distance' && parseFloat(user.total_km) >= challenge.target_value) passed = true;

        if (!passed) {
            return res.status(400).json({ error: "Você ainda não completou os requisitos." });
        }

        // 4. Se passou: Dá o dinheiro, marca como resgatado e gera extrato
        await pool.query('BEGIN'); // Inicia Transação

        // A. Marca como resgatado
        await pool.query(
            'INSERT INTO user_claimed_challenges (user_id, challenge_id) VALUES ($1, $2)',
            [userId, challengeId]
        );

        // B. Adiciona Saldo
        await pool.query(
            'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
            [challenge.reward_amount, userId]
        );

        // C. Adiciona no Extrato
        await pool.query(
            `INSERT INTO transactions (user_id, amount_capiba, activity_type, activity_details, created_at) 
             VALUES ($1, $2, 'challenge', $3, NOW())`,
            [userId, challenge.reward_amount, `Desafio Completo: ${challenge.title}`]
        );

        await pool.query('COMMIT'); // Finaliza Transação

        res.json({ success: true, reward: challenge.reward_amount });

    } catch (error) {
        await pool.query('ROLLBACK'); // Se der erro, desfaz tudo
        console.error("Erro ao resgatar:", error);
        res.status(500).json({ error: "Erro ao processar resgate." });
    }
});

export default router;
