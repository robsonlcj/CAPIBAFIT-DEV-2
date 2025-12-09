import axios from 'axios';

const API_URL = 'http://localhost:3001/api';

export async function getDailyProgress(userId) {
    try {
        // Chama a rota que acabamos de criar
        const response = await axios.get(`${API_URL}/activities/progress/${userId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar progresso diário:", error);
        // Em caso de erro, retorna valores zerados para não quebrar a tela
        return { steps_count: 0, daily_goal: 5000 };
    }
}