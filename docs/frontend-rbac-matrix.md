# Frontend RBAC Matrix — corelyWeb

> Mapeamento de permissões, papéis e endpoints entre frontend e backend.
> Data: 05/07/2026

---

## Fontes consultadas

| Fonte | Arquivo |
|---|---|
| Frontend — endpoint permissions | `corelyWeb/src/app/core/rbac/permission-matrix.ts` (ENDPOINT_PERMISSIONS) |
| Frontend — route permissions | `corelyWeb/src/app/core/rbac/permission-matrix.ts` (ROUTE_PERMISSIONS) |
| Frontend — permissões por role | `corelyWeb/src/app/core/rbac/permission.service.ts` |
| Frontend — rotas da aplicação | `corelyWeb/src/app/app.routes.ts` |
| Frontend — chamadas HTTP | `corelyWeb/src/app/core/config/api.config.ts` + services |
| Backend — security config | `corely-api/src/main/java/br/com/corely/auth/config/SecurityConfiguration.java` |
| Backend — controllers | `corely-api/src/main/java/br/com/corely/*/controller/*Controller.java` |
| Backend — permissões por role | `corely-api/src/main/java/br/com/corely/auth/authorization/RolePermissions.java` |
| Backend — docs | `corely-api/docs/rbac.md` |

---

## Roles (perfis)

| Role | Descrição (backend docs) |
|---|---|
| `OWNER` | Proprietário do sistema |
| `ADMIN` | Administrador do studio |
| `RECEPTIONIST` | Recepcionista |
| `INSTRUCTOR` | Instrutor |
| `FINANCIAL` | Financeiro |
| `STUDENT` | Aluno |

---

## Permissões (vocabulário)

| Permissão | Descrição |
|---|---|
| `DASHBOARD_VIEW` | Visualizar dashboard |
| `STUDENT_READ` | Visualizar alunos |
| `STUDENT_WRITE` | Criar/editar alunos |
| `INSTRUCTOR_READ` | Visualizar instrutores |
| `INSTRUCTOR_WRITE` | Criar/editar instrutores |
| `CLASS_GROUP_READ` | Visualizar turmas |
| `CLASS_GROUP_WRITE` | Criar/editar turmas |
| `ENROLLMENT_READ` | Visualizar matrículas |
| `ENROLLMENT_WRITE` | Criar/editar matrículas |
| `ATTENDANCE_READ` | Visualizar presenças |
| `ATTENDANCE_WRITE` | Registrar presenças |
| `SESSION_READ` | Visualizar sessões |
| `SESSION_WRITE` | Criar/editar sessões |
| `OBJECTIVE_READ` | Visualizar objetivos |
| `OBJECTIVE_WRITE` | Criar/editar objetivos |
| `EVALUATION_READ` | Visualizar avaliações |
| `EVALUATION_WRITE` | Criar/editar avaliações |
| `EVOLUTION_READ` | Visualizar evoluções |
| `EVOLUTION_WRITE` | Criar/editar evoluções |
| `MAKEUP_REQUEST_READ` | Visualizar reposições |
| `MAKEUP_REQUEST_WRITE` | Criar/editar reposições |
| `FINANCIAL_READ` | Visualizar financeiro |
| `FINANCIAL_WRITE` | Criar/editar financeiro |
| `USER_READ` | Visualizar usuários |
| `USER_WRITE` | Criar/editar usuários |
| `STUDIO_READ` | Visualizar studio |
| `STUDIO_WRITE` | Criar/editar studio |
| `REPORT_READ` | Visualizar relatórios |
| `REPORT_WRITE` | Criar/editar relatórios |
| `SETTINGS_READ` | Visualizar configurações |
| `SETTINGS_WRITE` | Criar/editar configurações |

> Nota: `REPORT_*` e `SETTINGS_*` existem no frontend mas **não existem** no backend (`Permission.java`). Provavelmente planejados para futuro.

---

## Matriz Endpoint → Permissão → Roles

### Auth (público — sem autenticação)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `/auth/login` | POST | — (público) | — | permitAll() | Login | Obrigatório |
| `/auth/refresh` | POST | — (público) | — | permitAll() | Global (interceptor) | Obrigatório |
| `/auth/logout` | POST | — (público) | — | permitAll() | Login (qualquer tela) | Opcional |
| `/auth/me` | GET | — (público) | — | permitAll() | Bootstrap + interceptor | Obrigatório |

