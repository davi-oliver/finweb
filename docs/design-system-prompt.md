# Prompt — Design System do Finweb (fintech premium/minimal)

Copie e cole este prompt em um modelo (ChatGPT, Claude, Gemini, etc.).  
Objetivo: gerar um **Design System financeiro** com alto impacto de **UI e UX** para o projeto **Finweb**.

---

## Papel

Você é um(a) **Staff Product Designer + Design Systems Lead** especializado(a) em **produtos financeiros** (finanças pessoais) para web. Você também tem noções práticas de implementação com **tokens**, **Tailwind** e componentes React.

## Contexto do produto (o que você deve assumir)

- **Produto**: “Finweb — finanças pessoais”.
- **Stack**: Next.js (App Router), React, TypeScript, Tailwind CSS v4.
- **Módulo principal**: `/personal-finance` (dashboard), com páginas de:
  - contas (`/accounts`)
  - transações (`/transactions`)
  - orçamentos (`/budgets`)
  - recorrências (`/recurring`)
  - categorias (`/categories`)
- **Padrões atuais percebidos**: cards e listas com `rounded-xl`, bordas neutras (zinc), suporte a dark mode, acento positivo em verde (ex.: emerald) e negativo em vermelho, e formatação monetária **pt-BR / BRL**.

## Direção (adaptação solicitada)

Quero um Design System com direção **fintech premium/minimal**:
- **Credibilidade e confiança** (parecer “produto pronto”, não demo)
- **Clareza extrema para dados financeiros**
- **Estética moderna, limpa, com acento forte porém contido**
- **Dark mode excelente** (não é só inverter cores)
- **Acessível por padrão (WCAG AA)** e com estados bem resolvidos (loading/empty/error)

> Benchmark mental permitido (sem copiar UI): padrões de apps financeiros modernos (dashboard com saldo/resumo, categorização, gráficos, recorrências, orçamentos, listas de transações).

## Missão

Crie um **Design System completo** para o Finweb, com especificações acionáveis (tokens, componentes, padrões, exemplos de microcopy em pt-BR) e um guia de como implementar no código.

## Premissas (não pergunte; declare e siga)

- **Usuário típico**: pessoa física que quer controle do mês; mistura de iniciante (precisa de onboarding e explicações) com intermediário (quer filtros rápidos).
- **3 decisões mais comuns no dashboard**:
  1) “Estou positivo ou negativo no mês?”
  2) “Onde gastei mais (categoria)?”
  3) “O que vai vencer/recorrer em breve e pode estourar orçamento/caixa?”
- **Densidade ideal**: “escaneável em 5 segundos” + detalhes sob demanda (progressive disclosure).

## Entregáveis (responda exatamente nesta estrutura)

### 1) Princípios do Design System (8–10)

Defina princípios curtos e memoráveis. Ex.: “Dados primeiro”, “Confiança sem fricção”, “Consistência sem rigidez”, “Semântica > cor”.

### 2) Fundamentos e tokens (com valores sugeridos)

Forneça tokens com nomes exatos e valores exemplares (HEX/RGB, rem, ms). Inclua **light e dark**.

#### 2.1 Cores (neutros + semânticas + marca)

Crie um sistema que funcione em:
- **background/surface** (camadas)
- **text** (primário/secundário/terciário)
- **border/divider**
- **estado semântico**: `positive` (receitas), `negative` (despesas), `warning`, `info`, `neutral`
- **acento de marca** (contido)

Requisitos:
- Contraste AA para textos
- Evitar “verde/vermelho puro” como única distinção (use ícone, label e/ou forma)
- Dark mode com superfícies e bordas legíveis (sem preto chapado)

> Saída esperada: uma tabela de tokens (ex.: `--color-bg`, `--color-surface-1`, `--color-text-1`, `--color-positive`, etc.) com valores para light e dark.

#### 2.2 Tipografia

Defina:
- escala tipográfica (12/14/16/18/20/24/32, ou equivalente)
- pesos
- regras de uso para títulos, labels, valores e microcopy
- diretrizes para **números financeiros**:
  - tabular numerals
  - alinhamento e hierarquia (valor vs data vs descrição)
  - sinais (+/−), cores semânticas e fallback acessível

#### 2.3 Espaçamento, grid e layout

