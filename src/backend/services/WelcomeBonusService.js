import { query } from "../database/db_connection.js";
import { processFixedBonusCredit } from "./RewardEngine.js";

const WELCOME_BONUS = Number(process.env.WELCOME_BONUS) || 100;

/**
 * checkEligibility
 * ----------------
 * Verifica se o usuário pode receber o bônus de boas-vindas.
 */
async function checkEligibility(userId) {
    // Verifica quantas transações o usuário possui
    const txSql = `
        SELECT COUNT(*) AS total
        FROM transactions
        WHERE user_id = $1;
    `;
    const txResult = await query(txSql, [userId]);
    const totalTx = Number(txResult.rows[0].total);

    // Verifica se já recebeu o bônus
    const userSql = `
        SELECT has_claimed_welcome_bonus
        FROM users
        WHERE user_id = $1;
    `;
    const userResult = await query(userSql, [userId]);

    if (userResult.rows.length === 0) {
        throw new Error("Usuário não encontrado.");
    }

    const alreadyClaimed = userResult.rows[0].has_claimed_welcome_bonus;

    const eligible = totalTx === 0 && !alreadyClaimed;

    return { eligible, alreadyClaimed };
}

/**
 * claimWelcomeBonus
 * -----------------
 * Executa o fluxo completo da HU4.
 */
export async function claimWelcomeBonus(userId) {
    const { eligible, alreadyClaimed } = await checkEligibility(userId);

    if (!eligible) {
        return {
            success: false,
            code: 400,
            message: alreadyClaimed
                ? "Usuário já recebeu o bônus anteriormente."
                : "Usuário já realizou atividades. Não pode receber o bônus."
        };
    }

    // 💰 Se chegou aqui, o usuário pode receber o bônus
    const result = await processFixedBonusCredit(
        userId,
        WELCOME_BONUS,
        "welcome_challenge"
    );

    if (!result.success) {
        return {
            success: false,
            code: 500,
            message: result.message
        };
    }

    // 🔥 ATUALIZA A FLAG — ESSENCIAL!
    const updateSql = `
        UPDATE users
        SET has_claimed_welcome_bonus = TRUE
        WHERE user_id = $1;
    `;
    await query(updateSql, [userId]);

    return {
        success: true,
        code: 201,
        message: "Bônus de boas-vindas creditado com sucesso!",
        bonus: WELCOME_BONUS,
        newBalance: result.balance
    };
}
