import pg from 'pg';
import dotenv from 'dotenv';

// Só carrega o arquivo .env se NÃO estivermos no Render
if (process.env.NODE_ENV !== 'production') {
    dotenv.config({ path: './src/backend/.env' });
}

const { Pool } = pg;

const isProduction = process.env.NODE_ENV === 'production';

console.log('🌍 Ambiente:', isProduction ? 'PRODUÇÃO (Render)' : 'DESENVOLVIMENTO (Local)');

let poolConfig;

if (isProduction) {
    // --- CONFIGURAÇÃO DO RENDER (Produção) ---
    // Usa a string única do Supabase e ativa segurança SSL
    if (!process.env.DATABASE_URL) {
        console.error("❌ ERRO CRÍTICO: A variável DATABASE_URL não foi configurada no Render!");
    }

    poolConfig = {
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false // Obrigatório para conectar no Supabase
        }
    };
} else {
    // --- CONFIGURAÇÃO LOCAL (Seu PC) ---
    // Continua usando suas variáveis antigas
    console.log('Tentando conectar local...');
    poolConfig = {
        user: process.env.DB_USER || 'postgres',
        host: process.env.DB_HOST || 'localhost',
        database: process.env.DB_NAME || 'capibafit_db',
        password: process.env.DB_PASSWORD,
        port: process.env.DB_PORT || 5432,
    };
}

const pool = new Pool(poolConfig);

// Teste de conexão ao iniciar
pool.connect()
    .then(client => {
        console.log('✅ Banco de dados conectado com sucesso!');
        client.release();
    })
    .catch(err => {
        console.error('❌ Erro Fatal ao conectar no banco:', err.message);
    });

export { pool };
