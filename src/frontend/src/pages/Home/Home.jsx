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
        <div className="home-container" style={{ paddingBottom: '120px', position: 'relative', backgroundColor: '#f5f7fa' }}> 
            
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

            {/* --- CABEÇALHO VERDE (NATUREZA) --- */}
            <div style={styles.headerTop}>
                <div 
                    onClick={() => navigate('/profile')} 
                    style={{cursor: 'pointer'}}
                >
                    <div style={{display: 'flex', alignItems: 'baseline', gap: '8px'}}>
                        {/* Texto em Verde Escuro para contraste */}
                        <h3 style={{ margin: 0, color: '#1B5E20', fontSize: '1.6rem', fontWeight: '800', letterSpacing: '-0.5px' }}>
                            Olá, {user?.name ? user.name.split(' ')[0] : 'Atleta'}!
                        </h3>
                    </div>
                </div>

                <div style={styles.streakBadge}>
                     <StreakDisplay key={updateTrigger} userId={userId} />
                </div>
            </div>

            {/* Conteúdo Principal */}
            {isActivityActive ? (
                <div style={{ padding: '20px', animation: 'fadeIn 0.5s ease' }}>
                    <div style={styles.activeHeader}>
                        <div>
                            <h2 style={{color: '#E65100', margin: 0, fontSize: '1.5rem', fontWeight: 'bold'}}>Treino Livre 🔥</h2>
                            <span style={{fontSize: '0.9rem', color: '#666'}}>GPS Rastreado</span>
                        </div>
                        <div style={styles.liveBadge}>
                            <span style={styles.pulseDot}></span> GRAVANDO
                        </div>
                    </div>
                    
                    <div style={styles.mapWrapper}>
                        <LiveActivityMap 
                            isActive={isActivityActive} 
                            onDistanceUpdate={handleDistanceUpdate} 
                            height="450px" 
                        />
                    </div>
                    
                    <div style={styles.tipContainer}>
                        <p style={styles.tipText}>
                           🚶 Caminhe pelo bairro para desenhar sua rota no mapa!
                        </p>
                    </div>
                </div>
            ) : (
                <div style={{ padding: '5px 20px 0 20px' }}> 
                    <div className="extrato-container">
                        <div className="total-acumulado-box" style={{marginTop: '0'}}>
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
                    
                    <div className='CardsDesafios' style={{ marginBottom: '30px', marginTop: '25px' }}>
                         <h3 style={{color: '#444', marginBottom: '15px', fontWeight: '700'}}>Desafios Ativos</h3>
                        <ChallengeList viewMode="carousel" />
                    </div>
                </div>
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
            
            <style>{`
                @keyframes pulse-red {
                    0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0.7); }
                    70% { transform: scale(1); box-shadow: 0 0 0 6px rgba(255, 82, 82, 0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(255, 82, 82, 0); }
                }
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}

const styles = {
    // --- Header Verde Clean ---
    headerTop: {
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        padding: '25px 25px', 
        // Degradê: Verde Pálido (quase branco) -> Verde Claro
        background: 'linear-gradient(to right, #F1F8E9, #C8E6C9)', 
        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        marginBottom: '10px'
    },
    streakBadge: {
        backgroundColor: 'rgba(255, 255, 255, 0.6)', 
        border: '1px solid rgba(27, 94, 32, 0.1)', // Borda sutil verde
        borderRadius: '20px',
        padding: '5px 15px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minWidth: '100px',
        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
    },
    // ---------------------------------
    activeHeader: {
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '15px', padding: '0 5px'
    },
    liveBadge: {
        backgroundColor: '#FFEBEE', color: '#D32F2F', 
        padding: '6px 12px', borderRadius: '20px', 
        fontSize: '0.75rem', fontWeight: 'bold', letterSpacing: '1px',
        display: 'flex', alignItems: 'center', gap: '6px',
        border: '1px solid #FFCDD2'
    },
    pulseDot: {
        width: '8px', height: '8px', backgroundColor: '#D32F2F',
        borderRadius: '50%', display: 'inline-block',
        animation: 'pulse-red 2s infinite'
    },
    mapWrapper: {
        borderRadius: '24px', overflow: 'hidden',
        boxShadow: '0 10px 30px -10px rgba(0,0,0,0.15)',
        border: '4px solid white',
        marginBottom: '15px'
    },
    tipContainer: {
        display: 'flex', justifyContent: 'center', marginTop: '5px'
    },
    tipText: {
        textAlign: 'center', color: '#888', fontSize: '0.85rem', 
        backgroundColor: '#F5F5F5', padding: '8px 16px', borderRadius: '20px',
        display: 'inline-block'
    },
    fixedBottomContainer: {
        position: 'fixed', bottom: '70px', left: 0, width: '100%',
        padding: '20px', boxSizing: 'border-box',
        background: 'linear-gradient(to top, rgba(255,255,255,1) 50%, rgba(255,255,255,0) 100%)',
        display: 'flex', justifyContent: 'center', zIndex: 900
    },
    stopButton: {
        width: '100%', padding: '16px', backgroundColor: '#D32F2F', color: 'white',
        border: 'none', borderRadius: '16px', fontSize: '1.1rem', fontWeight: 'bold',
        boxShadow: '0 8px 20px rgba(211, 47, 47, 0.3)', cursor: 'pointer',
        transition: 'transform 0.2s',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px'
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