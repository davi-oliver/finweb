# Finanças pessoais (Personal Finance) — guia acadêmico de implementação

**Propósito:** este texto serve como **modelo conceitual e roteiro de laboratório** para apresentar uma implementação de serviço web de finanças pessoais (contas, orçamentos, recorrências, categorias e visão resumida). Não substitui documentação de produto nem expõe regras de negócio completas — use como base didática e complete os itens marcados como *A fazer* conforme seu trabalho.

**Modelo de titularidade (trabalho):** assume-se **pessoa física única** — cada registro de finanças pertence a um **usuário autenticado** (`user_id` ou equivalente). Não há organização, empresa nem tabela de vínculo usuário–empresa neste modelo didático.

**Escopo de páginas (dashboard):**

| Rota | Função resumida |
|------|-----------------|
| `/personal-finance` | Painel: resumo, gráficos, orçamentos, recorrências, lista de transações, onboarding |
| `/personal-finance/accounts` | CRUD de contas |
| `/personal-finance/budgets` | Orçamentos por categoria |
| `/personal-finance/recurring` | Lançamentos recorrentes |
| `/personal-finance/categories` | Categorias (receita/despesa) |
| `/personal-finance/transactions` | Transações (complemento ao painel; útil para trabalhos que exijam "movimentação") |

Entrada no menu: `components/sidebar.tsx` (item com `featureFlag: "personal_finance"`).

---

## 1. Stack sugerida e criação do projeto Next.js

**No repositório atual:** App Router (Next.js), React, TypeScript, Supabase (auth + Postgres), UI com componentes em `components/ui`.

**Roteiro mínimo para reproduzir um protótipo semelhante:**

1. `npx create-next-app@latest` — TypeScript, App Router, ESLint.
2. Instalar cliente Supabase: `@supabase/supabase-js`, `@supabase/ssr` (sessão em cookies no servidor).
3. Organizar pastas: `app/(dashboard)/...` para páginas autenticadas; `app/api/...` para Route Handlers.
4. Configurar autenticação (ex.: Supabase Auth) de modo que **todo acesso às tabelas do módulo** seja filtrado pelo **usuário logado** (chave estrangeira `user_id` nas tabelas do domínio, ou política RLS equivalente).

*A fazer (trabalho):* descrever no relatório a escolha de monólito Next vs. API separada; justificar uso de RLS no banco ou camada só em API.

---

## 2. Variáveis de ambiente

| Variável | Uso típico no módulo |
|----------|----------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Cliente browser / `createServerClient` (cookies) |
| `SUPABASE_SERVICE_ROLE_KEY` | (Se usar cliente privilegiado no servidor) bypass de RLS nas rotas; no modelo PF, o código deve **sempre** restringir por `user_id` do titular — ver `utils/supabase/admin.ts` no repositório de referência |
| `N8N_API_KEY` | Protege rotas em `app/api/personal-finance/n8n/*` (header `x-api-key`) — integração com automação/agentes; **não versionar valores reais** |

Arquivos de referência no repositório: `utils/supabase/server.ts`, `utils/supabase/admin.ts`. Para o modelo **somente PF**, trate a função de contexto em `_shared.ts` como **inspiração**: substitua qualquer resolução de "empresa" por **identificação do usuário titular** das finanças.

*A fazer:* listar no trabalho quais variáveis são obrigatórias para rodar só o dashboard vs. só as rotas `n8n`.

---

## 3. Modelo de sessão (pessoa física)

Fluxo conceitual das APIs "normais" (usuário logado):

1. Obter o **identificador do usuário** via sessão (ex.: Supabase Auth).
2. Em toda leitura/escrita, aplicar `WHERE user_id = <sessão>` (ou coluna equivalente) nas entidades do módulo.
3. Categorias **globais** (catálogo padrão) podem ter `user_id` nulo ou uma flag explícita de "sistema", visíveis a todos os usuários em leitura, conforme você definir no trabalho.

*A fazer:* diagrama simples (usuário autenticado → tabelas `pf_*` do mesmo titular).

**Nota:** o código em `app/api/personal-finance/_shared.ts` segue outro desenho (contexto corporativo). Para o relatório acadêmico, documente **apenas** o fluxo PF acima; adapte nomes de colunas ao seu script SQL simplificado.

---

## 4. APIs principais (arquivos a estudar)

### 4.1 APIs com sessão do usuário (dashboard)

Prefixo: `/api/personal-finance/`

| Área | Arquivo(s) principal(is) |
|------|----------------------------|
| Contas | `accounts/route.ts`, `accounts/[id]/route.ts` |
| Categorias | `categories/route.ts`, `categories/[id]/route.ts` |
| Orçamentos | `budgets/route.ts`, `budgets/[id]/route.ts` |
| Recorrências | `recurring/route.ts`, `recurring/[id]/route.ts` |
| Transações | `transactions/route.ts`, `transactions/[id]/route.ts` |
| Resumo agregado | `summary/route.ts` |
| Onboarding | `onboarding-status/route.ts` |

Utilitários compartilhados: `app/api/personal-finance/_shared.ts` (paginação, slug, validação de data, checagens de titularidade — no trabalho PF, equivalente a "registro pertence ao `user_id` da sessão" e "categoria visível ao titular").

### 4.2 APIs para integração (n8n / serviço externo)

Prefixo: `/api/personal-finance/n8n/`

Autenticação: header `x-api-key` alinhado a `N8N_API_KEY`. Lógica auxiliar: `app/api/personal-finance/n8n/_shared.ts`.

*A fazer:* no trabalho, documentar **apenas** o contrato que você efetivamente consumir (método + path + campos mínimos), sem copiar payloads completos de produção.

