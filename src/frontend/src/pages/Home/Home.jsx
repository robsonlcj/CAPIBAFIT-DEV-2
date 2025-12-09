import React, { useState } from 'react';
import CapibaraIcon from '../../assets/icon.png';
import StartButton from '../../components/StartButton/Start';
import { useBalance } from '../../hooks/useBalance'; 
import StreakDisplay from '../../components/StreakDisplay/StreakDisplay.jsx';
// Importamos o serviço para falar com o backend
import streakService from '../../services/streakService'; 

function Home() {
    const { saldo, isFirstLoading } = useBalance(5000); 
    const userId = 1; // Usuário fixo para testes

    // Estado "gatilho" para forçar o StreakDisplay a recarregar
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // Função executada ao clicar no botão
    const handleActivityStart = async () => {
        try {
            console.log("🏃‍♂️ Iniciando atividade...");
            
            // 1. Chama o backend
            const response = await streakService.simulateActivity(userId);
            
            // 2. Feedback visual
            if (response && response.updated) {
                alert('Atividade registrada! 🔥 Streak atualizado!');
            } else {
                alert('Atividade registrada! (Você já treinou hoje, continue assim!)');
            }

            // 3. Atualiza o contador do foguinho mudando o estado
            setUpdateTrigger(prev => prev + 1);

        } catch (error) {
            console.error("Erro ao registrar:", error);
            alert('Erro de conexão ao registrar atividade.');
        }
    };

    return (
        <div className="home-container">
            
            {/* O key={updateTrigger} faz o componente recarregar quando o valor muda */}
            <div style={styles.headerTop}>
                <h3 style={{ margin: 0, color: '#444', fontSize: '1.2rem' }}>Olá, Atleta! 🌿</h3>
                <StreakDisplay key={updateTrigger} userId={userId} />
            </div>

            <div className="extrato-container">
                <h2 className="extrato-titulo">Extrato de Capibas</h2>

                <div className="total-acumulado-box">
                    <div className="icone-capibara-wrapper">
                        <img src={CapibaraIcon} alt="Ícone de Capibara" className="icone-capibara" />
                    </div>
                    
                    <div className="texto-valor-wrapper">
                        <p className="texto-acumulado">Total Acumulado</p>
                        <span className="valor-acumulado">
                            {isFirstLoading ? "..." : saldo}
                        </span>
                    </div>
                    
                    <div className="icones-moeda-wrapper">
                        <span className="icone-moeda um" aria-hidden="true"></span>
                        <span className="icone-moeda dois" aria-hidden="true"></span>
                    </div>
                </div>
            </div>

            <div className='StartButton'>
                {/* Conectamos a função ao clique */}
                <StartButton onClick={handleActivityStart} />
            </div>
            
            <div className='CardsDesafios'></div>
        </div>
    );
}

const styles = {
    headerTop: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px 20px',
        marginBottom: '10px'
    }
};

export default Home;