---

### Dashboard

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /dashboard/operational` | GET | `DASHBOARD_VIEW` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, OWNER, RECEPTIONIST, INSTRUCTOR | Dashboard | Obrigatório |
| `GET /dashboard` | GET | `DASHBOARD_VIEW` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, OWNER | — (backend-only) | — |

> **Inconsistência:** Backend permite apenas ADMIN e OWNER em `GET /dashboard` (rota não usada pelo frontend). Não afeta o frontend.

---

### Alunos (Students)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /students` | GET | `STUDENT_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL | ADMIN, RECEPTIONIST | Students List, Evaluation Dialog, Evolution Dialog, Evolution Form, Objectives List/Form, Evaluations List/Form, Evolutions List/Form, Enrollments List | Obrigatório |
| `GET /students/{id}` | GET | `STUDENT_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL | ADMIN, RECEPTIONIST | Student Form (edit), Student Details, Objective Details | Obrigatório (edit) |
| `POST /students` | POST | `STUDENT_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Student Form (create) | Obrigatório |
| `PUT /students/{id}` | PUT | `STUDENT_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Student Form (edit) | Obrigatório |
| `DELETE /students/{id}` | DELETE | `STUDENT_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | — (não usado no frontend) | — |

---

### Instrutores (Instructors)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /instructors` | GET | `INSTRUCTOR_READ` | OWNER, ADMIN | ADMIN | Instructors List, Class Groups List, Sessions List, Class Group Form, Session Form, Daily Agenda, Makeup Approval, Transfer Dialog | Obrigatório |
| `GET /instructors/{id}` | GET | `INSTRUCTOR_READ` | OWNER, ADMIN | ADMIN | Instructor Form (edit), Instructor Details | Obrigatório (edit) |
| `POST /instructors` | POST | `INSTRUCTOR_WRITE` | OWNER, ADMIN | ADMIN | Instructor Form (create) | Obrigatório |
| `PUT /instructors/{id}` | PUT | `INSTRUCTOR_WRITE` | OWNER, ADMIN | ADMIN | Instructor Form (edit) | Obrigatório |
| `DELETE /instructors/{id}` | DELETE | `INSTRUCTOR_WRITE` | OWNER, ADMIN | ADMIN | Instructor Details | Opcional |
| `GET /instructors/{id}/class-groups` | GET | `INSTRUCTOR_READ` | OWNER, ADMIN | ADMIN | Transfer Dialog | Obrigatório |
| `PUT /instructors/{id}/reassign` | PUT | `INSTRUCTOR_WRITE` | OWNER, ADMIN | ADMIN | Transfer Dialog | Obrigatório |

---

