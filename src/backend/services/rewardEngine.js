// Motor de recompensa: calcula quantas 'capibas' creditar por atividade,
// valida a atividade quanto a plausibilidade (anti-fraude), solicita o
// crédito à API externa (Prefeitura) e registra a transação localmente.

import { requestCapibaCredit } from '../integrations/capibaApi.js';
import { query } from '../database/db_connection.js';

// --- Regras de Negócio ---
export const CAPIBA_FACTOR = Number(process.env.CAPIBA_PER_KM) || 30; // Capibas por km
const MAX_SPEED_KPH = 25; // Limite anti-fraude (velocidade impossivel)

/**
 * calculateCapibas
 * Converte KM → Capibas (inteiro)
 */
export function calculateCapibas(distanceKm) {
    return Math.floor(distanceKm * CAPIBA_FACTOR);
}

/**
 * validateActivity
 * Verifica plausibilidade da atividade (anti-fraude)
 */
export function validateActivity(distanceKm, timeMinutes) {
    if (distanceKm < 0.1 || timeMinutes < 1) return false;

    const speedKPH = distanceKm / (timeMinutes / 60);
    if (speedKPH > MAX_SPEED_KPH) return false;

    return true;
}

/**
 * processAndCreditActivity
 * Fluxo para atividades (com distância e tempo)
 */
export async function processAndCreditActivity(userId, distanceKm, timeMinutes, activityType) {
    if (!validateActivity(distanceKm, timeMinutes)) {
        return { success: false, message: "Atividade rejeitada pela validação Anti-Fraude." };
    }

    const capibasToCredit = calculateCapibas(distanceKm);
    const details = `${distanceKm.toFixed(2)} km, ${timeMinutes} min`;

    const creditResult = await requestCapibaCredit(userId, capibasToCredit, details);

    if (!creditResult.success) {
        return { success: false, message: "Falha na requisição à API da Prefeitura." };
    }

    try {
        // registra transação
        await query(`
            INSERT INTO transactions (user_id, amount_capiba, activity_type, activity_details, external_ref_id)
            VALUES ($1, $2, $3, $4, $5);
        `, [
            userId,
            capibasToCredit,
            activityType,
            details,
            creditResult.data?.transaction_id || null
        ]);

        // atualiza saldo
        const updateResult = await query(`
            UPDATE users
            SET balance = balance + $1
            WHERE user_id = $2
            RETURNING balance;
        `, [capibasToCredit, userId]);

        return {
            success: true,
            credited: capibasToCredit,
            details,
            balance: updateResult.rows[0]?.balance || null
        };

    } catch (dbError) {
        console.error("Erro ao registrar transação no BD local:", dbError);
        return { success: false, message: "Crédito na Capiba OK, mas falha no registro local." };
    }
}

/**
 * processFixedBonusCredit
 * Fluxo para bônus fixos (ex: HU4 - bônus de boas-vindas)
 */
export async function processFixedBonusCredit(userId, amount, activityType) {
    const details = `Bônus Fixo: ${activityType}`;

    const creditResult = await requestCapibaCredit(userId, amount, details);

    if (!creditResult.success) {
        return { success: false, message: "Falha na requisição à API da Prefeitura para bônus fixo." };
    }

    const externalRefId = creditResult.data?.transaction_id || null;

    try {
        await query("BEGIN");

        // insere transação
        await query(`
            INSERT INTO transactions (user_id, amount_capiba, activity_type, activity_details, external_ref_id)
            VALUES ($1, $2, $3, $4, $5);
        `, [userId, amount, activityType, details, externalRefId]);

        // atualiza saldo
        const updateResult = await query(`
            UPDATE users
            SET balance = balance + $1
            WHERE user_id = $2
            RETURNING balance;
        `, [amount, userId]);

        // marca bônus como recebido
        await query(`
            UPDATE users
            SET has_claimed_welcome_bonus = TRUE
            WHERE user_id = $1;
        `, [userId]);

        await query("COMMIT");

        return {
            success: true,
            credited: amount,
            details,
            balance: updateResult.rows[0].balance
        };

    } catch (error) {
        await query("ROLLBACK");
        console.error("Erro no bônus fixo:", error);

        return {
            success: false,
            message: "Crédito externo OK, mas erro ao salvar no banco local."
        };
    }
}
