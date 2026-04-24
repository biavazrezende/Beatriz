-- Tabela de departamentos gerenciáveis
CREATE TABLE public.departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.departments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read departments"
  ON public.departments FOR SELECT
  USING (true);

CREATE POLICY "authenticated manage departments"
  ON public.departments FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Seed com os departamentos existentes no banco
INSERT INTO public.departments (name) VALUES
  ('Diretoria'),
  ('Financeiro'),
  ('Pessoas e Cultura'),
  ('Soluções em Saúde'),
  ('Marketing'),
  ('Tecnologia'),
  ('Operações'),
  ('Expansão e Rede'),
  ('Integração')
ON CONFLICT (name) DO NOTHING;