---

## 5. Hooks do front-end (dados)

Local: `app/(dashboard)/(modules)/(hook)/`

| Hook | Responsabilidade resumida |
|------|---------------------------|
| `use-pf-accounts.tsx` | Contas |
| `use-pf-budgets.tsx` | Orçamentos |
| `use-pf-categories.tsx` | Categorias |
| `use-pf-recurring.tsx` | Recorrências |
| `use-pf-summary.tsx` | Resumo / saldos / agregações |
| `use-pf-transactions.tsx` | Transações |
| `use-pf-onboarding-status.tsx` | Etapas de onboarding |

Tipos TypeScript compartilhados: `personal-finance-types.ts`.

---

## 6. Componentes de UI (módulo)

Pasta: `app/components/PersonalFinance/`

| Componente | Uso típico |
|------------|------------|
| `pf-summary-cards.tsx` | Cartões de totais |
| `pf-result-over-time-chart.tsx` | Evolução no período |
| `pf-by-category-chart.tsx` | Distribuição por categoria |
| `pf-budget-progress.tsx` | Progresso de orçamento |
| `pf-recurring-list.tsx` | Lista de recorrências |
| `pf-transactions-screen.tsx` / `pf-create-transaction-modal.tsx` | Lista e modal de novo lançamento |
| `pf-account-card.tsx` | Cartão de conta no resumo |

*A fazer:* escolher 2–3 componentes e explicar quais endpoints alimentam cada um.

---

## 7. Tabelas do banco de dados (módulo `pf_*`)

Definição completa (SQL): `docs/personal-finance/database-schema.sql`.

### 7.1 Tabelas do domínio Personal Finance

| Tabela | Papel (modelo PF) |
|--------|-------------------|
| `pf_accounts` | Contas/carteiras do titular (tipo, saldo inicial, moeda, etc.) |
| `pf_categories` | Categorias receita/despesa; opcional: linhas sem titular = catálogo global |
| `pf_recurring` | Recorrências (frequência, valores, conta + categoria do mesmo titular) |
| `pf_transactions` | Lançamentos (transferência, vínculo opcional com recorrência) |
| `pf_budgets` | Limite por categoria e período (mensal/anual) |
| `pf_onboarding_status` | Flags de conclusão do setup **por usuário** (uma linha por titular) |

Em um desenho mínimo, cada tabela acima inclui **`user_id`** (UUID ou FK para a tabela de usuários do provedor de auth), exceto as linhas de categoria global que você optar por compartilhar.

### 7.2 Autenticação e titular

- O provedor de login (ex.: Supabase Auth) fornece o **usuário atual**; esse identificador é a **única fronteira** entre os dados de uma pessoa e outra.
- *A fazer:* definir no SQL se usará RLS com `auth.uid()` ou apenas API Next filtrando por `user_id`.

O arquivo `docs/personal-finance/database-schema.sql` deste repositório descreve um schema **mais amplo** (contexto corporativo). Para o trabalho, use-o como **referência de campos e relacionamentos entre `pf_*`**, migrando a chave de isolamento para **`user_id`** onde hoje existir `company_id`.

---

## 8. Funcionalidades principais (visão funcional)

- **Contas:** cadastro, tipos (corrente, poupança, cartão, etc.), saldo inicial; uso nas transações e no resumo.
- **Categorias:** receita vs. despesa; categorias globais seed + categorias **do próprio titular**.
- **Orçamentos:** limite por categoria e período; comparar com gastos do período (detalhe de cálculo: ver `summary` e componentes de progresso).
- **Recorrências:** agenda de próximos vencimentos e vínculo com conta/categoria.
- **Transações:** registro manual (e metadados opcionais); alimenta gráficos e orçamentos.
- **Painel:** filtro por intervalo de datas, onboarding guiado, links para subpáginas.

*A fazer:* para o relatório da faculdade, descrever **fluxos em 3–5 passos** (ex.: "criar conta → criar categoria → lançar despesa → ver orçamento") sem copiar regras internas linha a linha.

---

## 9. Backlog didático (*A fazer* — extensões)

Use esta lista como entregáveis opcionais do trabalho ou como "próximas iterações":

- [ ] Testes automatizados (Vitest) nas rotas críticas de leitura/escrita.
- [ ] Especificação OpenAPI ou tabela mínima request/response por recurso.
- [ ] Modo "demo" com dados fictícios e sem chaves reais.
- [ ] Tratamento de `transfer` entre contas (regras e consistência de saldo).
- [ ] Relatório PDF ou exportação CSV do período.
- [ ] Internacionalização (moeda e locale).
- [ ] Endurecimento de CORS e remoção de `*` em produção, se aplicável.

---

## 10. Arquivos índice (checklist de leitura)

1. `docs/personal-finance/database-schema.sql` — referência de estrutura `pf_*` (adaptar isolamento para `user_id` no trabalho).
2. `app/api/personal-finance/_shared.ts` — helpers reutilizáveis; **substituir** o conceito de contexto corporativo pelo de **titular PF** na sua implementação.
3. `app/(dashboard)/personal-finance/page.tsx` — composição do painel.
4. `app/(dashboard)/personal-finance/{accounts,budgets,recurring,categories}/page.tsx` — submódulos.
5. Hooks `use-pf-*.tsx` e `personal-finance-types.ts`.
6. `docs/personal-finance/README.md` — estado do módulo e backlog de agentes (contexto operacional; opcional para o trabalho).

---

*Documento gerado como base acadêmica: ajuste nomes, exemplos e diagramas à linguagem do seu curso; não inclua segredos ou dados reais.*
