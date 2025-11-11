// src/frontend/services/BalanceService.js

import { getCurrentUserId } from './health/healthService.js';
import { showCreditFeedback } from './feedback/FeedbackService.js';

/**
 * Faz requisição ao backend para calcular o saldo total do usuário.
 * Backend: GET /api/v1/users/:userId/transactions
 */
async function calculateBalanceFromTransactions(userId) {
  const response = await fetch(`/api/v1/users/${userId}/transactions`);
  
  if (!response.ok) {
    console.error("[BalanceService] Falha ao buscar transações.");
    return 0;
  }

  const data = await response.json();
  // Somatório dos valores (coluna 'valor' no SQL)
  const totalCapibas = data.transactions.reduce((sum, t) => sum + t.valor, 0);
  return totalCapibas;
}

/**
 * Atualiza o saldo na UI e mostra feedback se houve aumento (HU1.5 e HU1.6).
 */
export async function updateBalanceDisplay(userId = getCurrentUserId()) {
  try {
    const newBalance = await calculateBalanceFromTransactions(userId);

    const balanceElement = document.getElementById('capiba-balance-field');
    if (!balanceElement) {
      console.warn("[BalanceService] Elemento #capiba-balance-field não encontrado.");
      return;
    }

    const oldValue = Number(balanceElement.textContent) || 0;
    balanceElement.textContent = newBalance.toString();

    // Feedback visual se o saldo aumentou
    if (newBalance > oldValue) {
      showCreditFeedback(newBalance - oldValue);
    }

  } catch (error) {
    console.error("[BalanceService] Erro ao atualizar saldo:", error);
  }
}