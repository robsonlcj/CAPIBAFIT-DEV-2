import 'dotenv/config'; 
import express from 'express';
import cors from 'cors';
import apiRouter from './api/routes.js'; // Importante ter o .js no final
import { pool } from './database/db_connection.js'; 
import iniciarCronJobs from './jobs/dailyReset.js'; // Importante ter o .js no final

const app = express();
const PORT = 3001; 

// Configurações
app.use(cors({ origin: '*' })); 
app.use(express.json({ limit: '10mb' }));

// Rotas
app.use('/api', apiRouter);

// Inicialização
app.listen(PORT, async () => {
    console.log(`🚀 Backend rodando na porta ${PORT}`);
    
    // Teste de Banco
    try {
        await pool.query('SELECT 1');
        console.log('✅ Banco conectado com sucesso!');
    } catch (err) {
        console.error('❌ CRÍTICO: Não foi possível conectar ao banco:', err.message);
    }

    // Iniciar Cron Jobs (Verificação diária de Streaks perdidos)
    if (typeof iniciarCronJobs === 'function') {
        iniciarCronJobs();
        console.log('⏰ Cron Jobs iniciados.');
    } else {
        console.warn('⚠️ Atenção: iniciarCronJobs não é uma função válida.');
    }
});