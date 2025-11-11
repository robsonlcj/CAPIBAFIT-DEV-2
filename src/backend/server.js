import express from 'express';
import cors from 'cors'; // 👈 PRECISAMOS DELE PARA O FRONT-END
import apiRouter from './api/routes.js'; // Ajuste o caminho conforme necessário

// --- CONFIGURAÇÕES DO SERVIDOR ---
const app = express();
const PORT = 3001; // Porta do seu BACK-END
const FRONTEND_URL = 'http://localhost:5173'; // URL do seu FRONT-END React

// -----------------------------------------------------------------
// 1. CONFIGURAÇÃO DE MIDDLEWARE
// -----------------------------------------------------------------

// Middleware CORS: Permite que o frontend (React) acesse o backend
app.use(cors({
    origin: FRONTEND_URL, // Permite requisições apenas desta URL (seu React)
    methods: ['GET', 'POST'], // Permite os métodos usados
    credentials: true
}));

// Middleware JSON: Permite que o Express leia o JSON enviado no corpo da requisição POST
app.use(express.json());


// -----------------------------------------------------------------
// 2. REGISTRO DAS ROTAS
// -----------------------------------------------------------------

// Monta todas as rotas definidas em routes.js sob o prefixo /api
app.use('/api', apiRouter); 
// Se você não quiser o prefixo '/api', use: app.use('/', apiRouter);


// -----------------------------------------------------------------
// 3. INICIALIZAÇÃO DO SERVIDOR
// -----------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`🚀 Servidor Express rodando na porta ${PORT}`);
    console.log(`Aguardando requisições de ${FRONTEND_URL}`);
});