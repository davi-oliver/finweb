-- =============================================================================
-- Finweb — Personal Finance (pf_*) — PostgreSQL / Supabase
-- Modelo: titular único (pessoa física). Isolamento por auth.uid() via RLS.
-- Aplicar no SQL Editor do Supabase ou via migração (supabase db push).
-- =============================================================================

-- Extensões (geralmente já habilitadas no Supabase)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- -----------------------------------------------------------------------------
-- Tipos enumerados (opcional; text + CHECK também serve para trabalhos simples)
-- -----------------------------------------------------------------------------
DO $$ BEGIN
  CREATE TYPE pf_account_type AS ENUM (
    'checking', 'savings', 'credit_card', 'cash', 'investment', 'other'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pf_category_kind AS ENUM ('income', 'expense');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pf_recurring_frequency AS ENUM (
    'daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'
  );
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pf_transaction_kind AS ENUM ('income', 'expense', 'transfer');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE pf_budget_period AS ENUM ('monthly', 'yearly');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- -----------------------------------------------------------------------------
-- Função: updated_at automático
-- -----------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- pf_accounts — contas / carteiras do titular
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pf_accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  name text NOT NULL,
  type pf_account_type NOT NULL DEFAULT 'other',
  currency text NOT NULL DEFAULT 'BRL',
  initial_balance numeric(19, 4) NOT NULL DEFAULT 0,
  institution text,
  notes text,
  archived_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pf_accounts_name_not_empty CHECK (length(trim(name)) > 0)
);

CREATE INDEX IF NOT EXISTS idx_pf_accounts_user ON public.pf_accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_pf_accounts_user_archived
  ON public.pf_accounts (user_id) WHERE archived_at IS NULL;

DROP TRIGGER IF EXISTS tr_pf_accounts_updated ON public.pf_accounts;
CREATE TRIGGER tr_pf_accounts_updated
  BEFORE UPDATE ON public.pf_accounts
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- pf_categories — receita / despesa; user_id NULL = catálogo global (sistema)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pf_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users (id) ON DELETE CASCADE,
  is_system boolean NOT NULL DEFAULT false,
  name text NOT NULL,
  slug text,
  kind pf_category_kind NOT NULL,
  color text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pf_categories_name_not_empty CHECK (length(trim(name)) > 0),
  CONSTRAINT pf_categories_system_consistency CHECK (
    (is_system = true AND user_id IS NULL) OR (is_system = false)
  )
);

CREATE INDEX IF NOT EXISTS idx_pf_categories_user ON public.pf_categories (user_id);
CREATE INDEX IF NOT EXISTS idx_pf_categories_kind ON public.pf_categories (kind);

DROP TRIGGER IF EXISTS tr_pf_categories_updated ON public.pf_categories;
CREATE TRIGGER tr_pf_categories_updated
  BEFORE UPDATE ON public.pf_categories
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- pf_recurring — recorrências
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pf_recurring (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.pf_accounts (id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.pf_categories (id) ON DELETE SET NULL,
  amount numeric(19, 4) NOT NULL,
  description text,
  frequency pf_recurring_frequency NOT NULL DEFAULT 'monthly',
  next_due_date date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pf_recurring_amount_positive CHECK (amount > 0)
);

CREATE INDEX IF NOT EXISTS idx_pf_recurring_user ON public.pf_recurring (user_id);
CREATE INDEX IF NOT EXISTS idx_pf_recurring_next ON public.pf_recurring (user_id, next_due_date);

DROP TRIGGER IF EXISTS tr_pf_recurring_updated ON public.pf_recurring;
CREATE TRIGGER tr_pf_recurring_updated
  BEFORE UPDATE ON public.pf_recurring
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- pf_transactions — lançamentos
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pf_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES public.pf_accounts (id) ON DELETE CASCADE,
  category_id uuid REFERENCES public.pf_categories (id) ON DELETE SET NULL,
  recurring_id uuid REFERENCES public.pf_recurring (id) ON DELETE SET NULL,
  kind pf_transaction_kind NOT NULL,
  amount numeric(19, 4) NOT NULL,
  occurred_on date NOT NULL DEFAULT (CURRENT_DATE),
  description text,
  notes text,
  counterparty_account_id uuid REFERENCES public.pf_accounts (id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pf_transactions_amount_positive CHECK (amount > 0),
  CONSTRAINT pf_transactions_transfer_accounts CHECK (
    (kind <> 'transfer') OR (counterparty_account_id IS NOT NULL AND counterparty_account_id <> account_id)
  ),
  CONSTRAINT pf_transactions_category_when_not_transfer CHECK (
    (kind = 'transfer') OR (category_id IS NOT NULL)
  )
);

CREATE INDEX IF NOT EXISTS idx_pf_transactions_user_date
  ON public.pf_transactions (user_id, occurred_on DESC);
CREATE INDEX IF NOT EXISTS idx_pf_transactions_account ON public.pf_transactions (account_id);

DROP TRIGGER IF EXISTS tr_pf_transactions_updated ON public.pf_transactions;
CREATE TRIGGER tr_pf_transactions_updated
  BEFORE UPDATE ON public.pf_transactions
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- pf_budgets — limite por categoria e período
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pf_budgets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users (id) ON DELETE CASCADE,
  category_id uuid NOT NULL REFERENCES public.pf_categories (id) ON DELETE CASCADE,
  amount_limit numeric(19, 4) NOT NULL,
  period_type pf_budget_period NOT NULL DEFAULT 'monthly',
  period_year smallint NOT NULL,
  period_month smallint,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT pf_budgets_amount_positive CHECK (amount_limit >= 0),
  CONSTRAINT pf_budgets_month_for_monthly CHECK (
    (period_type = 'monthly' AND period_month BETWEEN 1 AND 12)
    OR (period_type = 'yearly' AND period_month IS NULL)
  ),
  CONSTRAINT pf_budgets_unique_per_category_period UNIQUE (user_id, category_id, period_type, period_year, period_month)
);

