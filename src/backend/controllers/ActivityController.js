// Ajuste de caminho: Agora services é irmão de controllers (dentro de backend)
// Então saímos de controllers (..) e entramos em services
import RewardEngine from '../services/rewardEngine.js'; // Atenção ao R maiúsculo!
import TouristService from '../services/TouristService.js';

class ActivityController {

    async finishActivity(req, res) {
        try {
            const { userId, distanceKm, timeMinutes, activityType, coords } = req.body;

            if (!userId || distanceKm === undefined || !timeMinutes) {
                return res.status(400).json({ 
                    success: false, 
                    message: "Dados obrigatórios faltando (userId, distanceKm, timeMinutes)." 
                });
            }

            // 2. Verificar Bônus Turístico
            const userLat = coords?.lat;
            const userLon = coords?.lon;

            const geoResult = await TouristService.checkLocationBonus(userId, userLat, userLon);
            
            // 3. Processar Recompensa Financeira
            const rewardResult = await RewardEngine.processAndCreditActivity(
                userId,
                distanceKm,
                timeMinutes,
                activityType || 'unknown', 
                geoResult.multiplier, 
                geoResult.spotName 
            );

            if (rewardResult.success) {
                return res.status(201).json({
                    success: true,
                    message: "Atividade finalizada com sucesso!",
                    data: {
                        ...rewardResult,
                        bonusApplied: geoResult.isBonus, 
                        location: geoResult.spotName
                    }
                });
            } else {
                return res.status(400).json({
                    success: false,
                    message: rewardResult.message
                });
            }

        } catch (error) {
            console.error("Erro crítico no ActivityController:", error);
            return res.status(500).json({ 
                success: false, 
                message: "Erro interno no servidor ao processar atividade." 
            });
        }
    }
}

export default new ActivityController();