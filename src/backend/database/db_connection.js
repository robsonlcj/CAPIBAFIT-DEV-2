import pg from 'pg';
import dotenv from 'dotenv';

// Carrega as variáveis de ambiente baseadas na raiz do projeto
dotenv.config({ path: './src/backend/.env' });

const { Pool } = pg;

console.log('Tentando conectar com senha:', process.env.DB_PASSWORD ? '***** (definida)' : 'NÃO DEFINIDA');

// Configuração da conexão
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'capibafit_db', // Atenção: no seu .env está capibafit_db, no código antigo estava 'capibafit'
    password: process.env.DB_PASSWORD, // Removemos o fallback para garantir que o erro apareça se a env falhar
    port: process.env.DB_PORT || 5432,
});

export { pool };

// Teste de conexão (opcional)
pool.connect()
    .then(client => {
        console.log('✅ Banco de dados conectado com sucesso via db_connection!');
        client.release();
    })
    .catch(err => console.error('❌ Erro ao conectar no banco (db_connection):', err.message));