### Turmas (Class Groups)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /class-groups` | GET | `CLASS_GROUP_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN | Class Groups List, Attendance, Enrollments List, Class Group Form, Daily Agenda, Enrollment Form | Obrigatório |
| `GET /class-groups/{id}` | GET | `CLASS_GROUP_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN | Class Group Form (edit) | Obrigatório (edit) |
| `POST /class-groups` | POST | `CLASS_GROUP_WRITE` | OWNER, ADMIN | ADMIN | Class Group Form (create) | Obrigatório |
| `PUT /class-groups/{id}` | PUT | `CLASS_GROUP_WRITE` | OWNER, ADMIN | ADMIN | Class Group Form (edit) | Obrigatório |
| `POST /class-groups/{id}/inactivate` | POST | `CLASS_GROUP_WRITE` | OWNER, ADMIN | ADMIN | Deactivate Dialog | Obrigatório |
| `POST /class-groups/{id}/reactivate` | POST | `CLASS_GROUP_WRITE` | OWNER, ADMIN | ADMIN | Class Groups List | Opcional |
| `DELETE /class-groups/{id}` | DELETE | `CLASS_GROUP_WRITE` | OWNER, ADMIN | ADMIN | — (não usado no frontend) | — |
| `GET /class-groups/active` | GET | — (não mapeado) | — | ADMIN | — (não usado no frontend) | — |
| `POST /class-groups/{id}/generate-sessions` | POST | — (não mapeado) | — | ADMIN | — (não usado no frontend) | — |

---

### Matrículas (Enrollments)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /enrollments` | GET | `ENROLLMENT_READ` | OWNER, ADMIN, RECEPTIONIST, FINANCIAL | ADMIN, RECEPTIONIST | Enrollments List, Daily Agenda (fallback) | Obrigatório |
| `GET /enrollments/{id}` | GET | `ENROLLMENT_READ` | OWNER, ADMIN, RECEPTIONIST, FINANCIAL | ADMIN, RECEPTIONIST | Enrollment Form (edit) | Obrigatório (edit) |
| `POST /enrollments` | POST | `ENROLLMENT_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Enrollment Form (create) | Obrigatório |
| `PUT /enrollments/{id}` | PUT | `ENROLLMENT_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Enrollment Form (edit) | Obrigatório |
| `DELETE /enrollments/{id}` | DELETE | `ENROLLMENT_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Enrollments List | Opcional |
| `GET /enrollments/class-groups/{id}/students` | GET | `ENROLLMENT_READ` | OWNER, ADMIN, RECEPTIONIST, FINANCIAL | ADMIN, RECEPTIONIST | Attendance, Class Group Form, Daily Agenda | Obrigatório |

---

### Sessões (Class Sessions)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /class-sessions` | GET | `SESSION_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Sessions List, Daily Agenda, Makeup Approve Dialog | Obrigatório |
| `GET /class-sessions/{id}` | GET | `SESSION_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Session Form (edit) | Obrigatório (edit) |
| `POST /class-sessions` | POST | `SESSION_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Session Form (create) | Obrigatório |
| `PATCH /class-sessions/{id}/start` | PATCH | `SESSION_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Daily Agenda | Opcional |
| `PATCH /class-sessions/{id}/complete` | PATCH | `SESSION_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Daily Agenda | Opcional |
| `PATCH /class-sessions/{id}/cancel` | PATCH | — (não mapeado) | — | ADMIN, INSTRUCTOR, RECEPTIONIST | — (não usado no frontend) | — |
| `PUT /class-sessions/{id}` | PUT | `SESSION_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | **não existe no backend** | Session Form (edit) | Obrigatório (edit) |
| `DELETE /class-sessions/{id}` | DELETE | `SESSION_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | **não existe no backend** | — (não usado no frontend) | — |

---

### Presenças (Attendance)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /attendance/class-group/{id}/date/{date}` | GET | `ATTENDANCE_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Attendance | Opcional |
| `POST /attendance/bulk` | POST | `ATTENDANCE_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Attendance | Obrigatório |
| `GET /class-sessions/{id}/attendance` | GET | `ATTENDANCE_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Daily Agenda | Opcional |
| `POST /class-sessions/{id}/attendance` | POST | `ATTENDANCE_WRITE` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | Daily Agenda | Opcional |
| `GET /attendance` | GET | `ATTENDANCE_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | — (não usado no frontend) | — |
| `GET /attendance/class-group/{id}` | GET | `ATTENDANCE_READ` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | — (não usado no frontend) | — |
| `GET /enrollments/{id}/attendance` | GET | — (não mapeado) | — | ADMIN, INSTRUCTOR, RECEPTIONIST | — (não usado no frontend) | — |

---

