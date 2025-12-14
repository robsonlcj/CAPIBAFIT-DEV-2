import React, { useState } from 'react';
import html2canvas from 'html2canvas';

const ShareButton = ({ captureRef }) => {
  const [sharing, setSharing] = useState(false);

  const handleShare = async () => {
    if (!captureRef.current) return;
    setSharing(true);

    try {
      // 1. Converte o elemento HTML (o Card) em um Canvas
      const canvas = await html2canvas(captureRef.current, {
        useCORS: true, // Importante se tiver imagens externas
        scale: 2, // Melhora a resolução da imagem (Retina)
        backgroundColor: null,
      });

      // 2. Transforma o Canvas em um arquivo de imagem (Blob)
      canvas.toBlob(async (blob) => {
        if (!blob) {
            alert("Erro ao gerar imagem.");
            return;
        }

        const file = new File([blob], 'treino-capibafit.png', { type: 'image/png' });

        // 3. Verifica se o navegador suporta compartilhamento nativo (Mobile)
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({
              files: [file],
              title: 'Meu Treino no CapibaFit',
              text: 'Olha meu progresso! 🌿🔥 #CapibaFit',
            });
          } catch (err) {
            console.log('Compartilhamento cancelado pelo usuário', err);
          }
        } else {
          // Fallback para Desktop: Baixar a imagem
          const link = document.createElement('a');
          link.download = 'treino-capibafit.png';
          link.href = canvas.toDataURL();
          link.click();
          alert("Imagem baixada! (Compartilhamento nativo é apenas mobile)");
        }
        setSharing(false);
      }, 'image/png');

    } catch (error) {
      console.error("Erro ao compartilhar:", error);
      setSharing(false);
    }
  };

  return (
    <button 
      onClick={handleShare} 
      style={{
        marginTop: '15px',
        padding: '12px 24px',
        background: '#25D366', // Cor estilo WhatsApp
        color: 'white',
        border: 'none',
        borderRadius: '50px',
        fontSize: '1rem',
        fontWeight: 'bold',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
      disabled={sharing}
    >
      {sharing ? 'Gerando imagem...' : 'Compartilhar Resultado 📤'}
    </button>
  );
};

export default ShareButton;