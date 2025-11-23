// src/containers/Onboarding/OnboardingScreen.jsx

import Home from '../Home/home'; // Importa o componente Home, usado como destino quando o desafio já foi concluído
import React, { useState, useEffect } from "react";
import axios from "axios"; 

// Mapeamento para React Web
const View = 'div';
const Text = 'p';
// Mantém StyleSheet.create como um placeholder
const StyleSheet = { create: (s) => s }; 

// URL base da API
const API_URL = 'http://localhost:3001/api'; 

// Estilos de teste em linha 
const testStyles = {
    centerContainer: {
        display: 'flex',
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
    },
    mainContainer: {
        padding: '20px',
        backgroundColor: '#fff',
        height: '100vh', // Adicionado para garantir que ocupe a tela
    },
    title: {
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '10px',
    }
};

// 🚨 VARIÁVEL DE TESTE: Definida globalmente para facilitar a troca entre usuários
const userIdToTest = 'tester02'; 

const OnboardingScreen = ({ navigation }) => {
    const [isLoading, setIsLoading] = useState(true); 
    const [hasCompletedChallenge, setHasCompletedChallenge] = useState(false); 

    useEffect(() => {
        const fetchUserStatus = async () => {
            try {
                // Requisita o status do usuário de teste
                const response = await axios.get(`${API_URL}/users/me?userId=${userIdToTest}`);
                const userData = response.data;

                // A flag retorna 'S' (sim) ou 'F' (não); interpretamos para boolean.
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

    // --------------------------------------
    // 3. Controle lógico: carregamento e redirecionamento
    // --------------------------------------

    if (isLoading) {
        return (
            <View style={testStyles.centerContainer}>
                <Text>Carregando dados do usuário...</Text>
            </View>
        );
    }

    // Teste 1: Se 'tester02' for o userId, esta condição deve ser TRUE e renderizar a Home.
    if (hasCompletedChallenge) {
        return <Home />;
    }

    // --------------------------------------
    // 4. Renderização padrão (fluxo do tutorial/onboarding)
    // --------------------------------------
    // Teste 2: Se 'user123' for o userId, esta seção deve ser renderizada.
    return (
        <View style={testStyles.mainContainer}>
            <Text style={testStyles.title}>Bem-vindo ao CapibaFit!</Text>
            <Text>Aqui você irá construir o fluxo do tutorial e desafio.</Text>
        </View>
    );
};

export default OnboardingScreen;