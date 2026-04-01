export type PfAccountType =
  | "checking"
  | "savings"
  | "credit_card"
  | "cash"
  | "investment"
  | "other";

export type PfCategoryKind = "income" | "expense";

export type PfRecurringFrequency =
  | "daily"
  | "weekly"
  | "biweekly"
  | "monthly"
  | "quarterly"
  | "yearly";

export type PfTransactionKind = "income" | "expense" | "transfer";

export type PfBudgetPeriod = "monthly" | "yearly";

export type PfAccount = {
  id: string;
  user_id: string;
  name: string;
  type: PfAccountType;
  currency: string;
  initial_balance: number;
  institution: string | null;
  notes: string | null;
  archived_at: string | null;
  created_at: string;
  updated_at: string;
};

export type PfCategory = {
  id: string;
  user_id: string | null;
  is_system: boolean;
  name: string;
  slug: string | null;
  kind: PfCategoryKind;
  color: string | null;
  created_at: string;
  updated_at: string;
};

export type PfRecurring = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  description: string | null;
  frequency: PfRecurringFrequency;
  next_due_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type PfTransaction = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  recurring_id: string | null;
  kind: PfTransactionKind;
  amount: number;
  occurred_on: string;
  description: string | null;
  notes: string | null;
  counterparty_account_id: string | null;
  created_at: string;
  updated_at: string;
};

export type PfBudget = {
  id: string;
  user_id: string;
  category_id: string;
  amount_limit: number;
  period_type: PfBudgetPeriod;
  period_year: number;
  period_month: number | null;
  created_at: string;
  updated_at: string;
};

export type PfOnboardingStatus = {
  user_id: string;
  step_accounts_done: boolean;
  step_categories_done: boolean;
  step_first_transaction_done: boolean;
  dismissed_at: string | null;
  updated_at: string;
};
