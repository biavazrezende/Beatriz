-- Extensão do seed: colaboradores dos departamentos restantes
-- Rodar APÓS a migration 003.

-- ─── Financeiro (reportam a Camila Vilar → 002) ───────────────────────────────
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000051', 'Carlos Ferreira', 'Controller', 'Financeiro', '00000000-0000-0000-0000-000000000002', 'active'),
('00000000-0000-0000-0000-000000000052', 'Fernanda Lima', 'Analista Financeira Sênior', 'Financeiro', '00000000-0000-0000-0000-000000000051', 'active'),
('00000000-0000-0000-0000-000000000053', 'Ricardo Santos', 'Analista de Controladoria', 'Financeiro', '00000000-0000-0000-0000-000000000051', 'active'),
('00000000-0000-0000-0000-000000000054', 'Mariana Costa', 'Analista Financeira', 'Financeiro', '00000000-0000-0000-0000-000000000051', 'active'),
('00000000-0000-0000-0000-000000000055', 'Em contratação', 'Assistente Financeiro', 'Financeiro', '00000000-0000-0000-0000-000000000051', 'hiring');

-- ─── Soluções em Saúde (reportam a Eduardo Cheade → 004) ─────────────────────
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000061', 'Renata Oliveira', 'Gerente de Soluções em Saúde', 'Soluções em Saúde', '00000000-0000-0000-0000-000000000004', 'active'),
('00000000-0000-0000-0000-000000000062', 'Thiago Pereira', 'Especialista em Saúde Preventiva', 'Soluções em Saúde', '00000000-0000-0000-0000-000000000061', 'active'),
('00000000-0000-0000-0000-000000000063', 'Amanda Souza', 'Analista de Soluções', 'Soluções em Saúde', '00000000-0000-0000-0000-000000000061', 'active'),
('00000000-0000-0000-0000-000000000064', 'Bruno Carvalho', 'Analista de Soluções', 'Soluções em Saúde', '00000000-0000-0000-0000-000000000061', 'active'),
('00000000-0000-0000-0000-000000000065', 'Em contratação', 'Especialista em Saúde', 'Soluções em Saúde', '00000000-0000-0000-0000-000000000061', 'hiring');

-- ─── Marketing (reportam a Leonardo Tavares → 005) ───────────────────────────
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000071', 'Isabela Rocha', 'Gerente de Marketing', 'Marketing', '00000000-0000-0000-0000-000000000005', 'active'),
('00000000-0000-0000-0000-000000000072', 'Diego Mendes', 'Analista de Marketing Digital', 'Marketing', '00000000-0000-0000-0000-000000000071', 'active'),
('00000000-0000-0000-0000-000000000073', 'Larissa Fernandes', 'Designer', 'Marketing', '00000000-0000-0000-0000-000000000071', 'active'),
('00000000-0000-0000-0000-000000000074', 'Felipe Azevedo', 'Analista de Conteúdo', 'Marketing', '00000000-0000-0000-0000-000000000071', 'active'),
('00000000-0000-0000-0000-000000000075', 'Natalia Campos', 'Social Media', 'Marketing', '00000000-0000-0000-0000-000000000071', 'active'),
('00000000-0000-0000-0000-000000000076', 'Em contratação', 'Analista de CRM', 'Marketing', '00000000-0000-0000-0000-000000000071', 'hiring');

-- ─── Expansão e Rede (reportam a Alexandre Montenegro → 008) ─────────────────
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000081', 'Patricia Moreira', 'Gerente de Expansão', 'Expansão e Rede', '00000000-0000-0000-0000-000000000008', 'active'),
('00000000-0000-0000-0000-000000000082', 'Rodrigo Barbosa', 'Analista de Expansão', 'Expansão e Rede', '00000000-0000-0000-0000-000000000081', 'active'),
('00000000-0000-0000-0000-000000000083', 'Tatiane Castro', 'Analista de Rede', 'Expansão e Rede', '00000000-0000-0000-0000-000000000081', 'active'),
('00000000-0000-0000-0000-000000000084', 'Leandro Silva', 'Coordenador de Parcerias', 'Expansão e Rede', '00000000-0000-0000-0000-000000000081', 'active'),
('00000000-0000-0000-0000-000000000085', 'Em contratação', 'Analista de Expansão', 'Expansão e Rede', '00000000-0000-0000-0000-000000000081', 'hiring');

-- ─── Integração (reportam a Jorge → 009) ─────────────────────────────────────
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000091', 'Marcela Dias', 'Coordenadora de Integração', 'Integração', '00000000-0000-0000-0000-000000000009', 'active'),
('00000000-0000-0000-0000-000000000092', 'Henrique Nunes', 'Analista de Integração', 'Integração', '00000000-0000-0000-0000-000000000091', 'active'),
('00000000-0000-0000-0000-000000000093', 'Cristiane Teixeira', 'Analista de Integração', 'Integração', '00000000-0000-0000-0000-000000000091', 'active'),
('00000000-0000-0000-0000-000000000094', 'Em contratação', 'Especialista de Integração', 'Integração', '00000000-0000-0000-0000-000000000091', 'hiring');
