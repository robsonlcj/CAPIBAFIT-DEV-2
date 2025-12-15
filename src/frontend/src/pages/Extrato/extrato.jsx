import React, { useEffect, useState } from 'react';
import api from '../../services/api'; // Certifique-se que o caminho está correto
import TransactionItem from '../../components/TransactionList/TransactionItem.jsx';

function Extrato() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = 1; // Fixo por enquanto

    useEffect(() => {
        const fetchExtrato = async () => {
            try {
                const response = await api.get(`/users/${userId}/transactions`);
                setTransactions(response.data);
            } catch (error) {
                console.error("Erro ao carregar extrato:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchExtrato();
    }, [userId]);

    return (
        <div style={styles.pageContainer}>
            <div style={styles.header}>
                <h1 style={styles.pageTitle}>Histórico 📜</h1>
                <p style={styles.subtitle}>Seus ganhos de Capibas</p>
            </div>

            <div style={styles.listCard}>
                {loading ? (
                    <p style={{textAlign: 'center', padding: '20px', color: '#888'}}>Carregando...</p>
                ) : transactions.length > 0 ? (
                    transactions.map(item => (
                        <TransactionItem 
                            key={item.transaction_id} // Usando o ID do seu print
                            type={item.activity_type}
                            details={item.activity_details}
                            amount={item.amount_capiba}
                            date={item.created_at} // Usando created_at para data de exibição
                        />
                    ))
                ) : (
                    <div style={{textAlign: 'center', padding: '40px 20px', color: '#999'}}>
                        <p style={{fontSize: '2rem', margin: '0 0 10px 0'}}>📭</p>
                        <p>Nenhuma movimentação ainda.</p>
                        <p style={{fontSize: '0.9rem'}}>Complete desafios ou treinos para ver seu histórico!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

const styles = {
    pageContainer: { 
        minHeight: '100vh', 
        backgroundColor: '#FAFAFA', // Fundo levemente cinza
        paddingTop: '20px' 
    },
    header: { 
        padding: '0 20px', 
        marginBottom: '20px' 
    },
    pageTitle: { margin: 0, color: '#E65100', fontSize: '1.8rem' },
    subtitle: { margin: '5px 0 0 0', color: '#666', fontSize: '0.9rem' },
    listCard: {
        backgroundColor: '#fff',
        borderRadius: '24px 24px 0 0', // Bordas arredondadas no topo
        padding: '20px',
        paddingBottom: '100px', // Espaço extra para o menu inferior não cobrir o último item
        minHeight: '60vh',
        boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
    }
};

export default Extrato;