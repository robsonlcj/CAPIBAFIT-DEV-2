import { pool } from '../database/db_connection.js';
import { requestCapibaCredit } from '../integrations/capibaApi.js';

const CAPIBA_FACTOR = Number(process.env.CAPIBA_PER_KM) || 30; 
const MAX_SPEED_KPH = 25; 

class RewardEngine {

    calculateCapibas(distanceKm) {
        return Math.floor(distanceKm * CAPIBA_FACTOR);
    }

    validateActivity(distanceKm, timeMinutes) {
        if (distanceKm < 0.1 || timeMinutes < 1) return false;
        if (timeMinutes > 0) {
            const speedKPH = distanceKm / (timeMinutes / 60);
            if (speedKPH > MAX_SPEED_KPH) return false;
        }
        return true;
    }

    async giveBonus(userId, reason) {
        console.log(`🎁 [REWARD] Concedendo bônus para User ${userId} | Motivo: ${reason}`);
        const bonusAmount = 50; 

        try {
            // CORREÇÃO: user_id
            await pool.query(
                'UPDATE users SET balance = balance + $1 WHERE user_id = $2',
                [bonusAmount, userId]
            );
            
            await pool.query(
                'INSERT INTO transactions (user_id, amount_capiba, activity_type, activity_details) VALUES ($1, $2, $3, $4)',
                [userId, bonusAmount, 'bonus', reason]
            );

            return true;
        } catch (error) {
            console.error("Erro ao processar bônus:", error);
            return false;
        }
    }

    async processAndCreditActivity(userId, distanceKm, timeMinutes, activityType) {
        if (!this.validateActivity(distanceKm, timeMinutes)) {
            return { success: false, message: "Atividade rejeitada pela validação Anti-Fraude." };
        }

        const capibasToCredit = this.calculateCapibas(distanceKm);
        const details = `${distanceKm.toFixed(2)} km, ${timeMinutes} min`;

        try {
            let creditResult = { success: false };
            try {
                if (typeof requestCapibaCredit === 'function') {
                    creditResult = await requestCapibaCredit(userId, capibasToCredit, details);
                } else {
                    console.warn("⚠️ API da Prefeitura não encontrada/mockada. Aprovando automaticamente.");
                    creditResult = { success: true, data: { transaction_id: 'mock-id' } };
                }
            } catch (apiErr) {
                return { success: false, message: "Falha na requisição à API da Prefeitura." };
            }

            if (creditResult.success) {
                const transactionSql = `
                    INSERT INTO transactions (user_id, amount_capiba, activity_type, activity_details, external_ref_id)
                    VALUES ($1, $2, $3, $4, $5)
                    RETURNING *;
                `;
                const externalId = creditResult.data?.transaction_id || null;

                await pool.query(transactionSql, [
                    userId, capibasToCredit, activityType, details, externalId
                ]);

                // CORREÇÃO: user_id
                const updateUserSql = `
                    UPDATE users 
                    SET balance = balance + $1,
                    total_km = COALESCE(total_km, 0) + $2
                    WHERE user_id = $3 
                    RETURNING balance, total_km;
            `;
                const updateResult = await pool.query(updateUserSql, [capibasToCredit, distanceKm, userId]);
                const newBalance = updateResult.rows[0]?.balance;

                return { success: true, credited: capibasToCredit, details, balance: newBalance };
            } else {
                return { success: false, message: "Prefeitura recusou o crédito." };
            }

        } catch (dbError) {
            console.error("Erro crítico no banco local:", dbError);
            return { success: false, message: "Crédito externo OK, mas falha no registro local." };
        }
    }
}

export default new RewardEngine();

export function calculateWelcomeBonus(km) {
    const engine = new RewardEngine();
    return engine.calculateCapibas(km) * 2;
}