### Objetivos (Objectives)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /objectives` | GET | `OBJECTIVE_READ` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Objectives List, Evolutions List/Form, Evolution Dialog | Obrigatório |
| `GET /objectives/{id}` | GET | `OBJECTIVE_READ` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Objective Form (edit), Objective Details | Obrigatório (edit) |
| `POST /objectives` | POST | `OBJECTIVE_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Objective Form (create), Objective Dialog | Obrigatório |
| `PUT /objectives/{id}` | PUT | `OBJECTIVE_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Objective Form (edit), Objective Dialog | Obrigatório |
| `DELETE /objectives/{id}` | DELETE | `OBJECTIVE_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Objectives List, Objective Details, Student Objectives Tab | Opcional |

---

### Avaliações (Evaluations)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /evaluations` | GET | `EVALUATION_READ` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evaluations List | Obrigatório |
| `GET /evaluations/{id}` | GET | `EVALUATION_READ` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evaluation Form (edit), Student Evaluations Tab | Obrigatório (edit) |
| `POST /evaluations` | POST | `EVALUATION_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evaluation Form (create), Evaluation Dialog | Obrigatório |
| `PUT /evaluations/{id}` | PUT | `EVALUATION_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evaluation Form (edit), Evaluation Dialog | Obrigatório |
| `DELETE /evaluations/{id}` | DELETE | `EVALUATION_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evaluations List, Student Evaluations Tab | Opcional |

---

### Evoluções (Evolutions)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /evolutions` | GET | `EVOLUTION_READ` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evolutions List | Obrigatório |
| `GET /evolutions/{id}` | GET | `EVOLUTION_READ` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evolution Form (edit), Student Evolutions Tab | Obrigatório (edit) |
| `POST /evolutions` | POST | `EVOLUTION_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evolution Form (create), Evolution Dialog | Obrigatório |
| `PUT /evolutions/{id}` | PUT | `EVOLUTION_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evolution Form (edit), Evolution Dialog | Obrigatório |
| `DELETE /evolutions/{id}` | DELETE | `EVOLUTION_WRITE` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | Evolutions List, Student Evolutions Tab | Opcional |

---

### Reposições (Makeup Requests)

