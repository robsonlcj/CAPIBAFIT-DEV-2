import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom'; // <--- Importamos o useNavigate
import ChallengeCard from './ChallengeCard';
import api from '../../services/api';

const ChallengeList = ({ viewMode = 'carousel' }) => {
  const [desafios, setDesafios] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const navigate = useNavigate(); // <--- Instanciamos o hook
  
  // Pegamos o ID do usuário do localStorage ou usamos 1 fixo
  // (Idealmente viria por prop, mas para manter simples mantemos assim)
  const user = JSON.parse(localStorage.getItem('capiba_user'));
  const userId = user?.user_id || 1;

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const response = await api.get(`/users/${userId}/challenges`);
        setDesafios(response.data);
      } catch (error) {
        console.error("Erro ao carregar desafios:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, [userId]);

  if (loading) return <div style={{padding: '20px', color: '#888'}}>Carregando...</div>;

  const containerStyle = viewMode === 'grid' ? styles.gridContainer : styles.scrollContainer;

  return (
    <div style={styles.container}>
      {/* Cabeçalho (Só aparece na Home/Carrossel) */}
      {viewMode === 'carousel' && (
        <div style={styles.header}>
          <h3 style={styles.title}>Desafios Ativos 🎯</h3>
          
          {/* --- AQUI ESTÁ A MUDANÇA --- */}
          <span 
            style={styles.seeAll} 
            onClick={() => navigate('/desafios')} // Redireciona ao clicar
          >
            Ver todos
          </span>
          {/* --------------------------- */}
        
        </div>
      )}
      
      <div style={containerStyle}>
        {desafios.length > 0 ? (
          desafios.map(desafio => (
            <ChallengeCard 
              key={desafio.id}
              title={desafio.title}
              reward={desafio.reward}
              current={desafio.current}
              target={desafio.target}
              type={desafio.type}
            />
          ))
        ) : (
          <p style={{marginLeft: '20px', color: '#999'}}>Nenhum desafio encontrado.</p>
        )}
        
        {viewMode === 'carousel' && <div style={{ minWidth: '10px' }} />}
      </div>
    </div>
  );
};

const styles = {
  container: { 
    marginTop: '20px', 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '10px',
    width: '100%' 
  },
  header: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    padding: '0 20px' 
  },
  title: { margin: 0, fontSize: '1.1rem', color: '#444' },
  
  // Estilo atualizado com cursor pointer
  seeAll: { 
    fontSize: '0.9rem', 
    color: '#E65100', 
    cursor: 'pointer', // Mãozinha ao passar o mouse
    fontWeight: 'bold' 
  },
  
  scrollContainer: {
    display: 'flex', 
    gap: '15px', 
    overflowX: 'auto', 
    padding: '10px 20px',
    scrollBehavior: 'smooth', 
    scrollbarWidth: 'none', 
    msOverflowStyle: 'none',
  },

  gridContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    padding: '0 20px 80px 20px',
    width: '100%',
    boxSizing: 'border-box'
  }
};

export default ChallengeList;