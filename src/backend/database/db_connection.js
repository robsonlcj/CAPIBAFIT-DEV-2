import pg from 'pg';
const { Pool } = pg;

// Configuração da conexão
const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'capibafit',
    password: process.env.DB_PASSWORD || 'sua_senha_aqui', // Atualize se necessário
    port: process.env.DB_PORT || 5432,
});

// A CORREÇÃO ESTÁ AQUI:
// Em vez de "export const pool = pool", usamos chaves para exportar:
export { pool };

// Teste de conexão (opcional)
pool.connect()
    .then(() => console.log('✅ Banco de dados conectado com sucesso!'))
    .catch(err => console.error('❌ Erro ao conectar no banco:', err));