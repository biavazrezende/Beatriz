-- Tabela principal de colaboradores
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  department TEXT NOT NULL,
  manager_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  email TEXT,
  photo_url TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'inactive', 'hiring')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices para performance
CREATE INDEX idx_employees_manager ON public.employees(manager_id);
CREATE INDEX idx_employees_department ON public.employees(department);
CREATE INDEX idx_employees_status ON public.employees(status);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER employees_updated_at
  BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Tabela de audit log (histórico de alterações)
CREATE TABLE public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES public.employees(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('created', 'updated', 'deleted')),
  changed_by UUID REFERENCES auth.users(id),
  changed_by_email TEXT,
  old_data JSONB,
  new_data JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Trigger de audit log automático
CREATE OR REPLACE FUNCTION log_employee_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.audit_log(employee_id, action, new_data)
    VALUES (NEW.id, 'created', row_to_json(NEW));
  ELSIF TG_OP = 'UPDATE' THEN
    INSERT INTO public.audit_log(employee_id, action, old_data, new_data)
    VALUES (NEW.id, 'updated', row_to_json(OLD), row_to_json(NEW));
  ELSIF TG_OP = 'DELETE' THEN
    INSERT INTO public.audit_log(employee_id, action, old_data)
    VALUES (OLD.id, 'deleted', row_to_json(OLD));
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER employees_audit
  AFTER INSERT OR UPDATE OR DELETE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION log_employee_changes();
