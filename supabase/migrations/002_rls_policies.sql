-- Ativar RLS nas tabelas
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Qualquer visitante pode LER o organograma (visualização pública)
CREATE POLICY "Public read employees"
  ON public.employees FOR SELECT
  USING (true);

-- Só usuários autenticados (admin) podem modificar
CREATE POLICY "Auth insert employees"
  ON public.employees FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Auth update employees"
  ON public.employees FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Auth delete employees"
  ON public.employees FOR DELETE
  TO authenticated
  USING (true);

-- Só admins autenticados leem o audit log
CREATE POLICY "Auth read audit_log"
  ON public.audit_log FOR SELECT
  TO authenticated
  USING (true);

-- Admins autenticados podem fazer upload de fotos
CREATE POLICY "Auth upload photos"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'employee-photos');

-- Leitura pública das fotos
CREATE POLICY "Public read photos"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'employee-photos');
