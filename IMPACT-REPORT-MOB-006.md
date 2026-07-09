# Relatório de Impacto - MOB-006 Responsive Components

## Metodologia

Análise manual de todos os módulos da aplicação, componentes compartilhados,
serviços de responsividade e testes E2E.

## 1. Infraestrutura de Responsividade Existente

### Implementado
- `ResponsiveService` (Signals + CDK BreakpointObserver) - **ok**
- `LayoutMode` enum (DESKTOP | TABLET | MOBILE) - **ok**
- `Breakpoints` constants + `BreakpointQueries` - **ok**
- SCSS mixins (`respond-above`, `respond-below`, `container`, `responsive-padding`) - **ok**
- Structural directives (`showDesktop`, `showTablet`, `showMobile`) - **ok**
- `NavigationService` (sidebar/drawer/bottom-nav state) - **ok**

### Critério de classificação
- **IMPLEMENTADO**: possui 2+ breakpoints com reestruturação visual significativa
- **PARCIAL**: usa componentes compartilhados OU tem CSS adaptativo, mas sem template dedicado
- **PENDENTE**: sem responsividade ou sem fallback mobile (cards)

## 2. Status por Módulo

### Dashboard
Arquivo: `pages/dashboard/dashboard.component.ts`
Componentes: `DsPageHeader`, `DsPageCard`
Responsividade: **IMPLEMENTADO** (3 layouts: mobile/tablet/desktop via `ResponsiveService`)
Observação: Dashboard responsivo completo com breakpoints dedicados.

### Login
Arquivo: `features/auth/login/login.component.ts`
Componentes: `DsButton`
Responsividade: **PARCIAL** (3 breakpoints CSS, layout duas colunas → uma coluna)
Observação: Sidebar de branding some em mobile. Sem cards.

### Alunos (list)
Arquivo: `pages/students/students.component.ts`
Componentes: `ResponsiveCrudComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (`ResponsiveCrudComponent` faz switch tabela/cards)
Observação: Filtro de status empilhável em mobile via `respond-below(tablet)`.
Migração alvo: trocar para `ResponsiveCrudLayout` + `ResponsiveFilterBar`.

### Instrutores (list)
Arquivo: `pages/instructors/instructors-list.component.ts`
Componentes: `ResponsiveCrudComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (mesmo padrão Alunos)
Observação: Filtro de status + ação "Transferir".
Migração alvo: trocar para novos componentes.

### Turmas (list)
Arquivo: `pages/class-groups/class-groups.component.ts`
Componentes: `ResponsiveCrudComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (mesmo padrão)
Observação: Filtro de instrutor + status.
Migração alvo: trocar para novos componentes.

### Matrículas (list)
Arquivo: `pages/enrollments/enrollments.component.ts`
Componentes: `ResponsiveCrudComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (mesmo padrão)
Observação: Filtros de turma, status e data.

### Presença
Arquivo: `pages/attendance/attendance.component.ts`
Componentes: `DsPageHeader`, `DsPageCard`, `DsEmptyState`, `DsButton`
Responsividade: **IMPLEMENTADO** (2 breakpoints, custom)
Observação: Página especializada, fora do padrão CRUD list.

### Agenda
Arquivo: `pages/daily-agenda/daily-agenda.component.ts`
Componentes: `DsPageHeader`, `DsEmptyState`, `DsButton`, `DsStatusChip`
Responsividade: **IMPLEMENTADO** (2 breakpoints, custom)
Observação: Página especializada com cartões expansíveis.

### Reposições
Arquivo: `pages/makeup-approval/makeup-approval.component.ts`
Componentes: `DsPageHeader`, `DsEmptyState`, `DsButton`, `DsStatusChip`
Responsividade: **IMPLEMENTADO** (2 breakpoints, custom)
Observação: Página especializada de aprovação.

### Objetivos (list)
Arquivo: `pages/objectives/objectives.component.ts`
Componentes: `ResponsiveCrudComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (mesmo padrão)
Observação: Filtros de aluno e status.

### Avaliações (list)
Arquivo: `pages/evaluations/evaluations.component.ts`
Componentes: `ResponsiveCrudComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (mesmo padrão)
Observação: Filtros de aluno, turma e data.

