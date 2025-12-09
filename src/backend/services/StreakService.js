import { pool } from '../database/db_connection.js';
import { formatInTimeZone } from 'date-fns-tz';
import rewardEngine from './rewardEngine.js'; 
import notificationService from './NotificationService.js'; 

const TIMEZONE = 'America/Recife';

class StreakService {
    
    async registerActivity(userId) {
        try {
            // CORREÇÃO: user_id
            const userResult = await pool.query('SELECT streak_count, last_active_date FROM users WHERE user_id = $1', [userId]);
            
            if (userResult.rows.length === 0) return { error: 'User not found' };

            const currentStreak = userResult.rows[0].streak_count || 0;
            const lastActive = userResult.rows[0].last_active_date;

            const now = new Date();
            const todayStr = formatInTimeZone(now, TIMEZONE, 'yyyy-MM-dd');
            
            let newStreak = currentStreak;
            let shouldUpdate = false;

            if (!lastActive) {
                newStreak = 1;
                shouldUpdate = true;
            } else {
                const lastActiveStr = formatInTimeZone(new Date(lastActive), TIMEZONE, 'yyyy-MM-dd');

                if (todayStr === lastActiveStr) {
                    return { streak: currentStreak, status: 'already_active_today' };
                }

                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                const yesterdayStr = formatInTimeZone(yesterday, TIMEZONE, 'yyyy-MM-dd');

                if (lastActiveStr === yesterdayStr) {
                    newStreak += 1;
                    shouldUpdate = true;
                    
                    if (newStreak % 5 === 0) {
                        console.log(`🔥 Usuário ${userId} atingiu ${newStreak} dias! Processando bônus...`);
                        try {
                            if (rewardEngine && typeof rewardEngine.giveBonus === 'function') {
                                await rewardEngine.giveBonus(userId, 'streak_bonus');
                            }
                            if (notificationService && typeof notificationService.sendNotification === 'function') {
                                await notificationService.sendNotification(userId, "Fogo total! 🔥", `Você atingiu ${newStreak} dias seguidos!`);
                            }
                        } catch (err) {
                            console.error("Erro ao processar bônus do streak:", err);
                        }
                    }

                } else {
                    newStreak = 1; 
                    shouldUpdate = true;
                }
            }

            if (shouldUpdate) {
                // CORREÇÃO: user_id
                await pool.query(
                    'UPDATE users SET streak_count = $1, last_active_date = $2 WHERE user_id = $3',
                    [newStreak, now, userId]
                );
            }

            return { streak: newStreak, updated: shouldUpdate };

        } catch (error) {
            console.error("Erro no registerActivity:", error);
            throw error;
        }
    }

    async getStreakStatus(userId) {
        try {
            // CORREÇÃO: user_id
            const result = await pool.query('SELECT streak_count FROM users WHERE user_id = $1', [userId]);
            const streak = result.rows[0]?.streak_count || 0;
            
            const remainder = streak % 5;
            const nextBonusDays = 5 - remainder;

            return {
                current_streak: streak,
                next_bonus_in: nextBonusDays
            };
        } catch (error) {
            console.error("Erro no getStreakStatus:", error);
            throw error;
        }
    }
}

export default new StreakService();