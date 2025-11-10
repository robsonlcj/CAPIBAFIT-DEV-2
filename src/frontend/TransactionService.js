// src/frontend/services/TransactionService.js

import axios from 'axios';
import { getCurrentUserId } from '../health/healthService';

// Base URL configurável via variável de ambiente.
const BACKEND_API_BASE_URL = process.env.BACKEND_API_URL || 'http://localhost:3000/api/v1';

/**
 * Busca o extrato de transações (Capibas) do usuário autenticado.
 * @returns {Promise<Array<{ valor: number, data: string, origem: string }>>}
 */
export async function fetchUserTransactions() {
    const userId = getCurrentUserId();
    const url = `${BACKEND_API_BASE_URL}/users/${userId}/transactions`;

    try {
        console.log(`[Mobile] Buscando transações do usuário ${userId} em: ${url}`);
        const response = await axios.get(url);

        if (response.status === 200 && response.data.transactions) {
            return response.data.transactions;
        }

        console.warn("[Mobile] Nenhuma transação encontrada.");
        return [];

    } catch (error) {
        const errorMessage = error.response?.data?.error || error.message;
        console.error("ERRO: Falha ao buscar transações:", errorMessage);
        return [];
    }
}
