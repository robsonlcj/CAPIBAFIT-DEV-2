import React, { forwardRef } from 'react';
import CapibaraIcon from '../../assets/icon.png'; // Garanta que o caminho está certo

// Usamos forwardRef para que o botão de compartilhar consiga "enxergar" esse componente para tirar o print
const ShareCard = forwardRef(({ stats, userDetails }, ref) => {
  return (
    <div ref={ref} style={styles.cardContainer}>
      {/* Cabeçalho do Card */}
      <div style={styles.header}>
        <div style={styles.logoRow}>
          <span style={{ fontSize: '1.5rem' }}>🌿</span>
          <h2 style={styles.brandName}>CapibaFit</h2>
        </div>
        <p style={styles.date}>{new Date().toLocaleDateString('pt-BR')}</p>
      </div>

      {/* Conteúdo Central (Stats) */}
      <div style={styles.body}>
        <div style={styles.mainStat}>
          <h1 style={styles.bigNumber}>{stats.km || '0.0'}</h1>
          <span style={styles.unit}>km percorridos</span>
        </div>

        <div style={styles.grid}>
          <div style={styles.gridItem}>
            <span style={styles.label}>Capibas</span>
            <span style={styles.value}>+{stats.capibas || 0} 🪙</span>
          </div>
          <div style={styles.gridItem}>
            <span style={styles.label}>Tempo</span>
            <span style={styles.value}>{stats.time || '0'} min</span>
          </div>
        </div>
      </div>

      {/* Rodapé com a Capivara */}
      <div style={styles.footer}>
        <div style={styles.message}>
          <span>Hoje tá pago! 🔥</span>
        </div>
        <img src={CapibaraIcon} alt="Capibara" style={styles.mascot} />
      </div>
    </div>
  );
});

// Estilos inline para garantir que saiam na foto (CSS modules as vezes falham no html2canvas)
const styles = {
  cardContainer: {
    width: '300px', // Tamanho fixo ideal para Stories/Status
    height: '500px',
    background: 'linear-gradient(135deg, #FF9966 0%, #FF5E62 100%)', // Gradiente Laranja bonito
    borderRadius: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '24px',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
    position: 'relative', // Para posicionar elementos absolutos se precisar
    overflow: 'hidden'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    opacity: 0.9
  },
  logoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  brandName: {
    margin: 0,
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  date: {
    fontSize: '0.8rem',
    margin: 0
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    marginTop: '-40px' // Ajuste visual
  },
  mainStat: {
    textAlign: 'center',
  },
  bigNumber: {
    fontSize: '5rem',
    fontWeight: '800',
    margin: 0,
    lineHeight: 1,
    textShadow: '2px 2px 0px rgba(0,0,0,0.1)'
  },
  unit: {
    fontSize: '1.2rem',
    textTransform: 'uppercase',
    letterSpacing: '2px',
    opacity: 0.9
  },
  grid: {
    display: 'flex',
    gap: '30px',
    marginTop: '20px',
    background: 'rgba(255,255,255,0.2)',
    padding: '15px 25px',
    borderRadius: '15px',
    backdropFilter: 'blur(5px)'
  },
  gridItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  label: {
    fontSize: '0.8rem',
    opacity: 0.9
  },
  value: {
    fontSize: '1.2rem',
    fontWeight: 'bold'
  },
  footer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end'
  },
  message: {
    background: '#fff',
    color: '#FF5E62',
    padding: '8px 16px',
    borderRadius: '20px',
    fontWeight: 'bold',
    fontSize: '0.9rem',
    marginBottom: '10px'
  },
  mascot: {
    width: '80px',
    height: '80px',
    objectFit: 'contain',
    filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.2))'
  }
};

export default ShareCard;