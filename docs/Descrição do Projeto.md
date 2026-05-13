# Descrição do Projeto — Finweb

## Objetivo

O **Finweb** é um projeto voltado a pessoas com vida financeira desorganizada. Fatores como falta de tempo podem levar à perda de controle sobre o dinheiro. A proposta é apoiar a **retomada** do controle financeiro de forma gradual, com uma aplicação web e dados centralizados de forma segura.

## Visão de produto: assistência com inteligência artificial

A direção do produto inclui **agentes de inteligência artificial** com os quais o usuário pode: indicar contas principais, enviar comprovantes, registrar salário, **consultar saldo**, **gastos do mês** e **quanto ainda pode gastar** em uma semana, mês ou período. O agente seria configurado em etapas, começando por um **onboarding** que identifica contas e cartões, renda mensal, categorias de gasto alinhadas ao estilo de vida e metas — para classificar movimentos e acompanhar o progresso em relação às metas.

*Nota:* a camada de conversação com IA e automação completa integra-se naturalmente às **APIs** e a fluxos como **n8n** (ver abaixo); a interface de chat do agente não é o foco principal do repositório neste momento.

---

## O que o sistema faz hoje (funcionalidades)

### Acesso, conta e navegação

- **Página inicial** (`/`) com apresentação do projeto e atalhos para entrar ou abrir o painel.
- **Cadastro e login** com **Supabase Auth** (e-mail e senha): páginas de cadastro e login, fluxo **OAuth/callback** e redirecionamento para o painel (`/personal-finance`) quando autenticado.
- **Área autenticada** com barra superior (navegação entre módulos), menu do usuário (e-mail, saída de sessão) e atalho **Novo Lançamento** para transações.
- **Proteção de rotas:** o painel exige sessão válida; sem login, o usuário é encaminhado para o login.

### Painel de finanças pessoais (`/personal-finance`)

- **Cabeçalho** com indicadores de resumo (ligados aos dados do usuário quando existem).
- **Gastos por categoria** (visualização agregada no período).
- **Próximos vencimentos** com base em **lançamentos recorrentes**, com ligação à página de recorrências.
- **Transações recentes** e **resultado ao longo do tempo** (gráfico de evolução).
- **Blocos de exemplo** na interface (por exemplo destaques de mercado/investimentos) podem aparecer como **conteúdo ilustrativo** do layout, não como cotações em tempo real integradas.

### Contas (`/personal-finance/accounts`)

- Listagem em **grade ou lista**, com **tipos** de conta suportados pelo modelo: conta corrente, poupança, cartão de crédito, dinheiro em espécie, investimento, outros; moeda, instituição, notas e **arquivamento** de conta.
- **Patrimônio agregado** e resumo visual; quando ainda não há contas criadas, a UI pode mostrar **dados de demonstração** para o layout.
- **API:** criação, leitura, atualização e remoção de contas do usuário autenticado.

### Transações (`/personal-finance/transactions`)

- Lista de movimentos **agrupada por dia**, com filtro por **intervalo de datas** (por exemplo mês corrente).
- Suporte no modelo a **receitas**, **despesas** e **transferências entre contas** (com conta de contraparte); associação opcional a **categoria** e a **recorrência**.
- **API:** listagem paginada por datas, criação, leitura, atualização e remoção de transações.
- **Interface:** o **formulário completo de novo lançamento** na web está em **placeholder**; os lançamentos podem ser criados via **API** (ou ferramentas externas) até essa UI estar finalizada.

### Orçamentos (`/personal-finance/budgets`)

- Orçamentos por **categoria**, com **limite** e **período** mensal ou anual.
- Visualização de **progresso** face às despesas do período (combinação de orçamentos com resumo agregado).
- Sem dados reais, a UI pode apresentar **cenários de demonstração**.
- **API:** gestão completa (CRUD) dos orçamentos do usuário.

### Categorias (`/personal-finance/categories`)

- **Catálogo global** (sistema) e **categorias próprias** do usuário; distinção entre categorias de **receita** e **despesa**.
- Filtros na interface por tipo; listagem e métricas de utilização quando há dados.
- **API:** listagem, criação, atualização e remoção (conforme regras de negócio e RLS).

### Recorrências (`/personal-finance/recurring`)

- Definição de pagamentos/receitas **recorrentes** com **frequência** (diária, semanal, quinzenal, mensal, trimestral, anual), **próxima data**, conta, valor e estado ativo/inativo.
- Listagem e detalhe na UI; **API** com CRUD.

### Onboarding (estado guardado)

- Registo de **etapas concluídas**: contas configuradas, categorias configuradas, primeira transação; possibilidade de **dispensar** o assistente e atualizar estado via **API** (`GET`/`PUT` em onboarding).
- Componentes de UI podem **sugerir** próximos passos com base nesse estado.

### Dados, segurança e camada técnica

- Persistência em **PostgreSQL (Supabase)** com tabelas `pf_*` (contas, transações, categorias, orçamentos, recorrências, estado de onboarding).
- **Isolamento por usuário** com **Row Level Security (RLS)** e `auth.uid()`, alinhado à sessão da aplicação **Next.js**.
- **API Routes** em `/api/personal-finance/*` para todas as operações acima, com validação e paginação onde aplicável.
- **Agregações:** endpoint de **resumo** (totais de receita/despesa, resultado, soma de saldos iniciais, despesas por categoria num intervalo `from`/`to`).

### Integração externa (automação / agentes)

- Rota de **verificação** sob `/api/personal-finance/n8n/*`, protegida por **chave de API** (`x-api-key` / variável de ambiente), preparada para **n8n** ou outros serviços que integrem lançamentos ou consultas sem passar pelo browser.
- O **guia** na raiz do repositório (`guia.md`) descreve o prefixo das APIs e o papel das rotas n8n para documentação ou trabalhos acadêmicos.

---

## Limitações atuais (resumo)

- Formulário web de **criação de transação** ainda não substitui o uso da API.
- Alguns botões ou seções da UI são **protótipo** (ex.: “Nova Conta”, relatórios) sem fluxo completo ligado em todas as telas.
- A **conversa com agente de IA** e rotas n8n além do *health* dependem de configuração e evolução do produto.

---

## Referências

### Documentação no repositório do projeto (Finweb)

| # | Referência | Caminho no repositório |
|---|------------|-------------------------|
| 1 | Descrição do produto, funcionalidades e referências | `docs/Descrição do Projeto.md` |
| 2 | Módulo Personal Finance: Supabase, variáveis de ambiente, tabelas `pf_*`, RLS | `docs/personal-finance/README.md` |
| 3 | Script SQL (schema, RLS, seed) | `docs/personal-finance/database-schema.sql` |
| 4 | Variáveis `NEXT_PUBLIC_SUPABASE_*` e `.env.local` | `docs/personal-finance/README.md`, seção «Variáveis de ambiente (app Next.js)» |
| 5 | APIs, hooks e integração n8n (mapa do código) | `guia.md` |

### Documentação externa (tecnologias citadas)

| # | Tecnologia | Documentação oficial |
|---|------------|----------------------|
| 6 | Supabase | https://supabase.com/docs |
| 7 | Next.js | https://nextjs.org/docs |
| 8 | React | https://react.dev |
| 9 | Tailwind CSS | https://tailwindcss.com/docs |
