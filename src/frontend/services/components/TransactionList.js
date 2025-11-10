// src/frontend/components/TransactionList.js

import React, { useEffect, useState } from 'react';
import { fetchUserTransactions } from '../services/TransactionService';

/**
 * Renderiza a lista de transações (origem, valor, data)
 * obtidas via backend (rota /users/:userId/transactions).
 */
export default function TransactionList() {
    const [transactions, setTransactions] = useState([]);

    // Efeito que busca as transações ao montar o componente
    useEffect(() => {
        async function loadTransactions() {
            const data = await fetchUserTransactions();
            setTransactions(data);
        }
        loadTransactions();
    }, []);

    return (
        <div style={{ padding: 16 }}>
            <h2>Extrato de Ganhos</h2>
            {transactions.length === 0 ? (
                <p>Nenhuma transação encontrada.</p>
            ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                    {transactions.map((t, index) => (
                        <li key={index} style={{ marginBottom: 8, borderBottom: '1px solid #ccc', paddingBottom: 8 }}>
                            <p><strong>Origem:</strong> {t.origem}</p>
                            <p><strong>Valor:</strong> {t.valor} Capibas</p>
                            <p><strong>Data:</strong> {new Date(t.data).toLocaleString('pt-BR')}</p>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
