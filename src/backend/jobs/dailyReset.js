import cron from 'node-cron';
import { pool } from '../database/db_connection.js';
import notificationService from '../services/NotificationService.js';

const TIMEZONE = 'America/Recife';

const initDailyJob = () => {
    cron.schedule('0 9 * * *', async () => {
        console.log('--- Daily Job: Verificando Streaks ---');
        try {
            // CORREÇÃO: user_id
            const query = `
                SELECT user_id, streak_count 
                FROM users 
                WHERE streak_count > 0 
                AND last_active_date < CURRENT_DATE - INTERVAL '1 day'
            `;
            const result = await pool.query(query);
            
            for (const user of result.rows) {
                // CORREÇÃO: user.user_id
                await pool.query('UPDATE users SET streak_count = 0 WHERE user_id = $1', [user.user_id]);
                
                console.log(`Streak resetado para User ${user.user_id}`);
                
                if (notificationService && notificationService.sendNotification) {
                    notificationService.sendNotification(user.user_id, "Streak Perdido", "Reinicie hoje!");
                }
            }
        } catch (error) {
            console.error('Erro no Job:', error);
        }
    }, {
        scheduled: true,
        timezone: TIMEZONE
    });
    
    console.log('📅 Job de Daily Reset agendado.');
};

export default initDailyJob;