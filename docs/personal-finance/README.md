# Módulo Personal Finance (Finweb)

## Criar o banco no Supabase

1. Crie um projeto em [Supabase](https://supabase.com).
2. Em **SQL Editor**, cole e execute o arquivo `database-schema.sql` (ordem já definida no script: tipos → tabelas → triggers → RLS → seed).
3. Confirme em **Table Editor** as tabelas `pf_*`.
4. O seed de categorias globais exige permissão de escrita nas linhas com `user_id` nulo; execução no SQL Editor como administrador costuma ser suficiente.

## Variáveis de ambiente (app Next.js)

Copie `.env.example` para `.env.local` e preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Ative provedores de auth em **Authentication** no painel Supabase.

## Relacionamento das tabelas (resumo)

- `pf_accounts`, `pf_recurring`, `pf_transactions`, `pf_budgets`, `pf_onboarding_status`: sempre escopo do titular (`user_id` = `auth.uid()` nas políticas).
- `pf_categories`: `user_id` nulo + `is_system` = catálogo global (leitura para todos); categorias do usuário com `user_id` preenchido.
- `pf_transactions` referencia `pf_accounts` e opcionalmente `pf_categories`, `pf_recurring`; transferências usam `counterparty_account_id`.
- `pf_budgets` referencia `pf_categories` (pode ser categoria global ou do usuário).

Para o relatório acadêmico, o isolamento é **RLS com `auth.uid()`**; as APIs Next.js também restringem por usuário da sessão ao usar o cliente com cookie de sessão.
