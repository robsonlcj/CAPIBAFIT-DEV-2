import React, { useState, useEffect } from 'react';
import MetaDiaria from '../../components/MetaDiaria/MetaDiaria';
import { getDailyProgress } from '../../services/progressService'; // Importamos o serviço

export default function Desafios() {
  const [passos, setPassos] = useState(0);
  const [meta, setMeta] = useState(5000);
  
  // ID do usuário hardcoded para teste (idealmente viria do login/contexto)
  const userId = 1; 

  useEffect(() => {
    async function carregarDados() {
        const dados = await getDailyProgress(userId);
        setPassos(dados.steps_count);
        setMeta(dados.daily_goal);
    }

    carregarDados();
  }, []);

  return (
    <div style={{ padding: '20px', paddingBottom: '80px' }}>
      <h2 style={{ marginBottom: '20px' }}>🏆 Desafios</h2>
      
      {/* Agora passamos os dados reais para o componente */}
      <MetaDiaria passosAtuais={passos} meta={meta} />

      <h3 style={{ marginTop: '30px', marginBottom: '10px' }}>Outros Desafios</h3>
      <p>Lista de desafios aqui...</p>
    </div>
  );
}