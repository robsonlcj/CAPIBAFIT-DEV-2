import React, { useState } from 'react';

const API_BASE_URL = 'http://localhost:3001/api'; 


function IniciarAtividadeButton() {
    // Estado Local: Controla se a atividade está em andamento
    const [isAtividadeIniciada, setIsAtividadeIniciada] = useState(false);
    const [isLoading, setIsLoading] = useState(false); // Novo estado para desabilitar o botão durante o envio

    // Lógica para o clique, contendo os alertas e a lógica principal
    const handleClick = async () => {
        // Desabilita o botão se já estiver em estado de carregamento
        if (isLoading) return;

        const novoEstado = !isAtividadeIniciada;

        if (novoEstado) {
            // Você pode querer salvar o horário de início aqui para calcular o tempo total
            console.log("Atividade INICIADA.");
            
        } else {
            // Lógica para PARAR A ATIVIDADE (novoEstado é false)
            setIsLoading(true); // Inicia o estado de carregamento

            // 1. SIMULAÇÃO DOS DADOS DA ATIVIDADE CONCLUÍDA
            // ATENÇÃO: Em um app real, estes dados viriam de um GPS/Timer real.
            const atividadeConcluida = {
                // Você precisaria de um contexto ou hook para obter o ID do usuário logado
                userId: 'user_123', 
                distanceKm: 5.2,
                timeMinutes: 30, // Calculado a partir do tempo de início e fim
                activityType: 'Corrida',
            };

            try {
                // 2. CHAMADA AO ENDPOINT DA API
                const response = await fetch(`${API_BASE_URL}/activities/sync`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        // Se necessário, inclua tokens de autenticação aqui (e.g., 'Authorization': `Bearer ${token}`)
                    },
                    body: JSON.stringify(atividadeConcluida),
                });

                if (response.status === 202) {
                    console.log("Atividade enviada e enfileirada com sucesso!");
                    // O backend respondeu que a fila aceitou a tarefa
                } else {
                    // Trata erros 4xx e outros (ex: 400 Bad Request do seu backend)
                    const errorData = await response.json();
                    alert(`Falha ao processar atividade. Erro: ${errorData.error || response.statusText}`);
                    console.error("Erro da API:", errorData);
                }

            } catch (error) {
                // Trata erros de rede ou CORS
                alert("Erro de conexão com o servidor. Tente novamente.");
                console.error("Erro de rede/fetch:", error);
            } finally {
                setIsLoading(false); // Finaliza o carregamento, independentemente do sucesso/falha
            }
        }
        
        // Atualiza o estado visual do botão APENAS se não houver carregamento,
        // ou se a atividade não foi parada.
        if (novoEstado || !isLoading) {
            setIsAtividadeIniciada(novoEstado);
        }
    };

    // Determina classes, texto e estado de desabilitação
    const buttonText = isAtividadeIniciada 
        ? (isLoading ? "Salvando..." : "Parar Atividade 🛑") 
        : "Iniciar Atividade 🚀";
        
    const buttonClass = isAtividadeIniciada 
        ? "btn-iniciar-atividade btn-parar" 
        : "btn-iniciar-atividade";

    return (
        <button 
            className={buttonClass}
            onClick={handleClick}
            disabled={isLoading} // Desabilita o botão durante o envio (loading)
        >
            {buttonText}
        </button>
    );
}

export default IniciarAtividadeButton;