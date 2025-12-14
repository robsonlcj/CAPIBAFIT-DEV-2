import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Função para verificar se a rota está ativa (para pintar o ícone)
    const isActive = (path) => location.pathname === path;

    return (
        <div style={styles.container}>
            {/* Botão Home - Agora aponta para '/home' e não '/' */}
            <button 
                style={isActive('/home') ? styles.activeButton : styles.button} 
                onClick={() => navigate('/home')}
            >
                <span style={styles.icon}>🏠</span>
                <span style={styles.label}>Início</span>
            </button>

            {/* Botão Desafios */}
            <button 
                style={isActive('/desafios') ? styles.activeButton : styles.button} 
                onClick={() => navigate('/desafios')}
            >
                <span style={styles.icon}>🎯</span>
                <span style={styles.label}>Desafios</span>
            </button>

            {/* Botão Extrato */}
            <button 
                style={isActive('/extrato') ? styles.activeButton : styles.button} 
                onClick={() => navigate('/extrato')}
            >
                <span style={styles.icon}>📜</span>
                <span style={styles.label}>Extrato</span>
            </button>
        </div>
    );
};

const styles = {
    container: {
        position: 'fixed',
        bottom: 0,
        left: 0,
        width: '100%',
        height: '70px',
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e0e0e0',
        display: 'flex',
        justifyContent: 'space-around',
        alignItems: 'center',
        zIndex: 1000,
        boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
    },
    button: {
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#999',
        padding: '5px',
        width: '33%'
    },
    activeButton: {
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#E65100', // Cor Laranja do CapibaFit
        fontWeight: 'bold',
        padding: '5px',
        width: '33%'
    },
    icon: {
        fontSize: '1.5rem',
        marginBottom: '2px'
    },
    label: {
        fontSize: '0.75rem'
    }
};

export default BottomMenu;