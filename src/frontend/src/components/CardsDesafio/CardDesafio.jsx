import React from 'react';

import TrofeuIcon from '../../assets/trofeu.png'; // Exemplo: ajuste o caminho real
import AlvoIcon from '../../assets/alvo.png';   // Exemplo: ajuste o caminho real
import MedalhaIcon from '../../assets/medalha.png'; // Exemplo: ajuste o caminho real


function DesafioCard({ desafio }) {
    // Calcula a porcentagem de progresso para a barra
    const progressoPorcentagem = (desafio.progressoAtual / desafio.meta) * 100;

    // Decide qual ícone usar com base no tipo ou ID do desafio (ou você pode passar o ícone como prop)
    let iconSrc;
    let iconBackgroundColor;

    // Implementação simples para selecionar o ícone e cor de fundo
    // Você pode ter um mapa de ícones ou passá-los diretamente via props
    switch (desafio.id) {
        case 1: // Desafio de Boas-Vindas
            iconSrc = TrofeuIcon;
            iconBackgroundColor = '#66BB6A'; // Verde
            break;
        case 2: // Maratonista Iniciante
            iconSrc = AlvoIcon;
            iconBackgroundColor = '#FFA726'; // Laranja
            break;
        case 3: // Explorador de Recife
            iconSrc = MedalhaIcon;
            iconBackgroundColor = '#42A5F5'; // Azul
            break;
        default:
            iconSrc = TrofeuIcon; // Ícone padrão
            iconBackgroundColor = '#66BB6A';
    }


    return (
        <div className="desafio-card">
            <div className="desafio-header">
                <div 
                    className="desafio-icon-wrapper" 
                    style={{ backgroundColor: iconBackgroundColor }}
                >
                    <img src={iconSrc} alt={desafio.titulo} className="desafio-icon" />
                </div>
                <div className="desafio-info">
                    <h3 className="desafio-titulo">{desafio.titulo}</h3>
                    <p className="desafio-descricao">{desafio.descricao}</p>
                </div>
            </div>

            <div className="desafio-progresso-bar-container">
                <div 
                    className="desafio-progresso-bar" 
                    style={{ width: `${progressoPorcentagem}%` }}
                ></div>
            </div>

            <div className="desafio-footer">
                <span className="desafio-progresso-texto">{desafio.progressoAtual} / {desafio.meta}</span>
                <span className="desafio-recompensa">
                    {/* Substitua o CapibaraIcon se você tiver um ícone menor para recompensa */}
                    <img 
                        src={TrofeuIcon} // Usando o troféu como exemplo, ajuste para seu ícone de "moeda"
                        alt="Recompensa" 
                        className="recompensa-icon" 
                    />
                    +{desafio.recompensa}
                </span>
            </div>
        </div>
    );
}

export default DesafioCard;