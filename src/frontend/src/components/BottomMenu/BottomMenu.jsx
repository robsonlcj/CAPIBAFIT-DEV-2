import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
// Importamos os ícones da Lucide para um visual mais profissional de App
import { Home, Target, FileText, MapPin } from 'lucide-react';

const BottomMenu = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Função auxiliar para verificar ativo
    const isActive = (path) => location.pathname === path;

    // Helpers para cor e estilo dinâmico
    const getButtonStyle = (path) => isActive(path) ? styles.activeButton : styles.button;
    const getIconColor = (path) => isActive(path) ? '#E65100' : '#999';

    return (
        <div style={styles.container}>
            {/* Botão Home */}
            <button 
                style={getButtonStyle('/home')} 
                onClick={() => navigate('/home')}
            >
                <Home size={24} color={getIconColor('/home')} />
                <span style={styles.label}>Início</span>
            </button>

            {/* Botão Desafios */}
            <button 
                style={getButtonStyle('/desafios')} 
                onClick={() => navigate('/desafios')}
            >
                <Target size={24} color={getIconColor('/desafios')} />
                <span style={styles.label}>Desafios</span>
            </button>

            {/* NOVO: Botão Pontos Turísticos */}
            <button 
                style={getButtonStyle('/tourist-spots')} 
                onClick={() => navigate('/tourist-spots')}
            >
                {/* Ícone de Tag de Mapa (MapPin) */}
                <MapPin size={24} color={getIconColor('/tourist-spots')} />
                <span style={styles.label}>Pontos</span>
            </button>

            {/* Botão Extrato */}
            <button 
                style={getButtonStyle('/extrato')} 
                onClick={() => navigate('/extrato')}
            >
                <FileText size={24} color={getIconColor('/extrato')} />
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
        justifyContent: 'space-around', // Distribui os 4 itens igualmente
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
        width: '25%', // AJUSTADO: 4 botões = 25% cada
        transition: 'all 0.2s ease'
    },
    activeButton: {
        background: 'none',
        border: 'none',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: '#E65100', // Laranja CapibaFit
        fontWeight: 'bold',
        padding: '5px',
        width: '25%', // AJUSTADO: 4 botões = 25% cada
        transition: 'all 0.2s ease'
    },
    label: {
        fontSize: '0.70rem',
        marginTop: '4px'
    }
};

export default BottomMenu;