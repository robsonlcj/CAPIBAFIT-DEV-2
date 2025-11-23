import React from 'react';

// Mapeamento para tags Web/HTML para que o Vite compile (necessário no ambiente atual)
const View = 'div';
const Text = 'p';
// Mantém StyleSheet.create como um placeholder para simular estilos React Native
const StyleSheet = { create: (s) => s };

// Estilos básicos do Slide (focar em centralizar e dar padding)
const slideStyles = StyleSheet.create({
    container: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
        height: '100%',
        textAlign: 'center',
    },
    iconContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: '#00cc66', // Cor primária do CapibaFit
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    description: {
        fontSize: 16,
        color: '#666',
        paddingHorizontal: 20,
    },
    // Placeholder para ícone
    iconText: {
        fontSize: 36,
        color: 'white',
    }
});

// Este é o componente burro (dumb component)
// Ele recebe o conteúdo (dados) via props e apenas foca na renderização.
const WelcomeSlide = ({ title, description, iconSymbol }) => {
    return (
        <View style={slideStyles.container}>
            {/* Bloco do Ícone */}
            <View style={slideStyles.iconContainer}>
                <Text style={slideStyles.iconText}>{iconSymbol}</Text>
            </View>
            
            {/* Título do Slide */}
            <Text style={slideStyles.title}>{title}</Text>
            
            {/* Descrição do Slide */}
            <Text style={slideStyles.description}>{description}</Text>
        </View>
    );
};

export default WelcomeSlide;