| Endpoint | Método | Permissão | Roles (frontend) | Roles (backend) | Telas | Obrigatório? |
|---|---|---|---|---|---|---|
| `GET /makeup-requests` | GET | `MAKEUP_REQUEST_READ` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Makeup Approval | Obrigatório |
| `PATCH /makeup-requests/{id}/approve` | PATCH | `MAKEUP_REQUEST_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Makeup Approval | Opcional |
| `PATCH /makeup-requests/{id}/reject` | PATCH | `MAKEUP_REQUEST_WRITE` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | Makeup Approval | Opcional |
| `POST /attendance/{id}/makeup-request` | POST | — (não mapeado) | — | ADMIN, RECEPTIONIST | — (não usado no frontend) | — |
| `GET /attendance/{id}/makeup-request` | GET | — (não mapeado) | — | ADMIN, RECEPTIONIST | — (não usado no frontend) | — |

---

## Matriz Roles → Permissões (Frontend x Backend)

| Role | Permissões (frontend PermissionService) | Permissões (backend RolePermissions) | Divergências |
|---|---|---|---|
| **OWNER** | Todas as 30 (com REPORT_*, SETTINGS_*) | Todas as 24 (sem REPORT_*, SETTINGS_*) | Frontend tem REPORT_READ/WRITE e SETTINGS_READ/WRITE que não existem no backend |
| **ADMIN** | Todas as 30 (com REPORT_*, SETTINGS_*) | Todas as 24 (sem REPORT_*, SETTINGS_*) | Mesma divergência |
| **RECEPTIONIST** | DASHBOARD_VIEW, STUDENT_READ/WRITE, ENROLLMENT_READ/WRITE, ATTENDANCE_READ/WRITE, SESSION_READ/WRITE, CLASS_GROUP_READ, MAKEUP_REQUEST_READ/WRITE | DASHBOARD_VIEW, STUDENT_READ/WRITE, ENROLLMENT_READ/WRITE, ATTENDANCE_READ/WRITE, SESSION_READ/WRITE, CLASS_GROUP_READ, MAKEUP_REQUEST_READ/WRITE | **Alinhado** ✓ |
| **INSTRUCTOR** | DASHBOARD_VIEW, OBJECTIVE_READ/WRITE, EVALUATION_READ/WRITE, EVOLUTION_READ/WRITE, STUDENT_READ, CLASS_GROUP_READ, SESSION_READ/WRITE, ATTENDANCE_READ/WRITE | DASHBOARD_VIEW, OBJECTIVE_READ/WRITE, EVALUATION_READ/WRITE, EVOLUTION_READ/WRITE, STUDENT_READ, CLASS_GROUP_READ, SESSION_READ/WRITE, ATTENDANCE_READ/WRITE | **Alinhado** ✓ |
| **FINANCIAL** | DASHBOARD_VIEW, FINANCIAL_READ/WRITE, STUDENT_READ, ENROLLMENT_READ | DASHBOARD_VIEW, FINANCIAL_READ/WRITE, STUDENT_READ, ENROLLMENT_READ | **Alinhado** ✓ |
| **STUDENT** | OBJECTIVE_READ, EVALUATION_READ, EVOLUTION_READ | OBJECTIVE_READ, EVALUATION_READ, EVOLUTION_READ | **Alinhado** ✓ |

---

## Tabela de Inconsistências

### INCONSISTÊNCIA 1 — Rotas do frontend permitem acesso que o backend nega (Role Mismatch)

| Tela (rota) | Roles liberadas no frontend (ROUTE_PERMISSIONS) | Roles exigidas no backend (@RequireRole) | Impacto |
|---|---|---|---|
| `/students` (list) | OWNER, ADMIN, RECEPTIONIST, **INSTRUCTOR**, **FINANCIAL** | ADMIN, RECEPTIONIST | INSTRUCTOR e FINANCIAL veem a tela mas tomam 403 nas chamadas GET /students |
| `/students/:id` (details) | OWNER, ADMIN, RECEPTIONIST, **INSTRUCTOR**, **FINANCIAL** | ADMIN, RECEPTIONIST | INSTRUCTOR e FINANCIAL veem detalhes mas tomam 403 |
| `/class-groups` (list) | OWNER, ADMIN, **RECEPTIONIST**, **INSTRUCTOR** | ADMIN | RECEPTIONIST e INSTRUCTOR veem a tela mas tomam 403 |
| `/class-groups/:id` (view) | OWNER, ADMIN, **RECEPTIONIST**, **INSTRUCTOR** | ADMIN | RECEPTIONIST e INSTRUCTOR veem a tela mas tomam 403 |
| `/enrollments` (list) | OWNER, ADMIN, RECEPTIONIST, **FINANCIAL** | ADMIN, RECEPTIONIST | FINANCIAL veem a tela mas tomam 403 |
| `/enrollments/:id/edit` | OWNER, ADMIN, **RECEPTIONIST** | ADMIN, RECEPTIONIST | **Alinhado** ✓ (RECEPTIONIST allowed) |
| `/sessions/new` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | **Alinhado** ✓ |
| `/sessions/:id/edit` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | **Alinhado** ✓ |
| `/daily-agenda` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | **Alinhado** ✓ |
| `/attendance` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ADMIN, INSTRUCTOR, RECEPTIONIST | **Alinhado** ✓ |
| `/makeup-approval` | OWNER, ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST | **Alinhado** ✓ |
| `/objectives` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | **Alinhado** ✓ |
| `/evaluations` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | **Alinhado** ✓ |
| `/evolutions` | OWNER, ADMIN, INSTRUCTOR | INSTRUCTOR, ADMIN | **Alinhado** ✓ |

### INCONSISTÊNCIA 2 — Endpoints do frontend sem correspondente no backend

| Endpoint (frontend) | Método | Origem | Situação no backend |
|---|---|---|---|
| `PUT /class-sessions/{id}` | PUT | SessionService.update() | **Não existe** no ClassSessionController. Resulta em 404. |
| `DELETE /class-sessions/{id}` | DELETE | SessionService.delete() | **Não existe** no ClassSessionController. Resulta em 404. |
| `DELETE /class-groups/{id}` | DELETE | ClassGroupService.delete() | **Não existe** no ClassGroupController (usa inactivate/reactivate). Resulta em 404. |
| `DELETE /students/{id}` | DELETE | StudentService.delete() | Existe no backend mas **não é chamado** por nenhum componente. |
| `GET /attendance` | GET | AttendanceService.getAll() | Existe no backend mas **não é chamado** por nenhum componente. |
| `GET /attendance/class-group/{id}` | GET | AttendanceService.getByClassGroupId() | Existe no backend mas **não é chamado** por nenhum componente. |

### INCONSISTÊNCIA 3 — BACKEND `@RequireRole` vs DOCS `rbac.md`

| Endpoint | Docs rbac.md | Controller real (@RequireRole) |
|---|---|---|
| `GET /students` | ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST (OK) |
| `GET /students/{id}` | ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST (OK) |
| `GET /instructors` | ADMIN | ADMIN (OK) |
| `GET /class-groups` | ADMIN | ADMIN (OK) |
| `GET /enrollments` | ADMIN, RECEPTIONIST | ADMIN, RECEPTIONIST (OK) |
| `GET /dashboard` | ADMIN, OWNER | ADMIN, OWNER (OK) |
| `GET /dashboard/operational` | ADMIN, OWNER, RECEPTIONIST, INSTRUCTOR | ADMIN, OWNER, RECEPTIONIST, INSTRUCTOR (OK) |

> Docs `rbac.md` e controllers estão **alinhados**.

### INCONSISTÊNCIA 4 — Rotas do frontend sem tela implementada

| Rota | Roles (frontend) | Menu existe? | Telas implementadas? |
|---|---|---|---|
| `/financial` | OWNER, ADMIN, FINANCIAL | Sim (ícone: account_balance) | **Não** — nenhum componente implementado |
| `/reports` | OWNER, ADMIN | Sim (ícone: assessment) | **Não** — nenhum componente implementado |
| `/settings` | OWNER, ADMIN | Sim (ícone: settings) | **Não** — nenhum componente implementado |

### INCONSISTÊNCIA 5 — Permissões declaradas no frontend que não existem no backend

| Permissão (frontend) | Existe no backend Permission.java? | Usada em algum componente? |
|---|---|---|
| `REPORT_READ` | **Não** | Menu Reports |
| `REPORT_WRITE` | **Não** | PermissionService apenas |
| `SETTINGS_READ` | **Não** | Menu Settings |
| `SETTINGS_WRITE` | **Não** | PermissionService apenas |
| `USER_READ` | Sim | PermissionService apenas (não usada em componentes visíveis) |
| `USER_WRITE` | Sim | PermissionService apenas |
| `STUDIO_READ` | Sim | PermissionService apenas |
| `STUDIO_WRITE` | Sim | PermissionService apenas |

### INCONSISTÊNCIA 6 — Roles FINANCIAL e STUDENT sem endpoints no backend

| Role | Permissões | Endpoints backend com @RequireRole | Consequência |
|---|---|---|---|
| **FINANCIAL** | DASHBOARD_VIEW, FINANCIAL_READ/WRITE, STUDENT_READ, ENROLLMENT_READ | **Nenhum** controller tem @RequireRole(FINANCIAL). Backend permite ADMIN, RECEPTIONIST para students/enrollments. | FINANCIAL **não consegue acessar nenhum endpoint da API** — todas as chamadas retornam 403. |
| **STUDENT** | OBJECTIVE_READ, EVALUATION_READ, EVOLUTION_READ | **Nenhum** controller tem @RequireRole(STUDENT). | STUDENT **não consegue acessar nenhum endpoint da API** — todas as chamadas retornam 403. |

### INCONSISTÊNCIA 7 — OWNER não declarado em controllers do backend

| Controller | @RequireRole menciona OWNER? |
|---|---|
| DashboardController (`GET /dashboard`) | Sim (ADMIN, OWNER) |
| DashboardController (`GET /dashboard/operational`) | Sim (ADMIN, OWNER, RECEPTIONIST, INSTRUCTOR) |
| **Todos os demais controllers** | **Não** — apenas ADMIN (e EVENTUALMENTE RECEPTIONIST/INSTRUCTOR) |

> Como ADMIN e OWNER compartilham as mesmas 24 permissões no backend, OWNER consegue acessar todos os endpoints via hasPermission/herança de authorities. A ausência de `@RequireRole(OWNER)` nos controllers não é um problema prático, mas é uma **inconsistência documental**.

---

## Resumo

| Tipo de Inconsistência | Quantidade | Severidade |
|---|---|---|
| Rotas frontend liberam acesso que backend nega (role mismatch) | 6 | **Alta** — usuários tomam 403 inesperado |
| Endpoints frontend sem implementação no backend | 3 | **Alta** — `PUT/DELETE /class-sessions`, `DELETE /class-groups` resultam em 404 |
| Roles FINANCIAL/STUDENT sem endpoints no backend | 2 | **Alta** — usuários desses perfis não conseguem usar o sistema |
| Permissões frontend que não existem no backend | 4 | Média — REPORT_*, SETTINGS_* (futuro) |
| Rotas no menu sem implementação | 3 | Média — financial, reports, settings |
| Falta @RequireRole(OWNER) em controllers | ~15 | Baixa — ADMIN já cobre (mesmas permissões) |
| Docs rbac.md desatualizados vs controllers | 0 | Nenhuma — alinhado |
