import axios from 'axios';

const CAPIBA_API_URL = process.env.CAPIBA_CREDIT_URL || 'http://capiba.prefeitura.api/credit';
const API_KEY = process.env.CAPIBA_API_KEY;

export async function requestCapibaCredit(userId, capibasAmount, activityDetails) {
    
    // =====================================================================
    // LÓGICA DE MOCK (DESENVOLVIMENTO)
    // Se não houver chave configurada, assumimos que estamos em testes.
    // =====================================================================
    if (!API_KEY || API_KEY === 'mock') {
        console.warn(`⚠️ [MOCK API] API Key não detectada. Simulando crédito de ${capibasAmount} capibas para User ${userId}...`);
        
        // Simula um delay de rede (opcional, para realismo)
        await new Promise(resolve => setTimeout(resolve, 500));

        return { 
            success: true, 
            data: { 
                transaction_id: `MOCK-PREF-${Date.now()}`,
                status: "APPROVED_MOCK",
                message: "Crédito simulado com sucesso."
            } 
        };
    }

    // =====================================================================
    // LÓGICA REAL (PRODUÇÃO)
    // Só executa se tiver API_KEY válida no .env
    // =====================================================================
    const payload = {
        user_id: userId,
        amount: capibasAmount,
        action_type: "ATIVIDADE_FISICA",
        details: activityDetails
    };

    try {
        const response = await axios.post(CAPIBA_API_URL, payload, {
            headers: {
                'Authorization': `Bearer ${API_KEY}`,
                'Content-Type': 'application/json',
            }
        });

        return { success: true, data: response.data };

    } catch (error) {
        const errorMessage = error.response ? error.response.data : error.message;
        console.error("Falha ao solicitar crédito na API da Prefeitura:", errorMessage);
        return { success: false, error: errorMessage };
    }
}