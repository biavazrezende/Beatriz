# Organograma AmorSaúde — Pessoas e Cultura

Aplicação web para visualização e gestão do organograma da AmorSaúde.

- **Visualização pública** em `/` — árvore interativa sem login
- **Painel admin** em `/admin` — CRUD completo com autenticação Supabase

**Stack:** React + Vite + Tailwind CSS + Supabase

---

## 1. Criar projeto no Supabase

1. Acesse [supabase.com/dashboard](https://supabase.com/dashboard) e faça login
2. Clique em **New project**
3. Escolha nome, senha do banco e região
4. Aguarde o provisionamento (~1 minuto)

---

## 2. Obter as chaves de API

No painel do seu projeto:

1. Vá em **Settings → API**
2. Copie **Project URL** → será o `VITE_SUPABASE_URL`
3. Copie **anon public** (em Project API Keys) → será o `VITE_SUPABASE_ANON_KEY`

---

## 3. Configurar variáveis de ambiente

Na raiz do projeto, crie o arquivo `.env`:

```
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
VITE_SUPABASE_ANON_KEY=sua-anon-key
```

> ⚠️ O arquivo `.env` está no `.gitignore`. Nunca o comite.

---

## 4. Rodar as migrations no Supabase SQL Editor

No painel do Supabase: **SQL Editor → New Query**

Execute os arquivos na ordem abaixo (copie e cole o conteúdo de cada um):

| Ordem | Arquivo | O que faz |
|-------|---------|-----------|
| 1 | `supabase/migrations/001_create_employees.sql` | Cria tabelas, triggers e audit log |
| 2 | `supabase/migrations/002_rls_policies.sql` | Ativa RLS e define políticas de acesso |
| 3 | `supabase/migrations/003_seed_data.sql` | Insere o organograma inicial 2026 |

---

## 5. Criar bucket de fotos no Supabase Storage

1. No painel: **Storage → Create a new bucket**
2. Nome: `employee-photos`
3. Marque como **Public bucket** (para exibir fotos no organograma)
4. Clique em **Create bucket**

As políticas de acesso para o storage já estão incluídas na migration `002_rls_policies.sql`.

---

## 6. Criar usuário admin

No painel do Supabase: **Authentication → Users → Add user → Create new user**

- Email: `admin@amorsaude.com` (ou outro de sua preferência)
- Password: uma senha segura
- Marque **Auto confirm user**

---

## 7. Instalar dependências e rodar localmente

```bash
npm install
npm run dev
```

A aplicação estará disponível em `http://localhost:5173`.

| Rota | Descrição |
|------|-----------|
| `/` | Organograma público (sem login) |
| `/login` | Login do admin |
| `/admin` | Dashboard admin (requer login) |
| `/admin/employees` | Lista de colaboradores |
| `/admin/employees/new` | Adicionar colaborador |
| `/admin/employees/:id/edit` | Editar colaborador |
| `/admin/audit` | Log de auditoria |

---

## 8. Deploy (Vercel ou Netlify)

### Vercel

```bash
npx vercel --prod
```

Configure as variáveis de ambiente `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` no painel da Vercel em **Settings → Environment Variables**.

### Netlify

```bash
npx netlify deploy --prod --dir=dist
```

Crie um arquivo `public/_redirects` com:
```
/*  /index.html  200
```

---

## Identidade visual

| Cor | Hex |
|-----|-----|
| Azul Apatita (principal) | `#61C1D0` |
| Vermelho (destaque/CTAs) | `#D73834` |
| Azul Escuro (navbar/textos) | `#0C223C` |
| Branco | `#FFFFFF` |