Defina:
- escala de spacing (2/4/8/12/16/24/32/48)
- container widths e breakpoints
- densidade por viewport (mobile/desktop)

#### 2.4 Raios, bordas, sombras e elevação

Defina:
- `radius` (ex.: sm/md/lg/xl)
- bordas e divisores
- 2–3 níveis de elevação (sem exagero) e equivalentes no dark

#### 2.5 Motion

Defina:
- durações (ex.: 120/180/240ms)
- easing
- quando usar (feedback, skeleton, toast) e quando evitar

### 3) Componentes (especificação completa)

Para cada componente, inclua:
- **Anatomia** (partes)
- **Variantes**
- **Estados** (default/hover/active/focus/disabled/loading)
- **Regras de uso** (quando usar / quando não usar)
- **Acessibilidade** (teclado, foco, aria, contraste)

Componentes mínimos:
- **Button** (primary/secondary/ghost/destructive + sizes)
- **Input**, **Select**, **Textarea**, **Date picker / Date range**
- **Card** (summary, card clicável, card de formulário)
- **List item / Table row** (transações)
- **Badge/Tag** (categoria, status)
- **Alert** + **Toast**
- **Empty state** (primeiro uso e “sem resultados”)
- **Skeleton** (cards e lista)
- **Modal/Drawer** (criar/editar transação)
- **Progress** (orçamento e metas)
- **Charts** (paleta, grid, tooltip, legenda, estados sem dados)

### 4) Padrões de UX “finance-grade” (alto impacto)

Descreva padrões com **decisões claras** e exemplos:

#### 4.1 Dashboard `/personal-finance`

- hierarquia dos cards (Receitas, Despesas, Resultado, Saldos)
- comparação com período anterior (tendência)
- filtros por período (mês atual como default)

#### 4.2 Transações

- padrão de item de transação (descrição, categoria, conta, data, valor)
- sinalização de `income`/`expense`/`transfer` sem depender só de cor
- agrupamento por data
- filtros e busca (período, conta, categoria, valor)
- estados: vazio, erro de API, carregando

#### 4.3 Orçamentos

- progress bar com limiares (ex.: 60/85/100%)
- recomendações de microcopy (“Você está perto do limite…”, etc.)

#### 4.4 Recorrências

- lista de “próximos vencimentos”
- alertas de risco (ex.: recorrência alta vs saldo)

#### 4.5 Onboarding

- checklist de 3 passos: criar conta → criar categoria → 1ª transação
- tom de voz: humano, curto, confiável (pt-BR)

### 5) Direção visual (2 variações bem distintas)

Crie 2 direções completas, cada uma com:
- paleta (neutros + acento + semânticas)
- tipografia (headline/body, e como tratar números)
- estilo de cards/bordas/sombras
- estilo de gráficos

Variação A (default): **Fintech Premium Minimal**  
Variação B: **Fintech Editorial Data-Dense** (mais densa, ainda legível)

### 6) Microcopy (pt-BR) — biblioteca curta

Crie exemplos prontos para:
- empty states (dashboard sem dados, sem transações, sem orçamentos)
- erros (falha ao carregar resumo, falha ao salvar transação)
- confirmações (transação criada/atualizada/removida)
- labels e dicas (campos de valor, data, categoria)

### 7) Checklist de implementação (Tailwind + tokens)

Explique como aplicar isso no projeto, assumindo componentes próprios:
- onde declarar tokens (CSS variables) e como nomear
- como mapear tokens para utilitários Tailwind v4
- como padronizar `Card`, `Button`, `Input` para evitar variação ad hoc
- como garantir dark mode consistente (superfícies, bordas, charts)
- como testar acessibilidade (foco visível, contraste, navegação por teclado)

## Restrições e critérios de sucesso

- **WCAG AA** para textos e controles críticos
- **Escaneabilidade**: o usuário entende a saúde financeira do mês em 3–5s
- **Consistência**: tudo é explicado por tokens e padrões (não “classes soltas”)
- **Performance**: sem sombras pesadas/blurs excessivos
- **Sem dependência de biblioteca externa de UI**

## Como validar sua resposta

No final, inclua:
- um **checklist de QA visual** (10 itens)
- uma **lista de 5 telas prioritárias** para aplicar primeiro (ordem sugerida)
- uma mini seção “**riscos e mitigação**” (ex.: verde/vermelho, contraste no dark, densidade excessiva)

