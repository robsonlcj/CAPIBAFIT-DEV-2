import React, { useState } from 'react';

// Agora recebemos 'onClick' como prop (que vem da Home)
function IniciarAtividadeButton({ onClick }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = async () => {
        if (isLoading) return;

        setIsLoading(true);
        try {
            // Executa a função handleActivityStart que veio da Home
            // O await segura o botão no estado "Registrando..." até o alerta aparecer
            if (onClick) {
                await onClick();
            }
        } catch (error) {
            console.error("Erro no botão:", error);
        } finally {
            // Libera o botão novamente
            setIsLoading(false);
        }
    };

    return (
        <button 
            className="btn-iniciar-atividade"
            onClick={handleClick}
            disabled={isLoading}
            style={{ opacity: isLoading ? 0.7 : 1 }} // Feedback visual simples
        >
            {isLoading ? "Registrando... ⏳" : "Iniciar Atividade 🚀"}
        </button>
    );
}

export default IniciarAtividadeButton;