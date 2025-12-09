// Simulação de serviço de Push (ex: Firebase/FCM ou OneSignal)
class NotificationService {
    
    async sendNotification(userId, title, message) {
        // Aqui você buscaria o token do dispositivo do usuário no banco
        // const user = await db.query('SELECT fcm_token FROM users WHERE id = $1', [userId]);
        
        console.log(`--- NOTIFICAÇÃO ENVIADA PARA USER ${userId} ---`);
        console.log(`Título: ${title}`);
        console.log(`Msg: ${message}`);
        console.log(`-----------------------------------------------`);
        
        // Retornar true simulando sucesso
        return true;
    }
}

export default new NotificationService();