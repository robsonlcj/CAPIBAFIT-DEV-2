import React from 'react';

const TransactionItem = ({ type, details, amount, date }) => {
    // Formata a data para o padrão brasileiro (Dia/Mês - Hora:Min)
    const dataFormatada = new Date(date).toLocaleDateString('pt-BR', {
        day: '2-digit', 
        month: '2-digit', 
        hour: '2-digit', 
        minute: '2-digit'
    });

    // Lógica visual: Verde para bônus, Laranja para atividades físicas
    // O tipo 'streak' ou 'bonus' ganha destaque verde
    const isBonus = type === 'bonus' || type === 'streak' || type === 'welcome';
    
    const icon = isBonus ? '🎁' : '🏃‍♂️';
    const color = isBonus ? '#4CAF50' : '#E65100'; 
    const bgColor = isBonus ? '#E8F5E9' : '#FFF3E0';

    return (
        <div style={styles.itemContainer}>
            <div style={styles.leftSide}>
                <div style={{...styles.iconBox, backgroundColor: bgColor}}>
                    {icon}
                </div>
                <div style={styles.info}>
                    <span style={styles.title}>
                        {isBonus ? 'Recompensa' : 'Atividade Física'}
                    </span>
                    <span style={styles.subtitle}>
                        {details || 'Sem detalhes'}
                    </span>
                </div>
            </div>

            <div style={styles.rightSide}>
                <span style={{...styles.amount, color: color}}>
                    +{amount}
                </span>
                <span style={styles.date}>{dataFormatada}</span>
            </div>
        </div>
    );
};

const styles = {
    itemContainer: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 0',
        borderBottom: '1px solid #f0f0f0'
    },
    leftSide: { display: 'flex', gap: '12px', alignItems: 'center' },
    iconBox: {
        width: '40px', height: '40px',
        borderRadius: '50%',
        display: 'flex', justifyContent: 'center', alignItems: 'center',
        fontSize: '1.2rem'
    },
    info: { display: 'flex', flexDirection: 'column' },
    title: { fontWeight: 'bold', fontSize: '0.9rem', color: '#333' },
    subtitle: { fontSize: '0.75rem', color: '#888', maxWidth: '180px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    rightSide: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
    amount: { fontWeight: 'bold', fontSize: '1rem' },
    date: { fontSize: '0.7rem', color: '#aaa', marginTop: '2px' }
};

export default TransactionItem;