CREATE TABLE users (
    -- ID do usuário, chave principal. 
    user_id VARCHAR(255) PRIMARY KEY, 
    
    -- Saldo atualizado da moeda Capiba (deve ser sincronizado com a Prefeitura)
    balance INTEGER NOT NULL DEFAULT 0, 
    
    -- Usado para calcular streaks (sequências de dias ativos)
    last_activity_date DATE, 
    
    -- Contador atual de dias consecutivos de atividade
    current_streak_count INTEGER NOT NULL DEFAULT 0, 

    -- Indica se o usuário já resgatou o bônus de boas-vindas 
    has_claimed_welcome_bonus BOOLEAN NOT NULL DEFAULT FALSE,

    
    -- Metadados
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE transactions (
    transaction_id SERIAL PRIMARY KEY,
    
    -- Chave estrangeira que liga à tabela de usuários
    user_id VARCHAR(255) REFERENCES users(user_id) NOT NULL,
    
    -- Valor da transação [Capibas recebidas por cada atividade].
    amount_capiba INTEGER NOT NULL, 
    
    -- Data e hora exata do crédito
    date_time TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP, 
    
    -- Exibe o motivo da transação no extrato (HU2). Ex: 'Corrida', 'Bônus Boas-Vindas', 'Bônus Ponto Turístico'.
    activity_type VARCHAR(255) NOT NULL, 
    
    -- Para rastrear qual atividade gerou a transação (ex: 5.2 km de Corrida)
    activity_details VARCHAR(255), 

    -- Metadados
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP

    -- Índice para melhorar a performance de consultas por usuário
    external_ref_id VARCHAR(255)
);