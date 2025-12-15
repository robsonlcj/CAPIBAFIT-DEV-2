import { pool } from '../database/db_connection.js';

class TouristService {
    
    // Calcula a distância em metros entre dois pontos (Fórmula de Haversine)
    getDistanceFromLatLonInMeters(lat1, lon1, lat2, lon2) {
        const R = 6371e3; // Raio da Terra em metros
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = 
            Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    /**
     * Verifica se o usuário está elegível para bônus turístico.
     * Retorna: { multiplier: number, spotName: string | null, isBonus: boolean }
     */
    async checkLocationBonus(userId, userLat, userLon) {
        // Objeto de retorno padrão (sem bônus)
        const noBonus = { multiplier: 1.0, spotName: null, isBonus: false };

        if (!userLat || !userLon) return noBonus;

        try {
            // 1. Busca todos os pontos turísticos cadastrados (Marco Zero, Jaqueira, Boa Viagem)
            const spotsResult = await pool.query('SELECT * FROM tourist_spots');
            const spots = spotsResult.rows;

            for (const spot of spots) {
                // Converte as coordenadas do banco para Float
                const spotLat = parseFloat(spot.latitude);
                const spotLon = parseFloat(spot.longitude);
                const radius = spot.radius_meters || 30;

                // 2. Calcula a distância real
                const distance = this.getDistanceFromLatLonInMeters(userLat, userLon, spotLat, spotLon);

                // 3. Se estiver dentro do raio (ex: 30 metros)
                if (distance <= radius) {
                    try {
                        // 4. Tenta registrar o check-in no dia de hoje
                        // Se o usuário JÁ TIVER check-in hoje (em qualquer lugar), o banco bloqueia aqui
                        await pool.query(
                            'INSERT INTO tourist_checkins (user_id, spot_id) VALUES ($1, $2)',
                            [userId, spot.id]
                        );

                        console.log(`📍 [GEO] User ${userId} desbloqueou bônus em: ${spot.name}`);

                        // SUCESSO: Retorna o multiplicador do ponto (ex: 3.0)
                        return { 
                            multiplier: parseFloat(spot.multiplier), 
                            spotName: spot.name,
                            isBonus: true
                        };

                    } catch (dbErr) {
                        // Código 23505 é erro de "Unique Violation" no PostgreSQL
                        if (dbErr.code === '23505') {
                            console.log(`ℹ️ [GEO] User ${userId} já resgatou o bônus diário. Mantendo 1x.`);
                        }
                        // Se já pegou hoje, retorna 1x e encerra a busca
                        return noBonus; 
                    }
                }
            }

            // Não está perto de nenhum ponto
            return noBonus; 

        } catch (error) {
            console.error("Erro no TouristService:", error);
            return noBonus; // Na dúvida (erro de banco), segue sem bônus para não travar o app
        }
    }
}

export default new TouristService();