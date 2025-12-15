import { pool } from "../database/db_connection.js";
// Importa a função auxiliar que mantivemos no arquivo do RewardEngine
import { calculateWelcomeBonus } from "../services/rewardEngine.js";

export const WelcomeBonusService = {

  async execute(user_id) {
    // 1. Conexão Exclusiva (Necessário para Transações BEGIN/COMMIT funcionarem direito)
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        // 2. Verificar usuário e flag
        const userRes = await client.query(
            "SELECT welcome_challenge_completed FROM users WHERE user_id = $1",
            [user_id]
        );

        if (userRes.rows.length === 0) {
            throw { status: 404, message: "Usuário não encontrado" };
        }

        if (userRes.rows[0].welcome_challenge_completed === 'S') { // 'S' ou 'N' conforme seu schema
            throw { status: 400, message: "O desafio de boas-vindas já foi concluído" };
        }

        // 3. Calcular Bônus (Centralizado no RewardEngine)
        // Isso garante que se mudarmos o valor do Km base, o bônus de boas-vindas atualiza junto
        const KM_CHALLENGE = 1; 
        const bonusCapibas = calculateWelcomeBonus(KM_CHALLENGE); 

        // 4. Registrar Transação (Ajustado para o Schema Atual)
        // Usamos 'external_ref_id' para marcar a origem técnica, se quiser
        await client.query(
            `INSERT INTO transactions
            (user_id, amount_capiba, activity_type, activity_details, external_ref_id)
            VALUES ($1, $2, 'bonus', 'Desafio de boas-vindas (1 km)', 'welcome_challenge')`,
            [user_id, bonusCapibas]
        );

        // 5. Atualizar Saldo (Corrigido: 'balance' em vez de 'capiba_balance')
        await client.query(
            `UPDATE users
            SET balance = COALESCE(balance, 0) + $1,
                welcome_challenge_completed = 'S'
            WHERE user_id = $2`,
            [bonusCapibas, user_id]
        );

        await client.query('COMMIT');
        
        return { 
            success: true, 
            message: "Desafio de boas-vindas concluído!",
            bonus: bonusCapibas 
        };

    } catch (error) {
        await client.query('ROLLBACK');
        
        // Tratamento de erro padronizado
        const status = error.status || 500;
        const message = error.message || "Erro interno ao processar bônus de boas-vindas";
        
        // Lança um erro estruturado para o Controller pegar
        const err = new Error(message);
        err.status = status;
        throw err;
    } finally {
        // Libera o cliente de volta para o pool (MUITO IMPORTANTE)
        client.release();
    }
  }
};