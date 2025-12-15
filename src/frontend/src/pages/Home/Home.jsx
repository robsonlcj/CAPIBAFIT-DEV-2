import React, { useState, useRef, useContext } from 'react';
import CapibaraIcon from '../../assets/icon.png';
import StartButton from '../../components/StartButton/Start';
import { useBalance } from '../../hooks/useBalance'; 
import StreakDisplay from '../../components/StreakDisplay/StreakDisplay.jsx';
import streakService from '../../services/streakService'; 
import ChallengeList from '../../components/Challenges/ChallengeList.jsx';
import LiveActivityMap from '../../components/LiveMap/LiveActivityMap.jsx';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom'; 
import { toast } from 'react-toastify';

// Imports do Compartilhamento
import ShareCard from '../../components/ShareCard/ShareCard.jsx';
import ShareButton from '../../components/ShareButton/ShareButton.jsx';

function Home() {
    const navigate = useNavigate();
    const { saldo, isFirstLoading } = useBalance(5000); 
    
    // Pegamos o usuário do contexto de Autenticação
    const { user } = useContext(AuthContext);
    const userId = user?.user_id || 1;

    // Estados da Atividade e GPS
    const [isActivityActive, setIsActivityActive] = useState(false);
    const [currentDistance, setCurrentDistance] = useState(0); 
    const [updateTrigger, setUpdateTrigger] = useState(0);

    // Estados do Modal de Compartilhamento
    const [showShareModal, setShowShareModal] = useState(false);
    const [lastActivityStats, setLastActivityStats] = useState(null);
    const cardRef = useRef(null); 

    // Recebe atualização do Mapa
    const handleDistanceUpdate = (meters) => {
        setCurrentDistance(meters);
    };

    // Botão Iniciar / Parar
    const toggleActivity = async () => {
        if (!isActivityActive) {
            // --- INICIAR ---
            setIsActivityActive(true);
            setCurrentDistance(0);
            toast.info("GPS Iniciado! Bom treino 🏃‍♂️"); 

        } else {
            // --- PARAR ---
            setIsActivityActive(false);
            
            if (currentDistance > 5) {
                try {
                    const kmRodados = (currentDistance / 1000).toFixed(2);
                    const tempoSimulado = Math.ceil(currentDistance / 80); 
                    
                    await streakService.simulateActivity(userId, parseFloat(kmRodados));
                    
                    const capibasGanhos = Math.floor(parseFloat(kmRodados) * 30) || 5; 

                    setLastActivityStats({
                        km: kmRodados,
                        time: tempoSimulado,
                        capibas: capibasGanhos
                    });

                    toast.success(`Atividade Salva! +${capibasGanhos} Capibas 🪙`);
                    setShowShareModal(true);
                    setUpdateTrigger(prev => prev + 1);

                } catch (error) {
                    console.error("Erro ao salvar:", error);
                    toast.error("Erro ao salvar atividade. Tente novamente.");
                }
            } else {
                toast.warning("Distância muito curta para registrar! 😅");
            }
        }
    };

    return (
        <div className="home-container" style={{ paddingBottom: '120px', position: 'relative' }}> 
            
            {/* --- MODAL DE COMPARTILHAMENTO --- */}
            {showShareModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 style={{color: '#444', margin: '0 0 10px 0'}}>Parabéns! 🎉</h3>
                        <p style={{marginBottom: '20px', color: '#666', fontSize: '0.9rem'}}>
                            Compartilhe seu resultado:
                        </p>
                        
                        <div style={{ transform: 'scale(0.9)' }}> 
                            <ShareCard ref={cardRef} stats={lastActivityStats} />
                        </div>
                        
                        <div style={{marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '12px', width: '100%'}}>
                            <ShareButton captureRef={cardRef} />
                            
                            <button 
                                onClick={() => setShowShareModal(false)}
                                style={styles.closeButton}
                            >
                                Fechar e Voltar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cabeçalho */}
            <div style={styles.headerTop}>
                <div 
                    onClick={() => navigate('/profile')} 
                    style={{cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px'}}
                >
                    <h3 style={{ margin: 0, color: '#444', fontSize: '1.2rem' }}>
                        Olá, {user?.name || 'Atleta'}! 🌿
                    </h3>
                    <span style={{fontSize: '0.8rem', color: '#E65100', fontWeight: 'bold'}}>(Perfil)</span>
                </div>

                <StreakDisplay key={updateTrigger} userId={userId} />
            </div>

            {/* Conteúdo Principal (Mapa ou Dashboard) */}
            {isActivityActive ? (
                <div style={{ padding: '0 20px' }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'end', marginBottom: '10px'}}>
                        <h2 style={{color: '#E65100', margin: 0}}>Atividade 🔥</h2>
                        <span style={{fontSize: '0.8rem', color: '#666'}}>GPS Ativo</span>
                    </div>
                    
                    {/* 👇 MAPA COM ALTURA FIXA PARA NÃO QUEBRAR O LAYOUT */}
                    <LiveActivityMap 
                        isActive={isActivityActive} 
                        onDistanceUpdate={handleDistanceUpdate} 
                        height="450px" 
                    />
                    
                    <p style={{textAlign: 'center', color: '#888', fontSize: '0.8rem', marginTop: '10px'}}>
                        Caminhe para desenhar sua rota!
                    </p>
                </div>
            ) : (
                <>
                    <div className="extrato-container">
                        <h2 className="extrato-titulo">Extrato de Capibas</h2>
                        <div className="total-acumulado-box">
                            <div className="icone-capibara-wrapper">
                                <img src={CapibaraIcon} alt="Capibara" className="icone-capibara" />
                            </div>
                            <div className="texto-valor-wrapper">
                                <p className="texto-acumulado">Total Acumulado</p>
                                <span className="valor-acumulado">{isFirstLoading ? "..." : saldo}</span>
                            </div>
                            <div className="icones-moeda-wrapper">
                                <span className="icone-moeda um"></span>
                                <span className="icone-moeda dois"></span>
                            </div>
                        </div>
                    </div>
                    
                    <div className='CardsDesafios' style={{ marginBottom: '30px' }}>
                        <ChallengeList viewMode="carousel" />
                    </div>
                </>
            )}

            {/* Botão Fixo no Rodapé */}
            <div style={styles.fixedBottomContainer}>
                <div onClick={toggleActivity} style={{ width: '100%' }}>
                    {isActivityActive ? (
                        <button style={styles.stopButton}>
                            PARAR E SALVAR ⏹️ ({(currentDistance/1000).toFixed(2)} km)
                        </button>
                    ) : (
                        <StartButton onClick={() => {}} />
                    )}
                </div>
            </div>
        </div>
    );
}

const styles = {
    headerTop: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '10px 20px', marginBottom: '10px'
    },
    fixedBottomContainer: {
        position: 'fixed', bottom: '70px', left: 0, width: '100%',
        padding: '20px', boxSizing: 'border-box',
        background: 'linear-gradient(to top, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
        display: 'flex', justifyContent: 'center', zIndex: 900
    },
    stopButton: {
        width: '100%', padding: '15px', backgroundColor: '#D32F2F', color: 'white',
        border: 'none', borderRadius: '12px', fontSize: '1.1rem', fontWeight: 'bold',
        boxShadow: '0 4px 15px rgba(211, 47, 47, 0.4)', cursor: 'pointer'
    },
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000,
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    },
    modalContent: {
        backgroundColor: '#fff', padding: '25px', borderRadius: '25px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: '350px',
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)'
    },
    closeButton: {
        background: '#f5f5f5', border: 'none', color: '#666',
        padding: '12px', borderRadius: '50px', cursor: 'pointer',
        fontWeight: 'bold', width: '100%'
    }
};

export default Home;