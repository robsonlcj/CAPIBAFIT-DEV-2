import React, { useEffect, useState } from 'react';
import { getUserTransactions } from '../../services/balanceService'; 
import '../../pages/style/style.css'; 

export default function TransactionList() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true); 
    const [error, setError] = useState(false); // 1. Novo estado para erro

    useEffect(() => {
        async function loadTransactions() {
            try {
                // Reinicia o erro ao tentar buscar novamente
                setError(false);
                const data = await getUserTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Erro ao carregar extrato:", error);
                setError(true); // 2. Ativa o erro se falhar
            } finally {
                setLoading(false);
            }
        }
        
        loadTransactions();
    }, []);

    // 3. Renderização do Spinner (Carregando)
    if (loading) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Carregando transações...</p>
            </div>
        );
    }

    // 4. Renderização de Erro
    if (error) {
        return (
            <div className="error-container">
                <p className="error-msg">Ops! Não foi possível carregar seu extrato.</p>
                {/* Opcional: Botão para tentar de novo recarregando a página */}
            </div>
        );
    }

    return (
        <div className="transacao-container">
            <h2 className="transacao-titulo">Extrato de Ganhos</h2>
            
            {transactions.length === 0 ? (
                // 5. Mensagem exata da Task
                <p className="transacao-vazia">Sem transações ainda.</p>
            ) : (
                <ul className="transacao-lista">
                    {transactions.map((t, index) => (
                        <li key={index} className="transacao-item">
                            <div className="transacao-info">
                                <span className="transacao-origem">{t.origem}</span>
                                <span className="transacao-data">
                                    {new Date(t.data).toLocaleDateString('pt-BR')} às {new Date(t.data).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </div>
                            <span className="transacao-valor">
                                + {t.valor} Capibas
                            </span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}