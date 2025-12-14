import React from 'react';

const ChallengeCard = ({ title, reward, current, target, type }) => {
  // Calcula a porcentagem para a barra de progresso
  const progressPercent = Math.min((current / target) * 100, 100);
  const isCompleted = current >= target;

  return (
    <div style={styles.card}>
      <div style={styles.header}>
        <span style={styles.icon}>{type === 'streak' ? '🔥' : '👟'}</span>
        <span style={styles.reward}>+{reward} 🪙</span>
      </div>
      
      <h4 style={styles.title}>{title}</h4>
      
      <div style={styles.progressContainer}>
        <div style={styles.progressBarBg}>
          <div 
            style={{
              ...styles.progressBarFill, 
              width: `${progressPercent}%`,
              backgroundColor: isCompleted ? '#4CAF50' : '#FF9800' // Verde se completou, Laranja se não
            }} 
          />
        </div>
        <p style={styles.progressText}>
          {current}/{target} {type === 'streak' ? 'dias' : 'km'}
        </p>
      </div>

      <button style={isCompleted ? styles.btnCompleted : styles.btnActive}>
        {isCompleted ? 'Resgatar' : 'Em andamento'}
      </button>
    </div>
  );
};

const styles = {
  card: {
    minWidth: '160px', // Tamanho fixo para o carrossel
    backgroundColor: '#fff',
    borderRadius: '16px',
    padding: '16px',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    gap: '10px',
    border: '1px solid #f0f0f0'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '5px'
  },
  icon: {
    fontSize: '1.2rem',
    background: '#FFF0E6',
    padding: '5px',
    borderRadius: '8px'
  },
  reward: {
    fontSize: '0.8rem',
    fontWeight: 'bold',
    color: '#FF9800',
    background: '#FFF8E1',
    padding: '4px 8px',
    borderRadius: '12px'
  },
  title: {
    margin: '0',
    fontSize: '0.95rem',
    color: '#333',
    lineHeight: '1.3'
  },
  progressContainer: {
    width: '100%'
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: '#E0E0E0',
    borderRadius: '3px',
    overflow: 'hidden',
    marginBottom: '4px'
  },
  progressBarFill: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.3s ease'
  },
  progressText: {
    margin: 0,
    fontSize: '0.75rem',
    color: '#999',
    textAlign: 'right'
  },
  btnActive: {
    border: 'none',
    background: '#f5f5f5',
    color: '#888',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    cursor: 'default',
    fontWeight: 'bold'
  },
  btnCompleted: {
    border: 'none',
    background: '#4CAF50',
    color: '#fff',
    padding: '8px',
    borderRadius: '8px',
    fontSize: '0.8rem',
    cursor: 'pointer',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(76, 175, 80, 0.3)'
  }
};

export default ChallengeCard;