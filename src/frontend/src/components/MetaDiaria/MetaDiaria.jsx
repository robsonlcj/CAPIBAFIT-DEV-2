import React, { useState, useEffect } from 'react';
import Confetti from 'react-confetti'; 
import '../../pages/style/style.css';

export default function MetaDiaria({ passosAtuais = 0, meta = 5000 }) {
    const porcentagem = Math.min((passosAtuais / meta) * 100, 100);
    const [celebrar, setCelebrar] = useState(false);
    
    // Pega o tamanho da janela
    const [windowSize, setWindowSize] = useState({
        width: document.documentElement.clientWidth, // Medida mais precisa
        height: window.innerHeight,
    });

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: document.documentElement.clientWidth, // Aqui também
                height: window.innerHeight,
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (porcentagem >= 100) {
            setCelebrar(true);
            setTimeout(() => setCelebrar(false), 8000); 
        }
    }, [porcentagem]);

    return (
        <div className={`card-meta ${porcentagem >= 100 ? 'concluido' : ''}`}>
            {celebrar && (
                <Confetti 
                    width={windowSize.width} 
                    height={windowSize.height} 
                    numberOfPieces={400} 
                    recycle={true} 
                    gravity={0.2}
                    // AQUI ESTÁ A CORREÇÃO MÁGICA:
                    style={{ 
                        position: 'fixed', 
                        top: 0, 
                        left: 0, 
                        width: '100%', 
                        height: '100%', 
                        zIndex: 999,
                        pointerEvents: 'none' /* Isso permite clicar "através" dos confetes */
                    }} 
                />
            )}

            <h3 className="titulo-meta">Meta Diária de Passos</h3>
            
            <div className="info-passos">
                <span className="destaque">{passosAtuais}</span> 
                <span className="total"> / {meta}</span>
            </div>

            <div className="barra-container">
                <div 
                    className="barra-preenchimento" 
                    style={{ width: `${porcentagem}%` }}
                ></div>
            </div>
            
            <p className="texto-incentivo">
                {porcentagem >= 100 
                    ? "🏆 PARABÉNS! VOCÊ É UMA MÁQUINA! 🏆" 
                    : `Faltam ${meta - passosAtuais} passos.`}
            </p>
        </div>
    );
}