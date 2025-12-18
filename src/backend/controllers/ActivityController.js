import { pool } from '../database/db_connection.js';

const ActivityController = {
    async finishActivity(req, res) {
        // --- LOG DE ENTRADA (O DEDO-DURO) ---
        console.log("\n🔥 [DEBUG] ROTA ACIONADA: /activity/finish");
        console.log("📦 [DEBUG] Payload recebido do Front:", JSON.stringify(req.body, null, 2));

        const { userId, distance, time, steps, spotId } = req.body;

        // Validação básica
        if (!userId) {
            console.error("❌ [DEBUG] ERRO: O userId veio vazio ou undefined!");
            return res.status(400).json({ error: "User ID é obrigatório" });
        }

        try {
            // 1. Lógica de Recompensa
            let baseReward = Math.floor((distance || 0) * 10);
            if (baseReward === 0 && steps > 0) {
                baseReward = Math.floor(steps / 100);
            }
            if (baseReward < 1 && (distance > 0 || steps > 0)) baseReward = 1;

            let multiplier = 1.0;
            let locationName = "Atividade Livre";

            // 2. Verifica Ponto Turístico
            if (spotId) {
                console.log(`📍 [DEBUG] Buscando Ponto Turístico ID: ${spotId}`);
                const spotRes = await pool.query('SELECT name, multiplier FROM tourist_spots WHERE id = $1', [spotId]);
                if (spotRes.rows.length > 0) {
                    multiplier = parseFloat(spotRes.rows[0].multiplier);
                    locationName = spotRes.rows[0].name;
                    console.log(`✅ [DEBUG] Ponto encontrado: ${locationName} (x${multiplier})`);
                } else {
                    console.warn("⚠️ [DEBUG] Ponto turístico não encontrado no banco.");
                }
            }

            let finalAmount = Math.floor(baseReward * multiplier);
            if (finalAmount === 0) {
                console.log("🎁 [DEBUG] Atividade zerada detectada. Dando prêmio de consolação.");
                finalAmount = 5; 
            }
            console.log(`💰 [DEBUG] Recompensa Final Calculada: ${finalAmount} Capibas`);

            // 3. Atualizar Saldo
            console.log("🏦 [DEBUG] Atualizando tabela 'users'...");
            const updateRes = await pool.query(
                `UPDATE users 
                 SET balance = balance + $1, 
                     total_km = total_km + $2,
                     streak_count = streak_count + 1,
                     last_active_date = NOW()
                 WHERE user_id = $3`,
                [finalAmount, distance || 0, userId]
            );
            console.log(`✅ [DEBUG] Users atualizado. Linhas afetadas: ${updateRes.rowCount}`);

            if (updateRes.rowCount === 0) {
                console.error("❌ [DEBUG] PERIGO: O update rodou mas nenhuma linha foi afetada. O userId existe mesmo?");
            }

            // 4. Registrar Extrato
            console.log("📝 [DEBUG] Inserindo na tabela 'transactions'...");
            const insertRes = await pool.query(
                `INSERT INTO transactions 
                 (user_id, amount_capiba, activity_type, activity_details, created_at) 
                 VALUES ($1, $2, $3, $4, NOW())`,
                [
                    userId, 
                    finalAmount, 
                    'activity', 
                    `Corrida em: ${locationName} (${distance}km)`
                ]
            );
            console.log(`✅ [DEBUG] Transactions inserido. Linhas afetadas: ${insertRes.rowCount}`);

            // Resposta final
            res.json({
                success: true,
                earned: finalAmount,
                newBalance: finalAmount,
                message: `Você ganhou ${finalAmount} Capibas!`
            });

        } catch (error) {
            console.error("💀 [DEBUG] ERRO CRÍTICO NO BANCO:", error);
            // Isso vai mostrar se o erro é nome de coluna, sintaxe SQL, etc.
            res.status(500).json({ error: "Erro interno no servidor: " + error.message });
        }
    }
};

export default ActivityController;
