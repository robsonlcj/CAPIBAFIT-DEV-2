-- ===================================================
-- 1. LIMPEZA TOTAL (Reseta o banco para evitar conflitos)
-- ===================================================
DROP TABLE IF EXISTS tourist_checkins;
DROP TABLE IF EXISTS tourist_spots;
DROP TABLE IF EXISTS transactions;
DROP TABLE IF EXISTS challenges;
DROP TABLE IF EXISTS user_progress;
DROP TABLE IF EXISTS users CASCADE;

-- ===================================================
-- 2. TABELA DE USUÁRIOS
-- ===================================================
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    name VARCHAR(100),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    
    -- Economia e Gamificação
    balance INTEGER DEFAULT 0,
    total_km DECIMAL(10,2) DEFAULT 0,
    streak_count INTEGER DEFAULT 0,
    daily_goal INTEGER DEFAULT 5000,
    
    -- Onboarding e Controle
    first_login BOOLEAN DEFAULT TRUE,
    welcome_challenge_completed VARCHAR(1) DEFAULT 'N',
    last_active_date DATE,
    avatar_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- 3. TABELA DE PONTOS TURÍSTICOS
-- ===================================================
CREATE TABLE tourist_spots (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    latitude DECIMAL(10, 8) NOT NULL,
    longitude DECIMAL(11, 8) NOT NULL,
    radius_meters INTEGER DEFAULT 30,
    multiplier DECIMAL(3, 1) NOT NULL DEFAULT 3.0, 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- 4. TABELA DE CHECKINS TURÍSTICOS
-- ===================================================
CREATE TABLE tourist_checkins (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    spot_id INTEGER NOT NULL REFERENCES tourist_spots(id),
    checked_in_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- TRAVA DIÁRIA: Garante apenas 1 bônus por dia para o usuário (em qualquer local)
CREATE UNIQUE INDEX unique_global_daily_bonus 
ON tourist_checkins (user_id, (checked_in_at::date));

-- ===================================================
-- 5. TABELA DE TRANSAÇÕES
-- ===================================================
CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(user_id) ON DELETE CASCADE,
    amount_capiba INTEGER NOT NULL,
    activity_type VARCHAR(50), 
    activity_details TEXT,
    external_ref_id VARCHAR(255), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ===================================================
-- 6. TABELA DE DESAFIOS
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
-- 7. DADOS INICIAIS (SEED)
-- ===================================================

-- Desafios
INSERT INTO challenges (title, type, target_value, reward_amount, description) VALUES 
('Aquecimento', 'distance', 5, 50, 'Caminhe 5km no total'),
('Fogo Eterno', 'streak', 3, 100, 'Mantenha o streak por 3 dias'),
('Maratonista', 'distance', 42, 500, 'Acumule 42km percorridos');

-- Pontos Turísticos (Multiplier 3x | Raio 30m)
INSERT INTO tourist_spots (name, latitude, longitude, radius_meters, multiplier) VALUES 
('Marco Zero', -8.063169, -34.871139, 30, 3.0),            -- Recife Antigo
('Pracinha de Boa Viagem', -8.127815, -34.902998, 30, 3.0), -- Zona Sul
('Parque da Jaqueira', -8.037827, -34.906560, 30, 3.0);     -- Zona Norte