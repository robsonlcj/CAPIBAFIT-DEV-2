import { pool } from '../database/db_connection.js';

// AGORA PODEMOS USAR O IMPORT NOVAMENTE!
import { requestCapibaCredit } from '../integrations/capibaApi.js';

const CAPIBA_FACTOR = Number(process.env.CAPIBA_PER_KM) || 30; 
const MAX_SPEED_KPH = 25; 

class RewardEngine {

    calculateCapibas(distanceKm, multiplier = 1) {
        const baseValue = distanceKm * CAPIBA_FACTOR;
        return Math.floor(baseValue * multiplier);
    }

    validateActivity(distanceKm, timeMinutes) {
        if (distanceKm < 0.1 || timeMinutes < 1) return false;
        if (timeMinutes > 0) {
            const speedKPH = distanceKm / (timeMinutes / 60);
            if (speedKPH > MAX_SPEED_KPH) return false;
        }
        return true;
    }

    async processAndCreditActivity(userId, distanceKm, timeMinutes, activityType, multiplier = 1, bonusName = null) {
        
        if (!this.validateActivity(distanceKm, timeMinutes)) {
            return { success: false, message: "Atividade rejeitada: Velocidade ou distância inválida." };
        }

        const capibasToCredit = this.calculateCapibas(distanceKm, multiplier);
        
        let details = `${distanceKm.toFixed(2)} km, ${timeMinutes} min`;
        if (multiplier > 1 && bonusName) {
            details += ` | Bônus Turístico: ${bonusName} (3x)`;
        }

        try {
            // CHAMADA REAL (Mas que vai cair no Mock se não tiver chave)
            // Isso mantém seu código limpo e pronto para produção
            let creditResult = { success: false };

            try {
                 creditResult = await requestCapibaCredit(userId, capibasToCredit, details);
            } catch (integrationError) {
                 console.error("Erro na integração:", integrationError);
                 // Se falhar a integração, decidimos se abortamos ou não. 
                 // Por segurança, vamos abortar.
                 return { success: false, message: "Erro de comunicação com a Prefeitura." };
            }

            if (creditResult.success) {
                const externalId = creditResult.data?.transaction_id || null;

                await pool.query(
                    `INSERT INTO transactions (user_id, amount_capiba, activity_type, activity_details, external_ref_id)
                     VALUES ($1, $2, $3, $4, $5)`,
                    [userId, capibasToCredit, activityType, details, externalId]
                );

                const updateResult = await pool.query(
                    `UPDATE users 
                     SET balance = balance + $1,
                         total_km = COALESCE(total_km, 0) + $2
                     WHERE user_id = $3 
                     RETURNING balance`,
                    [capibasToCredit, distanceKm, userId]
                );

                return { 
                    success: true, 
                    credited: capibasToCredit, 
                    balance: updateResult.rows[0]?.balance,
                    details: details,
                    isBonus: multiplier > 1,
                    bonusApplied: multiplier > 1, 
                    location: bonusName
                };
            } else {
                return { success: false, message: "Prefeitura recusou o crédito." };
            }

        } catch (dbError) {
            console.error("Erro crítico no banco local:", dbError);
            return { success: false, message: "Erro ao salvar transação no banco." };
        }
    }
}

export default new RewardEngine();

export function calculateWelcomeBonus(km) {
    const engine = new RewardEngine();
    return engine.calculateCapibas(km) * 2;
}