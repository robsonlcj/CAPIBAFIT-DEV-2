import pg from 'pg';
import dotenv from 'dotenv';

// Carrega .env apenas se estivermos rodando localmente
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: './src/backend/.env' });
}

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

console.log('🌍 Ambiente:', isProduction ? 'PRODUÇÃO (Render)' : 'DESENVOLVIMENTO (Local)');

let poolConfig;

if (isProduction) {
    // --- CONFIGURAÇÃO DE PRODUÇÃO (Render + Supabase) ---
    // Usa a string única de conexão e obriga o uso de SSL
    if (!process.env.DATABASE_URL) {
        console.error("❌ ERRO CRÍTICO: DATABASE_URL não foi definida nas variáveis de ambiente do Render!");
    }

    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Obrigatório para conectar no Supabase/Neon via Render
        }
    };
} else {
    // --- CONFIGURAÇÃO LOCAL (Seu PC) ---
    // Continua funcionando como você configurou antes
    console.log('Tentando conectar local com user:', process.env.DB_USER || 'postgres');
    
    poolConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'capibafit_db',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    };
}

const pool = new Pool(poolConfig);

export { pool };

// Teste de conexão
pool.connect()
    .then(client => {
        console.log('✅ Banco de dados conectado com sucesso!');
        client.release();
    })
    .catch(err => {
        console.error('❌ Erro de Conexão:', err.message);
        if (isProduction) {
            console.error('Dica: Verifique se a DATABASE_URL está correta no painel do Render.');
        } else {
            console.error('Dica: Verifique se o Postgres local está rodando e as senhas batem.');
        }
    });
