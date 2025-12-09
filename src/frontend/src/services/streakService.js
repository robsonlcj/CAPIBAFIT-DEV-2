import api from './api'; // Importando sua instância do Axios existente

const streakService = {
  // Busca o status atual (dias seguidos e bônus)
  getStreak: async (userId) => {
    try {
      const response = await api.get(`/users/${userId}/streak`);
      return response.data;
    } catch (error) {
      console.error("Erro ao buscar streak:", error);
      return { current_streak: 0, next_bonus_in: 5 }; // Fallback seguro
    }
  },

  // (Opcional) Método para simular atividade se quiser testar por botão
  simulateActivity: async (userId) => {
    try {
      const response = await api.post(`/users/${userId}/activity`);
      return response.data;
    } catch (error) {
      console.error("Erro ao registrar atividade:", error);
    }
  }
};

export default streakService;