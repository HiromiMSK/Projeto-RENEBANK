-- =================================================================================
-- DADOS DE TESTE (INSERT INTO) - RENEBANK
-- Baseado nos dados simulados do MVP JavaScript
-- =================================================================================

-- 1. Inserir Usuário Principal
-- O saldo é a soma das transações iniciais: -31.00 - 36.00 - 49.00 - 230.50 - 210.30 + 3500.00 = 2943.20
INSERT INTO Usuarios (usuario_id, nome, saldo, perfil_financeiro) VALUES
(1, 'Usuário Principal', 2943.20, 'Equilibrado');

-- 2. Inserir Categorias
INSERT INTO Categorias (categoria_id, nome) VALUES
(1, 'Lazer'),
(2, 'Mercado'),
(3, 'Contas Fixas'),
(4, 'Receita'),
(5, 'Transferência'); -- Adicionada para transações PIX

-- 3. Inserir Chaves PIX Favoritas
INSERT INTO Pix_Favoritos (usuario_id, nome_amigavel, chave_pix) VALUES
(1, 'Mãe ❤️', 'mae@exemplo.com'),
(1, 'Jorge (Dev da equipe)', 'jorge.dev@renebank.com'),
(1, 'Padaria da Esquina', '11.111.111/0001-11'),
(1, 'Mercado Extra', '22.222.222/0001-22'),
(1, 'Bar do Zé', '33.333.333/0001-33');

-- 4. Inserir Cartão Virtual (Simulação)
INSERT INTO Cartoes_Virtuais (usuario_id, numero_cartao, validade, cvv_dinamico, data_geracao) VALUES
(1, '5500954843042624', '2030-12-01', '000', NOW()); -- CVV e data de geração são dinâmicos, usamos valores de teste.

-- 5. Inserir Metas (Baseado nas sugestões do Perfil)
-- As categorias 1, 2, 3, 4, 5 correspondem a Lazer, Mercado, Contas Fixas, Receita, Transferência.
INSERT INTO Metas (usuario_id, nome_meta, valor_alvo, valor_atual, data_criacao, data_limite, categoria_relacionada_id) VALUES
(1, 'Reduzir Lazer em 10%', 0.00, 0.00, CURDATE(), NULL, 1), -- Meta de comportamento, não de valor
(1, 'Reserva de Emergência', 10000.00, 2000.00, CURDATE(), '2026-12-31', NULL);

-- 6. Inserir Transações (Extrato)
-- Usamos IDs de categoria fixos: 1=Lazer, 2=Mercado, 3=Contas Fixas, 4=Receita, 5=Transferência
INSERT INTO Transacoes (transacao_id, usuario_id, descricao, valor, data_transacao, origem_servico, categoria_id) VALUES
(1, 1, 'Gasto Simulado (Lazer)', -31.00, NOW() - INTERVAL 1 HOUR, 'Lazer', 1),
(2, 1, 'Gasto Simulado (Lazer)', -36.00, NOW() - INTERVAL 2 HOUR, 'Lazer', 1),
(3, 1, 'Gasto Simulado (Lazer)', -49.00, NOW() - INTERVAL 3 HOUR, 'Lazer', 1),
(4, 1, 'Supermercado Bom Preço', -230.50, NOW() - INTERVAL 1 DAY, 'Mercado', 2),
(5, 1, 'Energia Elétrica', -210.30, NOW() - INTERVAL 3 DAY, 'Boleto', 3),
(6, 1, 'Recebimento', 3500.00, NOW() - INTERVAL 5 DAY, 'Salário', 4);

-- Transação PIX simulada no código (exemplo de como seria inserida)
-- INSERT INTO Transacoes (transacao_id, usuario_id, descricao, valor, data_transacao, origem_servico, categoria_id) VALUES
-- (7, 1, 'PIX para Mãe ❤️', -50.00, NOW(), 'PIX', 5);


-- =================================================================================
-- DADOS DE TESTE (INSERT INTO) - RENEBANK
-- Baseado nos dados simulados do MVP JavaScript
-- =================================================================================

-- 1. Inserir Usuário Principal
-- O saldo é a soma das transações iniciais: -31.00 - 36.00 - 49.00 - 230.50 - 210.30 + 3500.00 = 2943.20
INSERT INTO Usuarios (usuario_id, nome, saldo, perfil_financeiro) VALUES
(1, 'Usuário Principal', 2943.20, 'Equilibrado');

-- 2. Inserir Categorias
INSERT INTO Categorias (categoria_id, nome) VALUES
(1, 'Lazer'),
(2, 'Mercado'),
(3, 'Contas Fixas'),
(4, 'Receita'),
(5, 'Transferência'); -- Adicionada para transações PIX

-- 3. Inserir Chaves PIX Favoritas
INSERT INTO Pix_Favoritos (usuario_id, nome_amigavel, chave_pix) VALUES
(1, 'Mãe ❤️', 'mae@exemplo.com'),
(1, 'Jorge (Dev da equipe)', 'jorge.dev@renebank.com'),
(1, 'Padaria da Esquina', '11.111.111/0001-11'),
(1, 'Mercado Extra', '22.222.222/0001-22'),
(1, 'Bar do Zé', '33.333.333/0001-33');

-- 4. Inserir Cartão Virtual (Simulação)
INSERT INTO Cartoes_Virtuais (usuario_id, numero_cartao, validade, cvv_dinamico, data_geracao) VALUES
(1, '5500954843042624', '2030-12-01', '000', NOW()); -- CVV e data de geração são dinâmicos, usamos valores de teste.

-- 5. Inserir Metas (Baseado nas sugestões do Perfil)
-- As categorias 1, 2, 3, 4, 5 correspondem a Lazer, Mercado, Contas Fixas, Receita, Transferência.
INSERT INTO Metas (usuario_id, nome_meta, valor_alvo, valor_atual, data_criacao, data_limite, categoria_relacionada_id) VALUES
(1, 'Reduzir Lazer em 10%', 0.00, 0.00, CURDATE(), NULL, 1), -- Meta de comportamento, não de valor
(1, 'Reserva de Emergência', 10000.00, 2000.00, CURDATE(), '2026-12-31', NULL);

-- 6. Inserir Transações (Extrato)
-- Usamos IDs de categoria fixos: 1=Lazer, 2=Mercado, 3=Contas Fixas, 4=Receita, 5=Transferência
INSERT INTO Transacoes (transacao_id, usuario_id, descricao, valor, data_transacao, origem_servico, categoria_id) VALUES
(1, 1, 'Gasto Simulado (Lazer)', -31.00, NOW() - INTERVAL 1 HOUR, 'Lazer', 1),
(2, 1, 'Gasto Simulado (Lazer)', -36.00, NOW() - INTERVAL 2 HOUR, 'Lazer', 1),
(3, 1, 'Gasto Simulado (Lazer)', -49.00, NOW() - INTERVAL 3 HOUR, 'Lazer', 1),
(4, 1, 'Supermercado Bom Preço', -230.50, NOW() - INTERVAL 1 DAY, 'Mercado', 2),
(5, 1, 'Energia Elétrica', -210.30, NOW() - INTERVAL 3 DAY, 'Boleto', 3),
(6, 1, 'Recebimento', 3500.00, NOW() - INTERVAL 5 DAY, 'Salário', 4);

-- Transação PIX simulada no código (exemplo de como seria inserida)
-- INSERT INTO Transacoes (transacao_id, usuario_id, descricao, valor, data_transacao, origem_servico, categoria_id) VALUES
-- (7, 1, 'PIX para Mãe ❤️', -50.00, NOW(), 'PIX', 5);

