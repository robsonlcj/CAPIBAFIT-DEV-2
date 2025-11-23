import React from 'react';

// Mapeamento para tags Web/HTML
const View = 'div';
const Text = 'p';
const StyleSheet = { create: (s) => s };

// Estilos específicos para o cartão de desafio
const cardStyles = StyleSheet.create({
    fullContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#f9f9f9',
        height: '100vh', // Ocupa a tela inteira
    },
    // Estilos do cabeçalho (Desafio de Boas-Vindas)
    headerIcon: {
        fontSize: 60,
        color: '#00cc66',
        marginBottom: 10,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#ff9900', // Cor do título CapibaFit
        marginBottom: 5,
    },
    headerSubtitle: {
        fontSize: 16,
        color: '#666',
        marginBottom: 30,
    },
    // Estilos do cartão principal (Regras)
    mainCard: {
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 25,
        width: '90%',
        maxWidth: 400,
        boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        marginBottom: 30,
        textAlign: 'center',
    },
    bonusTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
    },
    // Botões de ação
    buttonAccept: {
        backgroundColor: '#00cc66',
        color: 'white',
        padding: '12px 20px',
        borderRadius: 8,
        fontSize: 18,
        fontWeight: 'bold',
        cursor: 'pointer',
        border: 'none',
        marginTop: 20,
        width: '100%',
    },
    buttonSkip: {
        fontSize: 14,
        color: '#999',
        cursor: 'pointer',
        marginTop: 15,
        textDecoration: 'underline',
    }
});

// Componente burro que exibe o cartão e recebe a ação do clique.
const ChallengeCard = ({ onAccept, isAccepting }) => {
    return (
        <View style={cardStyles.fullContainer}>
            {/* Cabeçalho */}
            <Text style={cardStyles.headerIcon}>🎁</Text>
            <Text style={cardStyles.headerTitle}>Desafio de Boas-Vindas!</Text>
            <Text style={cardStyles.headerSubtitle}>Oferta exclusiva para novos usuários</Text>

            {/* Cartão de Detalhes */}
            <View style={cardStyles.mainCard}>
                <Text style={cardStyles.bonusTitle}>Ganhe o Dobro de Capibas!</Text>
                <Text>
                    Complete **1 km** de qualquer atividade física e ganhe **60 Capibas** (equivalente a 2 km)!
                </Text>

                {/* Regras */}
                <ol style={{ textAlign: 'left', marginTop: 15, listStylePosition: 'inside' }}>
                    <li><Text>Escolha entre Caminhada, Corrida ou Bicicleta</Text></li>
                    <li><Text>Complete apenas 1 km de distância</Text></li>
                    <li><Text>Receba 60 Capibas automaticamente!</Text></li>
                </ol>
            </View>

            {/* Ações */}
            <button style={cardStyles.buttonAccept} onClick={onAccept} disabled={isAccepting}>
                {isAccepting ? 'Aguarde...' : 'Aceitar Desafio →'}
            </button>
            <Text style={cardStyles.buttonSkip} onClick={() => onAccept(false)}>
                Pular por enquanto
            </Text>
        </View>
    );
};

export default ChallengeCard;