CREATE INDEX IF NOT EXISTS idx_pf_budgets_user_period ON public.pf_budgets (user_id, period_year, period_month);

DROP TRIGGER IF EXISTS tr_pf_budgets_updated ON public.pf_budgets;
CREATE TRIGGER tr_pf_budgets_updated
  BEFORE UPDATE ON public.pf_budgets
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- pf_onboarding_status — uma linha por usuário
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.pf_onboarding_status (
  user_id uuid PRIMARY KEY REFERENCES auth.users (id) ON DELETE CASCADE,
  step_accounts_done boolean NOT NULL DEFAULT false,
  step_categories_done boolean NOT NULL DEFAULT false,
  step_first_transaction_done boolean NOT NULL DEFAULT false,
  dismissed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);

DROP TRIGGER IF EXISTS tr_pf_onboarding_updated ON public.pf_onboarding_status;
CREATE TRIGGER tr_pf_onboarding_updated
  BEFORE UPDATE ON public.pf_onboarding_status
  FOR EACH ROW EXECUTE PROCEDURE public.set_updated_at();

-- =============================================================================
-- RLS — políticas por titular (auth.uid())
-- =============================================================================
ALTER TABLE public.pf_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_recurring ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pf_onboarding_status ENABLE ROW LEVEL SECURITY;

-- pf_accounts
DROP POLICY IF EXISTS "pf_accounts_select_own" ON public.pf_accounts;
DROP POLICY IF EXISTS "pf_accounts_insert_own" ON public.pf_accounts;
DROP POLICY IF EXISTS "pf_accounts_update_own" ON public.pf_accounts;
DROP POLICY IF EXISTS "pf_accounts_delete_own" ON public.pf_accounts;
CREATE POLICY "pf_accounts_select_own" ON public.pf_accounts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pf_accounts_insert_own" ON public.pf_accounts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_accounts_update_own" ON public.pf_accounts FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_accounts_delete_own" ON public.pf_accounts FOR DELETE USING (auth.uid() = user_id);

-- pf_categories: leitura global (sistema) + próprias
DROP POLICY IF EXISTS "pf_categories_select_visible" ON public.pf_categories;
DROP POLICY IF EXISTS "pf_categories_insert_own" ON public.pf_categories;
DROP POLICY IF EXISTS "pf_categories_update_own" ON public.pf_categories;
DROP POLICY IF EXISTS "pf_categories_delete_own" ON public.pf_categories;
CREATE POLICY "pf_categories_select_visible" ON public.pf_categories FOR SELECT
  USING (user_id IS NULL OR auth.uid() = user_id);
CREATE POLICY "pf_categories_insert_own" ON public.pf_categories FOR INSERT
  WITH CHECK (auth.uid() = user_id AND is_system = false);
CREATE POLICY "pf_categories_update_own" ON public.pf_categories FOR UPDATE
  USING (auth.uid() = user_id AND is_system = false)
  WITH CHECK (auth.uid() = user_id AND is_system = false);
CREATE POLICY "pf_categories_delete_own" ON public.pf_categories FOR DELETE
  USING (auth.uid() = user_id AND is_system = false);

