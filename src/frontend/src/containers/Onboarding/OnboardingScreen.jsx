// src/containers/Onboarding/OnboardingScreen.jsx
import Home from '../Home/home'; 
import React, { useState, useEffect } from "react";
import axios from "axios"; 

// 🚨 FASE 2.1 & 2.2: Importando os componentes de UI
import WelcomeSlide from '../../components/Onboarding/WelcomeSlide.jsx';
import ChallengeCard from '../../components/Onboarding/ChallengeCard.jsx'; 

// Mapeamento para React Web
const View = 'div';
const Text = 'p';
const StyleSheet = { create: (s) => s }; 

// URL base da API
const API_URL = 'http://localhost:3001/api'; 

// 🚨 FASE 2.3: Estrutura de dados para os 4 slides de introdução.
const SLIDE_DATA = [
    {
        id: 1,
        iconSymbol: '👟', 
        title: 'Cada passo conta!',
        description: 'Transforme suas caminhadas, corridas e atividades físicas em recompensas reais.'
    },
    {
        id: 2,
        iconSymbol: '🏆', 
        title: 'Ganhe Capibas',
        description: 'Nossa moeda digital exclusiva que premia seu esforço e dedicação aos exercícios.'
    },
    {
        id: 3,
        iconSymbol: '📍', 
        title: 'Explore Recife',
        description: 'Visite pontos turísticos da cidade e ganhe bônus em Capibas ao se exercitar nesses locais.'
    },
    {
        id: 4,
        iconSymbol: '⚡', 
        title: 'Desafios e Conquistas',
        description: 'Complete metas, mantenha sequências ativas e desbloqueie medalhas especiais!'
    }
];


// Estilos de teste em linha (Ajustado para incluir o fullScreenContainer)
const testStyles = {
    centerContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    // 🚨 NOVO ESTILO: Container de tela cheia para o fluxo de slides
    fullScreenContainer: { 
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between', 
        height: '100vh',
        backgroundColor: '#fff',
        paddingBottom: 20, // Espaço para o botão
    },
    button: {
        backgroundColor: '#00cc66',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        width: '90%',
        margin: '0 auto', // Centraliza
        textAlign: 'center',
    },
    // Estilos antigos, mantidos por segurança
    mainContainer: {
        padding: '20px',
        backgroundColor: '#fff',
        height: '100vh', 
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
    }
};

// VARIÁVEL DE TESTE: Alterada para 'user123' para forçar a exibição do Onboarding
const userIdToTest = 'user123'; 

const OnboardingScreen = ({ navigation }) => {
    // FASE 1: Lógica Condicional
    const [isLoading, setIsLoading] = useState(true); 
    const [hasCompletedChallenge, setHasCompletedChallenge] = useState(false); 
    
    // 🚨 FASE 2.3: Estado para controlar o slide atual
    const [currentSlideIndex, setCurrentSlideIndex] = useState(0); 
    
    // 🚨 FASE 3.3 (Preparação): Estado para controlar o loading do botão Aceitar
    const [isAcceptingChallenge, setIsAcceptingChallenge] = useState(false); 

    useEffect(() => {
        // ... (Lógica de fetchUserStatus permanece a mesma) ...
        const fetchUserStatus = async () => {
            try {
                const response = await axios.get(`${API_URL}/users/me?userId=${userIdToTest}`);
                const userData = response.data;
                const isCompleted = userData && userData.welcome_challenge_completed === 'S';
                setHasCompletedChallenge(isCompleted);

            } catch (error) {
                console.error("Erro ao buscar status do usuário. Exibindo Onboarding por segurança.", error);
                setHasCompletedChallenge(false);

            } finally {
                setIsLoading(false);
            }
        };

        fetchUserStatus();
    }, []); 
    
    // 🚨 FASE 2.3: Função de navegação para o próximo slide/tela
    const handleNextSlide = () => {
        setCurrentSlideIndex(currentSlideIndex + 1);
    };

    // --------------------------------------
    // 3. Controle lógico: carregamento e redirecionamento (Fase 1.4)
    // --------------------------------------

    if (isLoading) {
        return (
            <View style={testStyles.centerContainer}>
                <Text>Carregando dados do usuário...</Text>
            </View>
        );
    }

    if (hasCompletedChallenge) {
        return <Home />;
    }

    // --------------------------------------
    // 4. Renderização principal (Fluxo de Onboarding - FASE 2.3)
    // --------------------------------------

    const isTutorialSlide = currentSlideIndex < SLIDE_DATA.length;

    // Renderiza a tela do Tutorial (Slides 1 a 4)
    if (isTutorialSlide) {
        const currentSlide = SLIDE_DATA[currentSlideIndex];
        const isLastSlide = currentSlideIndex === SLIDE_DATA.length - 1;

        return (
            <View style={testStyles.fullScreenContainer}>
                <WelcomeSlide 
                    title={currentSlide.title}
                    description={currentSlide.description}
                    iconSymbol={currentSlide.iconSymbol}
                />
                
                {/* Botão de Próximo e Pular */}
                <button 
                    style={testStyles.button} 
                    onClick={handleNextSlide}
                >
                    {isLastSlide ? 'Começar Desafio' : 'Próximo'}
                </button>
            </View>
        );
    } 
    // Renderiza o Cartão do Desafio (Após o Slide 4)
    else {
        return (
            <ChallengeCard 
                // handleAcceptChallenge será implementado na Fase 3
                onAccept={handleNextSlide} // Usamos handleNextSlide como placeholder por enquanto
                isAccepting={isAcceptingChallenge} 
            />
        );
    }
};

export default OnboardingScreen;