### Evoluções (list)
Arquivo: `pages/evolutions/evolutions.component.ts`
Componentes: `CrudToolbarComponent`, `CrudActionsComponent`, `DsPageHeader`
Responsividade: **PARCIAL** (usa `CrudToolbar`, NÃO usa `ResponsiveCrudComponent`)
Observação: Timeline customizada, filtros empilháveis.

### Sessões (list)
Arquivo: `pages/sessions/sessions.component.ts`
Componentes: `DsPageHeader`, `DsEmptyState`, `DsStatusChip`
Responsividade: **PARCIAL** (2 breakpoints CSS, sem fallback cards)
Observação: Usa tabela nativa `<table>`, sem `ResponsiveCrudComponent`.

## 3. Componentes Compartilhados Existentes

| Componente | Uso | Responsivo |
|---|---|---|
| `ResponsiveCrudComponent` | Alunos, Instrutores, Turmas, Matrículas, Objetivos, Avaliações | Sim |
| `CrudToolbarComponent` | Todas as CRUD + Evoluções | Sim |
| `CrudCardComponent` | Via `ResponsiveCrudComponent` | Sim |
| `CrudActionsComponent` | Todas as CRUD | Sim |
| `CrudEmptyStateComponent` | Via `ResponsiveCrudComponent` | Não |
| `DsPageHeaderComponent` | Todas as páginas | Não |
| `DsPageCardComponent` | Dashboard, Presença, formulários | Não |
| `DsPageFormComponent` | Formulários (Aluno, Instrutor, etc.) | Sim (isMobile) |
| `DsEmptyStateComponent` | Agenda, Reposições, Presença, Sessões | Não |
| `DsButtonComponent` | Várias páginas | Não |
| `LoadingComponent` | Agenda, Reposições | Não |
| `EmptyStateComponent` | (não usado atualmente por páginas principais) | Não |
| `ResponsiveFormGridComponent` | Formulários | Sim (CSS) |
| `ResponsiveFormSectionComponent` | Formulários | Sim (CSS) |
| `ResponsiveFormActionsComponent` | Formulários | Sim (CSS) |

## 4. Testes Playwright Existentes

| Arquivo | Cobertura |
|---|---|
| `tests/example.spec.ts` | N/A (não testa a app) |
| `tests/dashboard-responsive.spec.ts` | Dashboard (3 breakpoints) |
| `tests/crud-regression.spec.ts` | CRUD pages (Alunos, Instrutores, Turmas, Matrículas, Avaliações, Objetivos) em Desktop e Mobile |
| `tests/mobile-navigation.spec.ts` | Navegação mobile (sidebar, bottom-nav, drawer, more-sheet) em 3 breakpoints |

## 5. Estratégia de Implementação

1. **Criar componentes reutilizáveis** (ADITIVO - sem alterar nada existente)
2. **Migrar uma tela por vez** testando cada uma
3. **Ordem**: Alunos → Instrutores → Turmas

### Componentes a criar

| Componente | Descrição | Selector |
|---|---|---|
| `ResponsivePageContainer` | Wrapper de página com padding/container responsivo | `responsive-page-container` |
| `ResponsiveCrudLayout` | Orquestrador CRUD alternativo (wrapper responsivo) | `responsive-crud-layout` |
| `ResponsiveToolbar` | Barra de busca + filtros + ações | `responsive-toolbar` |
| `ResponsiveFilters` | Barra de filtros dedicada (inline/stacked) | `responsive-filters` |
| `ResponsiveActions` | Ações por linha (ícones/menu) | `responsive-actions` |
| `ResponsiveCardList` | Lista de cards para mobile | `responsive-card-list` |
| `ResponsiveEmptyState` | Estado vazio unificado | `responsive-empty-state` |
| `ResponsiveLoading` | Loading spinner/skeleton | `responsive-loading` |

## 6. Checklist Final

- [ ] Lint
- [ ] Testes unitários
- [ ] Playwright (Desktop)
- [ ] Playwright (Tablet)
- [ ] Playwright (Mobile)
- [ ] Validação manual
- [ ] Console limpo