-- pf_recurring
DROP POLICY IF EXISTS "pf_recurring_select_own" ON public.pf_recurring;
DROP POLICY IF EXISTS "pf_recurring_insert_own" ON public.pf_recurring;
DROP POLICY IF EXISTS "pf_recurring_update_own" ON public.pf_recurring;
DROP POLICY IF EXISTS "pf_recurring_delete_own" ON public.pf_recurring;
CREATE POLICY "pf_recurring_select_own" ON public.pf_recurring FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pf_recurring_insert_own" ON public.pf_recurring FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_recurring_update_own" ON public.pf_recurring FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_recurring_delete_own" ON public.pf_recurring FOR DELETE USING (auth.uid() = user_id);

-- pf_transactions
DROP POLICY IF EXISTS "pf_transactions_select_own" ON public.pf_transactions;
DROP POLICY IF EXISTS "pf_transactions_insert_own" ON public.pf_transactions;
DROP POLICY IF EXISTS "pf_transactions_update_own" ON public.pf_transactions;
DROP POLICY IF EXISTS "pf_transactions_delete_own" ON public.pf_transactions;
CREATE POLICY "pf_transactions_select_own" ON public.pf_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pf_transactions_insert_own" ON public.pf_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_transactions_update_own" ON public.pf_transactions FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_transactions_delete_own" ON public.pf_transactions FOR DELETE USING (auth.uid() = user_id);

-- pf_budgets
DROP POLICY IF EXISTS "pf_budgets_select_own" ON public.pf_budgets;
DROP POLICY IF EXISTS "pf_budgets_insert_own" ON public.pf_budgets;
DROP POLICY IF EXISTS "pf_budgets_update_own" ON public.pf_budgets;
DROP POLICY IF EXISTS "pf_budgets_delete_own" ON public.pf_budgets;
CREATE POLICY "pf_budgets_select_own" ON public.pf_budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pf_budgets_insert_own" ON public.pf_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_budgets_update_own" ON public.pf_budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_budgets_delete_own" ON public.pf_budgets FOR DELETE USING (auth.uid() = user_id);

-- pf_onboarding_status
DROP POLICY IF EXISTS "pf_onboarding_select_own" ON public.pf_onboarding_status;
DROP POLICY IF EXISTS "pf_onboarding_insert_own" ON public.pf_onboarding_status;
DROP POLICY IF EXISTS "pf_onboarding_update_own" ON public.pf_onboarding_status;
DROP POLICY IF EXISTS "pf_onboarding_delete_own" ON public.pf_onboarding_status;
CREATE POLICY "pf_onboarding_select_own" ON public.pf_onboarding_status FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "pf_onboarding_insert_own" ON public.pf_onboarding_status FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_onboarding_update_own" ON public.pf_onboarding_status FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "pf_onboarding_delete_own" ON public.pf_onboarding_status FOR DELETE USING (auth.uid() = user_id);

-- =============================================================================
-- Seed: categorias globais (idempotente por slug; role com permissão em pf_categories)
-- =============================================================================
INSERT INTO public.pf_categories (user_id, is_system, name, slug, kind, color)
SELECT v.user_id, v.is_system, v.name, v.slug, v.kind::pf_category_kind, v.color
FROM (
  VALUES
    (NULL::uuid, true, 'Salário', 'salary', 'income', '#22c55e'),
    (NULL::uuid, true, 'Freelance', 'freelance', 'income', '#16a34a'),
    (NULL::uuid, true, 'Outras receitas', 'other-income', 'income', '#86efac'),
    (NULL::uuid, true, 'Moradia', 'housing', 'expense', '#ef4444'),
    (NULL::uuid, true, 'Alimentação', 'food', 'expense', '#f97316'),
    (NULL::uuid, true, 'Transporte', 'transport', 'expense', '#eab308'),
    (NULL::uuid, true, 'Saúde', 'health', 'expense', '#ec4899'),
    (NULL::uuid, true, 'Educação', 'education', 'expense', '#8b5cf6'),
    (NULL::uuid, true, 'Lazer', 'leisure', 'expense', '#6366f1'),
    (NULL::uuid, true, 'Outras despesas', 'other-expense', 'expense', '#64748b')
) AS v(user_id, is_system, name, slug, kind, color)
WHERE NOT EXISTS (
  SELECT 1 FROM public.pf_categories c
  WHERE c.user_id IS NULL AND c.slug = v.slug
);

COMMENT ON TABLE public.pf_accounts IS 'Contas do titular (PF); RLS por user_id.';
COMMENT ON TABLE public.pf_categories IS 'Categorias; user_id NULL + is_system = catálogo global.';
COMMENT ON TABLE public.pf_transactions IS 'Lançamentos; kind transfer usa counterparty_account_id.';
