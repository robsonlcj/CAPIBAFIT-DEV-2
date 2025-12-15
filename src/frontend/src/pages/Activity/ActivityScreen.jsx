import React, { useState, useRef, useContext, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { ArrowLeft, MapPin, AlertTriangle } from 'lucide-react';

// Contexto e Serviços
import { AuthContext } from '../../context/AuthContext';
import streakService from '../../services/streakService';

// Componentes
import LiveActivityMap from '../../components/LiveMap/LiveActivityMap.jsx'; 
import ShareCard from '../../components/ShareCard/ShareCard.jsx';
import ShareButton from '../../components/ShareButton/ShareButton.jsx';

export default function ActivityScreen() {
    const navigate = useNavigate();
    const location = useLocation();
    
    // Dados do Ponto Turístico
    const { targetSpot } = location.state || {};

    const { user } = useContext(AuthContext);
    const userId = user?.user_id || 1;

    // Estados
    const [currentDistance, setCurrentDistance] = useState(0); // Distância percorrida na atividade
    const [userLocation, setUserLocation] = useState(null); // Localização atual [lat, lon]
    const [isSaving, setIsSaving] = useState(false);
    
    // Modais
    const [showShareModal, setShowShareModal] = useState(false);
    const [showEarlyExitModal, setShowEarlyExitModal] = useState(false); // Modal de aviso de saída antecipada
    
    const [lastActivityStats, setLastActivityStats] = useState(null);
    const cardRef = useRef(null);

    // Feedback inicial ao entrar na tela
    useEffect(() => {
        toast.info(targetSpot ? `Indo para: ${targetSpot.name} 🗺️` : "Atividade Iniciada!");
    }, [targetSpot]);

    // Função auxiliar para calcular distância em linha reta até o destino (Haversine)
    const getDistanceToTarget = () => {
        if (!userLocation || !targetSpot) return 999999; // Retorna infinito se não tiver dados
        
        const [lat1, lon1] = userLocation;
        const lat2 = parseFloat(targetSpot.latitude);
        const lon2 = parseFloat(targetSpot.longitude);

        const R = 6371e3; // Raio da Terra em metros
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        
        return R * c; // Distância em metros
    };

    // Ação do Botão "PARAR E SALVAR"
    const handleStopClick = () => {
        // Se tem um destino turístico, verifica se chegou perto
        if (targetSpot) {
            const distToTarget = getDistanceToTarget();
            const RAIO_ACEITAVEL = 100; // Tolerância de 100 metros

            // Se estiver longe do destino (ex: > 100m), mostra aviso
            if (distToTarget > RAIO_ACEITAVEL) {
                setShowEarlyExitModal(true);
                return;
            }
        }
        
        // Se não tiver destino ou já estiver no local, finaliza com sucesso total
        finishActivity(true);
    };

    // Função que processa o salvamento (Com ou sem bônus)
    const finishActivity = async (applyBonus) => {
        setIsSaving(true);
        setShowEarlyExitModal(false); // Garante que o modal de aviso feche

        // Validação mínima de movimento (ex: > 5 metros) para evitar salvar cliques acidentais
        if (currentDistance >= 0) { 
            try {
                const kmRodados = (currentDistance / 1000).toFixed(2);
                const tempoSimulado = Math.ceil(currentDistance / 80); // Estimativa de tempo (80m/min)
                
                // Salva a atividade no backend (Conta para o Streak e Saldo Base)
                await streakService.simulateActivity(userId, parseFloat(kmRodados));
                
                // Cálculo de Capibas
                let baseCapibas = Math.floor(parseFloat(kmRodados) * 30) || 5;
                
                // Lógica do Multiplicador
                if (applyBonus && targetSpot && targetSpot.multiplier) {
                    baseCapibas = Math.floor(baseCapibas * targetSpot.multiplier);
                    toast.success(`🎯 Chegou no destino! Bônus ${targetSpot.multiplier}x aplicado!`);
                } else if (targetSpot && !applyBonus) {
                    toast.warning("Finalizado antes do destino. Bônus perdido.");
                }

                // Prepara dados para o Card de Compartilhamento
                setLastActivityStats({
                    km: kmRodados,
                    time: tempoSimulado,
                    capibas: baseCapibas,
                    spotName: applyBonus ? targetSpot?.name : "Caminhada (Incompleta)"
                });

                setShowShareModal(true);

            } catch (error) {
                console.error("Erro ao salvar:", error);
                toast.error("Erro ao salvar atividade.");
            }
        } else {
            toast.warning("Distância muito curta para registrar!");
        }
        setIsSaving(false);
    };

    // Fechar modal final e voltar para Home
    const handleCloseModal = () => {
        setShowShareModal(false);
        navigate('/home'); 
    };

    return (
        <div className="h-screen flex flex-col bg-white relative">
            
            {/* --- HEADER FLUTUANTE --- */}
            <div className="absolute top-0 left-0 w-full z-20 p-4 bg-gradient-to-b from-white via-white/90 to-transparent pointer-events-none">
                <div className="flex items-center gap-3 pointer-events-auto">
                    <button 
                        onClick={() => navigate(-1)} 
                        className="bg-white p-2 rounded-full shadow-md border border-gray-100 text-gray-600"
                    >
                        <ArrowLeft size={24} />
                    </button>
                    
                    {targetSpot ? (
                        <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-sm border border-orange-100 flex-1">
                            <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Destino</p>
                            <h2 className="text-lg font-bold text-orange-600 leading-tight flex items-center gap-1">
                                <MapPin size={16} /> {targetSpot.name}
                            </h2>
                        </div>
                    ) : (
                        <h2 className="text-xl font-bold text-gray-800">Treino Livre</h2>
                    )}
                </div>
            </div>

            {/* --- MAPA --- */}
            <div className="flex-1 w-full h-full relative z-0">
                <LiveActivityMap 
                    isActive={true} 
                    onDistanceUpdate={setCurrentDistance} // Atualiza distância percorrida
                    onLocationUpdate={setUserLocation}    // Atualiza onde eu estou (para checar meta)
                    targetSpot={targetSpot} 
                />
            </div>

            {/* --- CONTROLES INFERIORES --- */}
            <div className="absolute bottom-0 left-0 w-full z-20 p-6 bg-gradient-to-t from-white via-white to-transparent pb-10">
                <div className="bg-white p-4 rounded-2xl shadow-xl border border-gray-100 mb-4 flex justify-between items-center">
                    <div>
                        <p className="text-xs text-gray-400 font-bold">DISTÂNCIA</p>
                        <p className="text-2xl font-bold text-gray-800">{(currentDistance / 1000).toFixed(2)} <span className="text-sm text-gray-500">km</span></p>
                    </div>
                    {targetSpot && (
                        <div className="text-right">
                            <p className="text-xs text-orange-400 font-bold">BÔNUS POTENCIAL</p>
                            <p className="text-xl font-bold text-orange-600">{targetSpot.multiplier}x</p>
                        </div>
                    )}
                </div>

                <button 
                    onClick={handleStopClick}
                    disabled={isSaving}
                    className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-200 hover:bg-red-700 transition active:scale-95 flex justify-center items-center gap-2"
                >
                    {isSaving ? "Salvando..." : "PARAR E SALVAR ⏹️"}
                </button>
            </div>

            {/* --- MODAL DE AVISO (SAÍDA ANTECIPADA) --- */}
            {showEarlyExitModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <div className="bg-orange-100 p-4 rounded-full mb-4 text-orange-600">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 text-center mb-2">Você ainda não chegou!</h3>
                        <p className="text-sm text-gray-500 text-center mb-6 leading-relaxed">
                            O destino <b>{targetSpot?.name}</b> está a alguns metros. 
                            <br/><br/>
                            Se finalizar agora, você ganha as Capibas da caminhada, mas <b className="text-red-500">perde o bônus de {targetSpot?.multiplier}x</b>.
                        </p>
                        
                        <div className="flex flex-col gap-3 w-full">
                            <button 
                                onClick={() => setShowEarlyExitModal(false)}
                                className="w-full py-3 bg-green-500 text-white rounded-xl font-bold shadow-lg shadow-green-200 hover:bg-green-600"
                            >
                                Continuar Caminhando
                            </button>
                            <button 
                                onClick={() => finishActivity(false)} // Passa false = SEM bônus
                                className="w-full py-3 bg-gray-100 text-gray-500 rounded-xl font-bold hover:bg-gray-200"
                            >
                                Finalizar sem Bônus
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- MODAL DE RESULTADO FINAL --- */}
            {showShareModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Atividade Finalizada! 🚩</h3>
                        <div style={{ transform: 'scale(0.9)' }}> 
                            <ShareCard ref={cardRef} stats={lastActivityStats} />
                        </div>
                        <div className="mt-4 flex flex-col gap-3 w-full">
                            <ShareButton captureRef={cardRef} />
                            <button 
                                onClick={handleCloseModal}
                                className="w-full py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200"
                            >
                                Voltar para Início
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    modalOverlay: {
        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 3000,
        display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px'
    },
    modalContent: {
        backgroundColor: '#fff', padding: '25px', borderRadius: '25px',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        width: '100%', maxWidth: '350px'
    }
};