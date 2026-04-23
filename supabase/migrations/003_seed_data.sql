-- Rodar APÓS a migration 001. Dados iniciais do organograma 2026.

-- Nível 1: CEO
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000001', 'Beatriz Brisotti', 'CEO', 'Diretoria', NULL, 'active');

-- Nível 2: Diretores (reportam à CEO)
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000002', 'Camila Vilar', 'Diretora Financeira', 'Financeiro', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000003', 'Daniel Vieira', 'Diretor de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000004', 'Eduardo Cheade', 'Diretor de Soluções em Saúde', 'Soluções em Saúde', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000005', 'Leonardo Tavares', 'Diretor de Marketing', 'Marketing', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000006', 'Dan Sabbagh', 'Diretor de Tecnologia', 'Tecnologia', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000007', 'Paulo Eduardo Pessoa', 'Diretor de Operações', 'Operações', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000008', 'Alexandre Montenegro', 'Diretor de Expansão e Rede', 'Expansão e Rede', '00000000-0000-0000-0000-000000000001', 'active'),
('00000000-0000-0000-0000-000000000009', 'Jorge', 'Gerência de Integração', 'Integração', '00000000-0000-0000-0000-000000000001', 'active');

-- Pessoas e Cultura (reportam a Daniel Vieira → Gabriel Rodrigues → Elisabete Silva)
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000010', 'Gabriel Rodrigues', 'Gerente de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000003', 'active'),
('00000000-0000-0000-0000-000000000011', 'Daiene Alexandre', 'Especialista de Remuneração e Benefícios', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000010', 'active'),
('00000000-0000-0000-0000-000000000012', 'Elisabete Silva', 'Coordenadora de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000010', 'active'),
('00000000-0000-0000-0000-000000000013', 'Ariane Andrioli', 'Analista de Adm. Pessoal', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000014', 'Ana Almeida', 'Auxiliar de Adm. Pessoal', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000015', 'Em contratação', 'Analista de Adm. Pessoal', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'hiring'),
('00000000-0000-0000-0000-000000000016', 'Iara Moraes', 'Analista de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000017', 'Victor Souza', 'Especialista em Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000018', 'Izabela Costa', 'Assistente de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000019', 'Verena Spadão', 'Analista de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000020', 'Letícia Godoy', 'Analista de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000021', 'Paula Tagliacolli', 'Analista de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000022', 'Caio Almeida', 'Analista de Pessoas e Cultura', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000023', 'Laura Ribeiro', 'Business Partner', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active'),
('00000000-0000-0000-0000-000000000024', 'Helvert Malaquias', 'Business Partner', 'Pessoas e Cultura', '00000000-0000-0000-0000-000000000012', 'active');

-- Tecnologia (reportam a Dan Sabbagh)
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000030', 'Guilherme Oliveira', 'Gerente de TI - INFRA', 'Tecnologia', '00000000-0000-0000-0000-000000000006', 'active'),
('00000000-0000-0000-0000-000000000031', 'Marcelo Almeida', 'Especialista em Infraestrutura', 'Tecnologia', '00000000-0000-0000-0000-000000000030', 'active'),
('00000000-0000-0000-0000-000000000032', 'Felix Rodriguez', 'Supervisor de Informática', 'Tecnologia', '00000000-0000-0000-0000-000000000030', 'active'),
('00000000-0000-0000-0000-000000000033', 'Marcos Correa', 'Gerente de Produto', 'Tecnologia', '00000000-0000-0000-0000-000000000006', 'active'),
('00000000-0000-0000-0000-000000000034', 'Vinicius Massulo', 'Gerente de Dados', 'Tecnologia', '00000000-0000-0000-0000-000000000006', 'active'),
('00000000-0000-0000-0000-000000000035', 'André Medina', 'Gerente de Suporte', 'Tecnologia', '00000000-0000-0000-0000-000000000006', 'active');

-- Operações
INSERT INTO public.employees (id, name, role, department, manager_id, status) VALUES
('00000000-0000-0000-0000-000000000040', 'Vanessa Posca', 'Coordenadora de Performance', 'Operações', '00000000-0000-0000-0000-000000000007', 'active'),
('00000000-0000-0000-0000-000000000041', 'Mathiele Matos', 'Supervisor de Performance', 'Operações', '00000000-0000-0000-0000-000000000040', 'active');
