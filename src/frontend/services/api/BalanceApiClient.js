// src/frontend/services/api/BalanceApiClient.js
import axios from "axios";
import { getCurrentUserId } from "../health/healthService.js";

const BACKEND_API_BASE_URL =
  process.env.BACKEND_API_URL || "http://localhost:3000/api/v1";

/**
 * Task HU1-5: Consulta o saldo atualizado do usuário.
 * @returns {Promise<{ balance: number }>}
 */
export async function getUserBalance() {
  const userId = getCurrentUserId();
  const url = `${BACKEND_API_BASE_URL}/users/${userId}/balance`;

  try {
    console.log(`[BalanceApiClient] Buscando saldo atualizado para ${userId}...`);
    const res = await axios.get(url);
    return res.data; // Exemplo esperado: { balance: 150 }
  } catch (err) {
    console.error("[BalanceApiClient] Erro ao buscar saldo:", err.message);
    throw err;
  }
}
