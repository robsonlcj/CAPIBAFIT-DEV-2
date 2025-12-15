import React, { useEffect, useState } from 'react';
import streakService from '../../services/streakService.js';
// Se você usar ícones de uma lib (ex: lucide-react ou fontawesome), importe aqui.
// Vou usar Emoji para garantir que funcione sem instalar nada extra.

const StreakDisplay = ({ userId }) => {
  const [streak, setStreak] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStreak = async () => {
      if (!userId) return;
      
      const data = await streakService.getStreak(userId);
      setStreak(data.current_streak);
      setLoading(false);
    };

    fetchStreak();
  }, [userId]);

  if (loading) return null; // Ou um spinner pequeno

  return (
    <div style={styles.container}>
      <div style={styles.iconWrapper}>
        <span style={styles.fire}>🔥</span>
      </div>
      <div style={styles.textWrapper}>
        <span style={styles.count}>{streak}</span>
        <span style={styles.label}>dias seguidos</span>
      </div>
    </div>
  );
};

// Estilização simples (CSS-in-JS) para facilitar
// Você pode mover isso para seu arquivo .css ou styled-components se preferir
const styles = {
  container: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#FFF0E6', // Fundo laranjinha claro
    padding: '8px 12px',
    borderRadius: '20px',
    border: '1px solid #FFD8BE',
    gap: '8px',
    width: 'fit-content'
  },
  fire: {
    fontSize: '1.2rem',
  },
  textWrapper: {
    display: 'flex',
    flexDirection: 'column',
    lineHeight: '1',
  },
  count: {
    fontWeight: 'bold',
    color: '#E65100', // Laranja escuro
    fontSize: '0.9rem',
  },
  label: {
    fontSize: '0.7rem',
    color: '#9E9E9E'
  }
};

export default StreakDisplay;