import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api'; // Importe sua API

const WelcomeChallengeScreen = () => {
  const navigate = useNavigate();
  const { user, login } = useContext(AuthContext); // Precisamos do login para atualizar o estado local

  const handleAccept = async () => {
    try {
        if (user?.user_id) {
            // 1. Avisa o Backend que terminou
            await api.post(`/users/${user.user_id}/complete-onboarding`);
            
            // 2. Atualiza o contexto local para o app não redirecionar de volta
            // Criamos um novo objeto de usuário com first_login falso
            const updatedUser = { ...user, first_login: false, welcome_challenge_completed: 'S' };
            login(updatedUser);
        }
        
        // 3. Vai para a Home
        navigate('/home');

    } catch (error) {
        console.error("Erro ao finalizar onboarding:", error);
        navigate('/home'); // Vai mesmo com erro para não travar
    }
  };

  return (
    <div style={{ padding: 20, textAlign: 'center', paddingTop: 100 }}>
      <h1>Desafio Aceito! 🚀</h1>
      <p>Sua jornada começa agora.</p>
      
      <button 
        onClick={handleAccept} 
        style={{
            marginTop: 30, padding: '15px 30px', background: '#E65100', 
            color: 'white', border: 'none', borderRadius: 10, fontSize: '1.2rem'
        }}
      >
        Bora pra Home!
      </button>
    </div>
  );
};

export default WelcomeChallengeScreen;