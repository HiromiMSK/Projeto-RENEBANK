-- CRIAÇÃO DO BANCO DE DADOS RENEBANK
CREATE DATABASE IF NOT EXISTS renebank_db;
USE renebank_db;

-- 1. TABELA DE USUÁRIOS
-- Armazena os dados de login e perfil do Hiro
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome_completo VARCHAR(100) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    senha_hash VARCHAR(255) NOT NULL, -- Em produção, usaríamos hash real
    data_criacao DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. TABELA DE CONTAS BANCÁRIAS
-- Relaciona o usuário ao seu saldo e número da conta
CREATE TABLE contas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT,
    numero_agencia VARCHAR(10) DEFAULT '0001',
    numero_conta VARCHAR(20) UNIQUE NOT NULL,
    saldo_corrente DECIMAL(15, 2) DEFAULT 0.00,
    saldo_caixinha DECIMAL(15, 2) DEFAULT 0.00, -- O saldo da "Caixinha Turbo"
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

-- 3. TABELA DE TRANSAÇÕES (O Extrato)
-- Tudo que entra e sai (Pix, Boletos, Compras)
CREATE TABLE transacoes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conta_id INT,
    tipo ENUM('PIX_ENVIADO', 'PIX_RECEBIDO', 'BOLETO', 'COMPRA_CARTAO', 'EMPRESTIMO', 'CAIXINHA_DEPOSITO', 'CAIXINHA_RESGATE') NOT NULL,
    descricao VARCHAR(255) NOT NULL,
    valor DECIMAL(15, 2) NOT NULL, -- Valor negativo para saídas, positivo para entradas
    data_transacao DATETIME DEFAULT CURRENT_TIMESTAMP,
    categoria VARCHAR(50), -- Ex: Lazer, Alimentação, Transporte
    origem_destino VARCHAR(100), -- Para quem foi ou de quem veio
    FOREIGN KEY (conta_id) REFERENCES contas(id)
);

-- 4. TABELA DE INVESTIMENTOS (A Carteira de E-Sports)
CREATE TABLE investimentos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conta_id INT,
    ticker VARCHAR(20) NOT NULL, -- Ex: LCK:T1
    nome_ativo VARCHAR(100) NOT NULL, -- Ex: T1 Esports
    valor_investido DECIMAL(15, 2) NOT NULL,
    variacao_atual DECIMAL(5, 2) NOT NULL, -- Porcentagem de variação
    FOREIGN KEY (conta_id) REFERENCES contas(id)
);

-- 5. TABELA DE CARTÕES VIRTUAIS
CREATE TABLE cartoes_virtuais (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conta_id INT,
    numero_cartao VARCHAR(19) NOT NULL,
    nome_impresso VARCHAR(100) NOT NULL,
    validade VARCHAR(5) NOT NULL,
    cvv INT NOT NULL,
    ativo BOOLEAN DEFAULT TRUE,
    FOREIGN KEY (conta_id) REFERENCES contas(id)
);

-- --- POPULANDO COM DADOS INICIAIS (MOCK) ---
-- Inserindo o Usuário Hiro
INSERT INTO usuarios (nome_completo, cpf, email, senha_hash) 
VALUES ('Hiro', '000.000.000-01', 'hiro@renebank.com', 'senha123');

-- Criando a Conta do Hiro
INSERT INTO contas (usuario_id, numero_conta, saldo_corrente, saldo_caixinha)
VALUES (1, '5500-1', 1250.00, 500.00);

-- Inserindo as Transações que aparecem no JS
INSERT INTO transacoes (conta_id, tipo, descricao, valor, categoria, origem_destino) VALUES 
(1, 'COMPRA_CARTAO', 'Gasto Lazer', -31.00, 'Lazer', 'Lazer'),
(1, 'COMPRA_CARTAO', 'Uber Eats', -65.50, 'Alimentação', 'Delivery'),
(1, 'PIX_RECEBIDO', 'Recebimento Salário', 3500.00, 'Receita', 'Empresa XYZ');

-- Inserindo a Carteira de E-Sports
INSERT INTO investimentos (conta_id, ticker, nome_ativo, valor_investido, variacao_atual) VALUES
(1, 'LCK:T1', 'T1 Esports', 1250.40, 15.2),
(1, 'CBLOL:PNG', 'paiN Gaming', 850.20, 5.4),
(1, 'CBLOL:FUR', 'Furia', 420.00, -1.2);

-- Inserindo um Cartão Virtual
INSERT INTO cartoes_virtuais (conta_id, numero_cartao, nome_impresso, validade, cvv)
VALUES (1, '5500 1234 5678 9000', 'HIRO', '12/30', 123);
