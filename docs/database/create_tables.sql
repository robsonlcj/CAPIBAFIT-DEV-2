-- ===================================================
-- 1. LIMPEZA TOTAL (Reseta o banco)
-- ===================================================
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS users CASCADE;

-- ===================================================
-- 2. TABELA DE USUÁRIOS (Começando do Zero)
-- ===================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,        -- ID automático (1, 2, 3...)
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Economia e Gamificação (Padrão 0 para tudo)
    balance INTEGER DEFAULT 0,          -- Começa com 0 Capibas
    total_km DECIMAL(10,2) DEFAULT 0,   -- Começa com 0 km
    streak_count INTEGER DEFAULT 0,     -- Começa com 0 dias
    daily_goal INTEGER DEFAULT 5000,    -- Meta padrão de 5000 passos/pontos
    
    -- Onboarding e Controle
    first_login BOOLEAN DEFAULT TRUE,   -- Sempre TRUE para novos usuários
    welcome_challenge_completed VARCHAR(1) DEFAULT 'N',
    last_active_date DATE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- 3. TABELA DE TRANSAÇÕES
-- ===================================================
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount_capiba INTEGER NOT NULL,
    activity_type VARCHAR(50),           -- 'treino', 'bonus', 'loja'
    activity_details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- 4. TABELA DE DESAFIOS
-- ===================================================
CREATE TABLE challenges (
    id SERIAL PRIMARY KEY,
    title VARCHAR(100),
    type VARCHAR(50),
    target_value INTEGER,
    reward_amount INTEGER,
    description TEXT
);

-- ===================================================
-- 5. DADOS DO SISTEMA (Apenas Desafios)
-- ===================================================
-- Não inserimos usuários. O banco está vazio de pessoas.

INSERT INTO challenges (title, type, target_value, reward_amount, description) VALUES 
('Aquecimento', 'distance', 5, 50, 'Caminhe 5km no total'),
('Fogo Eterno', 'streak', 3, 100, 'Mantenha o streak por 3 dias'),
('Maratonista', 'distance', 42, 500, 'Acumule 42km percorridos');