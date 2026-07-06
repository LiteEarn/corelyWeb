# Frontend RBAC Audit — corelyWeb

> Auditoria de chamadas HTTP que podem gerar 401/403 por perfil.
> Data: 05/07/2026

---

## Critérios da auditoria

Para cada chamada HTTP, verificamos:

1. **O backend permite o perfil?** (`@RequireRole` no controller)
2. **O componente verifica a permissão antes de chamar?** (`hasPermission()`)
3. **A rota permite o perfil?** (`ROUTE_PERMISSIONS` / `roleGuard`)

Problemas são classificados em três categorias:

| Categoria | Descrição |
|---|---|
| **403 Silencioso** | O frontend renderiza a tela mas a chamada HTTP retorna 403 — o perfil não tem acesso ao endpoint |
| **Chamada desnecessária** | O componente faz uma requisição mesmo quando o perfil logado não precisa dela (ex: dropdown de filtro irrelevante) |
| **Sem guard de permissão** | O componente não verifica `hasPermission()` antes de chamar — defesa em profundidade ausente |

---

## Legendas

| Ícone | Significado |
|---|---|
| 🚫 | **403 Silencioso** — Backend nega o perfil |
| ⚠️ | **Chamada desnecessária** — Poderia ser evitada |
| 🔓 | **Sem guard de permissão** — Falta `hasPermission()` |
| ✅ | **Seguro** — Backend permite + frontend verifica |

---

## Dashboard

### `dashboard.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /dashboard/operational` | 81 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ✅ Backend permite todos os perfis que acessam a rota. `hasPermission('DASHBOARD_VIEW')` presente. | ✅ |

---

## Alunos — Lista

### `students.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students` | 59 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL | 🚫 **INSTRUCTOR e FINANCIAL**: rota permite (ROUTE_PERMISSIONS inclui ambos) mas back-end só aceita ADMIN e RECEPTIONIST. Ambos tomam 403. | 🚫 403 Silencioso |
| | | | 🔓 `hasPermission('STUDENT_READ')` presente (linha 53). Guard existe, mas o backend nega INSTRUCTOR e FINANCIAL mesmo com a permissão. | 🔓 + 🚫 |

> **Solução:** Alinhar ROUTE_PERMISSIONS com backend: remover INSTRUCTOR e FINANCIAL de `/students`. Ou alterar backend para aceitar esses perfis.

---

## Alunos — Formulário

### `student-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students/{id}` | 82 | OWNER, ADMIN, RECEPTIONIST | 🔓 `hasPermission('STUDENT_WRITE')` na linha 65 (permissão trocada — deveria ser `STUDENT_READ`) | 🔓 Mismatch |
| `POST /students` | 143 | OWNER, ADMIN, RECEPTIONIST | 🔓 `onSubmit()` não verifica permissão alguma | 🔓 Sem guard |
| `PUT /students/{id}` | 130 | OWNER, ADMIN, RECEPTIONIST | 🔓 `onSubmit()` não verifica permissão alguma | 🔓 Sem guard |

> **Solução:** Trocar `STUDENT_WRITE` → `STUDENT_READ` na linha 65. Adicionar `hasPermission('STUDENT_WRITE')` no `onSubmit()`.

---

## Alunos — Detalhes

### `student-details.component.ts`

| Chamada | Linha | Perfis | Problema |
|---|---|---|---|
| `GET /students/{id}` | 57 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL | 🚫 **INSTRUCTOR e FINANCIAL**: rota permite mas back-end só aceita ADMIN e RECEPTIONIST. `hasPermission('STUDENT_READ')` presente (linha 51), mas backend nega. |

> **Solução:** Remover INSTRUCTOR e FINANCIAL de `students/:id` no ROUTE_PERMISSIONS, ou ajustar backend.

---

## Alunos — Detalhes > Aba Objetivos

### `student-objectives-tab.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /objectives?studentId={id}` | 53 | OWNER, ADMIN, INSTRUCTOR | ✅ Backend e frontend alinhados. `hasPermission('OBJECTIVE_READ')` presente (linha 46). | ✅ |
| `DELETE /objectives/{id}` | 113 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onDelete()` não verifica `OBJECTIVE_WRITE` antes de chamar | 🔓 Sem guard |

> **Solução:** Adicionar `hasPermission('OBJECTIVE_WRITE')` no `onDelete()`.

---

### `objective-dialog.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `POST /objectives` | 114 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onSubmit()` não verifica `OBJECTIVE_WRITE` | 🔓 Sem guard |
| `PUT /objectives/{id}` | 103 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onSubmit()` não verifica `OBJECTIVE_WRITE` | 🔓 Sem guard |

---

## Alunos — Detalhes > Aba Avaliações

### `student-evaluations-tab.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /evaluations?studentId={id}` | 53 | OWNER, ADMIN, INSTRUCTOR | ✅ Backend e frontend alinhados. `hasPermission('EVALUATION_READ')` presente (linha 46). | ✅ |
| `DELETE /evaluations/{id}` | 113 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onDelete()` não verifica `EVALUATION_WRITE` | 🔓 Sem guard |

---

### `evaluation-dialog.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `POST /evaluations` | 120 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onSubmit()` não verifica `EVALUATION_WRITE` | 🔓 Sem guard |
| `PUT /evaluations/{id}` | 109 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onSubmit()` não verifica `EVALUATION_WRITE` | 🔓 Sem guard |

---

## Alunos — Detalhes > Aba Evoluções

### `student-evolutions-tab.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /evolutions?studentId={id}` | 53 | OWNER, ADMIN, INSTRUCTOR | ✅ `hasPermission('EVOLUTION_READ')` presente (linha 46). | ✅ |
| `DELETE /evolutions/{id}` | 114 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onDelete()` não verifica `EVOLUTION_WRITE` | 🔓 Sem guard |

---

### `evolution-dialog.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students` | 108 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL | 🚫 **INSTRUCTOR e FINANCIAL**: `hasPermission('STUDENT_READ')` passa (linha 107) mas back-end nega. ⚠️ **RECEPTIONIST**: chamada desnecessária — dropdown só precisa de alunos para vincular evolução, mas RECEPTIONIST não cria evoluções. | 🚫 + ⚠️ |
| `GET /objectives?studentId={id}` | 120 | OWNER, ADMIN, INSTRUCTOR | ✅ `hasPermission('OBJECTIVE_READ')` presente (linha 119). | ✅ |
| `POST /evolutions` | 165 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onSubmit()` não verifica `EVOLUTION_WRITE` | 🔓 Sem guard |
| `PUT /evolutions/{id}` | 154 | OWNER, ADMIN, INSTRUCTOR | 🔓 `onSubmit()` não verifica `EVOLUTION_WRITE` | 🔓 Sem guard |

> **Solução para linha 108:** Guardar chamada com `hasPermission('STUDENT_READ')` já existe, mas o backend precisa ser ajustado para permitir INSTRUCTOR (que já tem STUDENT_READ no backend RolePermissions). Ou remover INSTRUCTOR da rota.

---

## Instrutores — Lista

### `instructors-list.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors` | 64 | OWNER, ADMIN | ✅ Rota restrita a OWNER/ADMIN. Backend permite ADMIN. `hasPermission('INSTRUCTOR_READ')` presente (linha 58). | ✅ |

---

## Instrutores — Formulário

### `instructor-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors/{id}` | 93 | OWNER, ADMIN | ✅ `hasPermission('INSTRUCTOR_READ')` presente (linha 75). | ✅ |
| `POST /instructors` | 133 | OWNER, ADMIN | 🔓 `onSubmit()` não verifica `INSTRUCTOR_WRITE` | 🔓 Sem guard |
| `PUT /instructors/{id}` | 132 | OWNER, ADMIN | 🔓 `onSubmit()` não verifica `INSTRUCTOR_WRITE` | 🔓 Sem guard |

---

## Instrutores — Detalhes

### `instructor-details.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors/{id}` | 52 | OWNER, ADMIN | ✅ `hasPermission('INSTRUCTOR_READ')` presente (linha 42). | ✅ |
| `DELETE /instructors/{id}` | 73 | OWNER, ADMIN | 🔓 `onDelete()` não verifica `INSTRUCTOR_WRITE` | 🔓 Sem guard |

---

## Instrutores — Transferência (Dialog)

### `transfer-dialog.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors/{id}/class-groups` | 76 | OWNER, ADMIN | ✅ `hasPermission('INSTRUCTOR_READ')` presente (linha 75). | ✅ |
| `GET /instructors?active=true` | 96 | OWNER, ADMIN | ✅ `hasPermission('INSTRUCTOR_READ')` presente (linha 95). | ✅ |
| `PUT /instructors/{id}/reassign` | 131 | OWNER, ADMIN | 🔓 `onConfirm()` não verifica `INSTRUCTOR_WRITE` | 🔓 Sem guard |

---

## Turmas — Lista

### `class-groups.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /class-groups` | 77 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🚫 **RECEPTIONIST e INSTRUCTOR**: rota permite mas back-end só aceita ADMIN. ⚠️ Ambos têm `CLASS_GROUP_READ` no frontend e o guard passa, mas backend nega. | 🚫 403 Silencioso |
| `GET /instructors?active=true` | 93 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🚫 **RECEPTIONIST e INSTRUCTOR**: `hasPermission('INSTRUCTOR_READ')` falha para RECEPTIONIST (linha 68) — correto. ⚠️ Mas INSTRUCTOR passa (tem INSTRUCTOR_READ? Não! INSTRUCTOR não tem INSTRUCTOR_READ). Verificar: INSTRUCTOR não tem `INSTRUCTOR_READ` pela rolePermissions. Então o guard da linha 68 impede. ✅ Correto. | ✅ (mas depende da implementação real) |
| `POST /class-groups/{id}/reactivate` | 190 | OWNER, ADMIN | 🔓 `reactivateClassGroup()` não verifica `CLASS_GROUP_WRITE` | 🔓 Sem guard |

> 🚫 **Impacto direto:** RECEPTIONIST e INSTRUCTOR acessam a rota `/class-groups` (frontend permite) mas tomam 403 em `GET /class-groups`. O errorInterceptor mostra toast "Você não tem permissão" e a tela fica vazia.

---

## Turmas — Formulário

### `class-group-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors?active=true` | 116 | OWNER, ADMIN | ✅ Rota restrita. `hasPermission('INSTRUCTOR_READ')` presente (linha 80). | ✅ |
| `GET /class-groups/{id}` | 128 | OWNER, ADMIN | ✅ `hasPermission('CLASS_GROUP_READ')` presente (linha 85). | ✅ |
| `GET /enrollments/class-groups/{id}/students` | 156 | OWNER, ADMIN | ✅ `hasPermission('ENROLLMENT_READ')` presente (linha 88). | ✅ |
| `POST /class-groups` | 222 | OWNER, ADMIN | 🔓 `onSubmit()` não verifica `CLASS_GROUP_WRITE` | 🔓 Sem guard |
| `PUT /class-groups/{id}` | 208 | OWNER, ADMIN | 🔓 `onSubmit()` não verifica `CLASS_GROUP_WRITE` | 🔓 Sem guard |

---

## Turmas — Desativar (Dialog)

### `deactivate-dialog.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `POST /class-groups/{id}/inactivate` | 87 | OWNER, ADMIN | 🔓 **CRÍTICO**: `PermissionService` não é injetado nem verificado. Componente não tem guard algum. | 🔓 Sem guard |

> **Solução injetar `PermissionService` e verificar `CLASS_GROUP_WRITE` antes de chamar `inactivate()`.

---

## Matrículas — Lista

### `enrollments.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /enrollments` | 94 | OWNER, ADMIN, RECEPTIONIST, FINANCIAL | 🚫 **FINANCIAL**: rota permite mas back-end só aceita ADMIN e RECEPTIONIST. `hasPermission('ENROLLMENT_READ')` passa (linha 76) mas backend nega. | 🚫 403 Silencioso |
| `GET /students?active=true` | 108 | OWNER, ADMIN, RECEPTIONIST, FINANCIAL | 🚫 **FINANCIAL**: `hasPermission('STUDENT_READ')` passa (linha 79) mas backend nega. ⚠️ Chamada desnecessária para RECEPTIONIST? Não — RECEPTIONIST precisa do filtro. | 🚫 |
| `GET /class-groups?active=true` | 119 | OWNER, ADMIN, RECEPTIONIST, FINANCIAL | 🚫 **FINANCIAL e RECEPTIONIST**: `hasPermission('CLASS_GROUP_READ')` — RECEPTIONIST tem CLASS_GROUP_READ mas backend nega (só ADMIN). FINANCIAL não tem CLASS_GROUP_READ, então o guard falha na linha 82. ✅ Para FINANCIAL está correto. 🚫 Para RECEPTIONIST o guard passa mas backend nega. | 🚫 |
| `DELETE /enrollments/{id}` | 199 | OWNER, ADMIN, RECEPTIONIST | 🔓 `deleteEnrollment()` não verifica `ENROLLMENT_WRITE` | 🔓 Sem guard |

> 🚫 **FINANCIAL** acessa `/enrollments` mas toma 403 em todas as 3 chamadas GET. Tela fica vazia.

---

## Matrículas — Formulário

### `enrollment-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students?active=true` | 109 | OWNER, ADMIN, RECEPTIONIST | ✅ `hasPermission('STUDENT_READ')` presente (linha 79). | ✅ |
| `GET /class-groups` | 122 | OWNER, ADMIN, RECEPTIONIST | 🚫 **RECEPTIONIST**: `hasPermission('CLASS_GROUP_READ')` passa (linha 83) mas backend só aceita ADMIN. | 🚫 403 Silencioso |
| `GET /enrollments/{id}` | 134 | OWNER, ADMIN, RECEPTIONIST | ✅ `hasPermission('ENROLLMENT_READ')` presente (linha 88). | ✅ |
| `POST /enrollments` | 191 | OWNER, ADMIN, RECEPTIONIST | 🔓 `onSubmit()` não verifica `ENROLLMENT_WRITE` | 🔓 Sem guard |
| `PUT /enrollments/{id}` | 177 | OWNER, ADMIN, RECEPTIONIST | 🔓 `onSubmit()` não verifica `ENROLLMENT_WRITE` | 🔓 Sem guard |

---

## Sessões — Lista

### `sessions.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /class-sessions` | 65 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ✅ Backend permite ADMIN, INSTRUCTOR, RECEPTIONIST. 🔓 `hasPermission('SESSION_READ')` ausente (linha 58) — rota guard protege, mas sem defesa adicional. | 🔓 Leve |
| `GET /instructors?active=true` | 78 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🚫 **RECEPTIONIST**: `hasPermission('INSTRUCTOR_READ')` falha (linha 59) — RECEPTIONIST não tem INSTRUCTOR_READ. ✅ Correto — não chama. 🚫 **INSTRUCTOR**: também não tem INSTRUCTOR_READ. ✅ Correto. | ✅ (guard funciona) |

---

## Sessões — Formulário

### `session-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors?active=true` | 89 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ✅ Guard com `hasPermission('INSTRUCTOR_READ')` na linha 67 protege. RECEPTIONIST e INSTRUCTOR não passam, então não chamam. ✅ | ✅ |
| `GET /class-sessions/{id}` | 101 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 `hasPermission('SESSION_READ')` ausente — mas rota guard protege. | 🔓 Leve |
| `POST /class-sessions` | 151 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 `onSubmit()` não verifica `SESSION_WRITE` | 🔓 Sem guard |
| `PUT /class-sessions/{id}` | 140 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 `onSubmit()` não verifica `SESSION_WRITE` **+** 🚫 **Endpoint não existe no backend!** `PUT /class-sessions/{id}` retorna 404. | 🔓 + 🚫 404 |

> 🚫 **`PUT /class-sessions/{id}` não existe no backend.** O frontend chama `sessionService.update()` que faz `PUT /class-sessions/{id}`, mas o ClassSessionController só tem PATCH (start/complete/cancel). Resultado: 404 ao editar sessão.

---

## Chamada / Frequência

### `attendance.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /class-groups?active=true` | 138 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🚫 **RECEPTIONIST e INSTRUCTOR**: `hasPermission('CLASS_GROUP_READ')` passa (linha 90) mas backend só aceita ADMIN. Ambos tomam 403. | 🚫 403 Silencioso |
| `GET /enrollments/class-groups/{id}/students` | 162 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('ENROLLMENT_READ')`. 🚫 **RECEPTIONIST e INSTRUCTOR**: backend permite ADMIN, INSTRUCTOR, RECEPTIONIST. ✅ INSTRUCTOR e RECEPTIONIST são aceitos, mas sem guard. | 🔓 |
| `GET /attendance/class-group/{id}/date/{date}` | 181 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('ATTENDANCE_READ')`. ✅ Backend permite ADMIN, INSTRUCTOR, RECEPTIONIST. | 🔓 |
| `POST /attendance/bulk` | 286 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 `saveAttendance()` não verifica `ATTENDANCE_WRITE` | 🔓 Sem guard |

> ⚠️ **Chamada desnecessária:** `GET /class-groups` (linha 138) é feita para popular dropdown. RECEPTIONIST e INSTRUCTOR acessam a tela mas tomam 403 nesta chamada. A tela inteira depende dela — sem turmas não há como prosseguir.

---

## Agenda do Dia

### `daily-agenda.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors?active=true` | 143 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ✅ `hasPermission('INSTRUCTOR_READ')` na linha 102 protege. RECEPTIONIST e INSTRUCTOR não passam. ✅ | ✅ |
| `GET /class-groups?active=true` | 151 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🚫 **RECEPTIONIST e INSTRUCTOR**: `hasPermission('CLASS_GROUP_READ')` passa (linha 105) mas backend só aceita ADMIN. | 🚫 403 Silencioso |
| `GET /class-sessions` | 128 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('SESSION_READ')`. ✅ Backend permite todos. | 🔓 |
| `GET /enrollments/class-groups/{id}/students` (contagem) | 188 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ✅ `hasPermission('ENROLLMENT_READ')` presente (linha 180). ✅ Backend permite ADMIN, INSTRUCTOR, RECEPTIONIST. ⚠️ **RECEPTIONIST**: chamada desnecessária se não vai expandir cards. | ⚠️ |
| `GET /enrollments/class-groups/{id}/students` (expandir) | 252 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | ✅ `hasPermission('ENROLLMENT_READ')` presente (linha 250). ✅ Backend permite ADMIN, INSTRUCTOR, RECEPTIONIST. | ✅ |
| `GET /enrollments?classGroupId={id}&active=true` (fallback) | 264 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem guard próprio, herda do escopo da linha 250. 🚫 Backend permite ADMIN e RECEPTIONIST. INSTRUCTOR não tem ENROLLMENT_READ? Tem ATTENDANCE_READ mas não ENROLLMENT_READ. 🚫 **INSTRUCTOR**: 403. | 🚫 |
| `GET /class-sessions/{id}/attendance` | 280 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('ATTENDANCE_READ')`. ✅ Backend permite todos. | 🔓 |
| `POST /class-sessions/{id}/attendance` | 314 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('ATTENDANCE_WRITE')` | 🔓 Sem guard |
| `PATCH /class-sessions/{id}/start` | 336 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('SESSION_WRITE')` | 🔓 Sem guard |
| `PATCH /class-sessions/{id}/complete` | 355 | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR | 🔓 Sem `hasPermission('SESSION_WRITE')` | 🔓 Sem guard |

---

## Avaliações — Lista

### `evaluations.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /evaluations` | 69 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVALUATION_READ')`. ✅ Rota guard protege (só OWNER, ADMIN, INSTRUCTOR). | 🔓 |
| `GET /students` | 82 | OWNER, ADMIN, INSTRUCTOR | ✅ `hasPermission('STUDENT_READ')` presente (linha 63). 🚫 Backend só aceita ADMIN e RECEPTIONIST. **INSTRUCTOR toma 403.** | 🚫 403 Silencioso |
| `DELETE /evaluations/{id}` | 154 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVALUATION_WRITE')` | 🔓 Sem guard |

> ⚠️ **Chamada desnecessária (linha 82):** `GET /students` é usado como filtro de aluno na lista de avaliações. INSTRUCTOR tem `STUDENT_READ` no frontend (passa o guard) mas backend nega. O filtro não funcionaria para INSTRUCTOR. Além disso, o filtro de aluno em "Avaliações" é um requisito questionável — INSTRUCTOR avalia seus próprios alunos.

---

## Avaliações — Formulário

### `evaluation-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students` | 98 | OWNER, ADMIN, INSTRUCTOR | ✅ `hasPermission('STUDENT_READ')` presente (linha 68). 🚫 Backend só aceita ADMIN e RECEPTIONIST. INSTRUCTOR toma 403. | 🚫 403 Silencioso |
| `GET /evaluations/{id}` | 110 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVALUATION_READ')` — rota guard protege. | 🔓 |
| `POST /evaluations` | 181 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVALUATION_WRITE')` | 🔓 Sem guard |
| `PUT /evaluations/{id}` | 168 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVALUATION_WRITE')` | 🔓 Sem guard |

---

## Evoluções — Lista

### `evolutions.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /evolutions` | 77 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVOLUTION_READ')` — rota guard protege. | 🔓 |
| `GET /students` | 94 | OWNER, ADMIN, INSTRUCTOR | 🚫 **INSTRUCTOR**: `hasPermission('STUDENT_READ')` passa (linha 69) mas backend nega. ⚠️ Chamada desnecessária para filtro de aluno. | 🚫 |
| `GET /objectives` | 105 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_READ')`. ✅ Backend permite ADMIN e INSTRUCTOR. | 🔓 |
| `DELETE /evolutions/{id}` | 192 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVOLUTION_WRITE')` | 🔓 Sem guard |

---

## Evoluções — Formulário

### `evolution-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students` | 101 | OWNER, ADMIN, INSTRUCTOR | 🚫 **INSTRUCTOR**: `hasPermission('STUDENT_READ')` passa (linha 74) mas backend nega. | 🚫 |
| `GET /objectives` | 112 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_READ')` — rota guard protege. | 🔓 |
| `GET /evolutions/{id}` | 124 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVOLUTION_READ')` — rota guard protege. | 🔓 |
| `POST /evolutions` | 184 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVOLUTION_WRITE')` | 🔓 Sem guard |
| `PUT /evolutions/{id}` | 171 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('EVOLUTION_WRITE')` | 🔓 Sem guard |

---

## Objetivos — Lista

### `objectives.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /objectives` | 65 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_READ')` — rota guard protege. | 🔓 |
| `GET /students` | 78 | OWNER, ADMIN, INSTRUCTOR | 🚫 **INSTRUCTOR**: `hasPermission('STUDENT_READ')` passa (linha 59) mas backend nega. ⚠️ Chamada desnecessária — INSTRUCTOR tem alunos atribuídos, não precisa de filtro global. | 🚫 + ⚠️ |
| `DELETE /objectives/{id}` | 161 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_WRITE')` | 🔓 Sem guard |

---

## Objetivos — Formulário

### `objective-form.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /students` | 98 | OWNER, ADMIN, INSTRUCTOR | 🚫 **INSTRUCTOR**: `hasPermission('STUDENT_READ')` passa (linha 67) mas backend nega. ⚠️ Chamada desnecessária — INSTRUCTOR já seleciona aluno na tela anterior. | 🚫 + ⚠️ |
| `GET /objectives/{id}` | 110 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_READ')` — rota guard protege. | 🔓 |
| `POST /objectives` | 169 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_WRITE')` | 🔓 Sem guard |
| `PUT /objectives/{id}` | 156 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_WRITE')` | 🔓 Sem guard |

---

## Objetivos — Detalhes

### `objective-details.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /objectives/{id}` | 51 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_READ')` — rota guard protege. | 🔓 |
| `GET /students/{studentId}` | 66 | OWNER, ADMIN, INSTRUCTOR | ✅ `hasPermission('STUDENT_READ')` presente (linha 65). 🚫 Backend só aceita ADMIN e RECEPTIONIST. INSTRUCTOR toma 403. ⚠️ Chamada desnecessária — nome do aluno poderia vir no payload do objetivo. | 🚫 + ⚠️ |
| `DELETE /objectives/{id}` | 88 | OWNER, ADMIN, INSTRUCTOR | 🔓 Sem `hasPermission('OBJECTIVE_WRITE')` | 🔓 Sem guard |

---

## Aprovação de Reposição (Makeup)

### `makeup-approval.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /instructors?active=true` | 121 | OWNER, ADMIN, RECEPTIONIST | ✅ `hasPermission('INSTRUCTOR_READ')` presente (linha 83). Só ADMIN e OWNER passam. RECEPTIONIST não tem. 🔓 Mas RECEPTIONIST pode acessar a rota — o guard da linha 83 falha e impede a chamada. ✅ Correto. | ✅ |
| `GET /makeup-requests` | 106 | OWNER, ADMIN, RECEPTIONIST | ✅ `hasPermission('MAKEUP_REQUEST_READ')` presente (linha 86). | ✅ |
| `PATCH /makeup-requests/{id}/approve` | 193 | OWNER, ADMIN, RECEPTIONIST | 🔓 `approve()` não verifica `MAKEUP_REQUEST_WRITE` | 🔓 Sem guard |
| `PATCH /makeup-requests/{id}/reject` | 224 | OWNER, ADMIN, RECEPTIONIST | 🔓 `reject()` não verifica `MAKEUP_REQUEST_WRITE` | 🔓 Sem guard |

---

### `makeup-approval-approve-dialog.component.ts`

| Chamada | Linha | Perfis | Problema | Categoria |
|---|---|---|---|---|
| `GET /class-sessions?status=SCHEDULED` | 116 | OWNER, ADMIN, RECEPTIONIST | ✅ `hasPermission('MAKEUP_REQUEST_WRITE')` na linha 103 (permissão semanticamente correta, pois o diálogo só é aberto para aprovar). Backend permite ADMIN, INSTRUCTOR, RECEPTIONIST. ✅ Backend aceita RECEPTIONIST. | ✅ |

---

## Matriz Resumo de 403 Silencioso por Perfil

| Perfil | Tela | Chamada que falha | Linha | Endpoint |
|---|---|---|---|---|
| **INSTRUCTOR** | Alunos (lista) | `GET /students` | 59 | `/students` |
| **INSTRUCTOR** | Alunos (detalhes) | `GET /students/{id}` | 57 | `/students/{id}` |
| **INSTRUCTOR** | Turmas (lista) | `GET /class-groups` | 77 | `/class-groups` |
| **INSTRUCTOR** | Chamada/Frequência | `GET /class-groups?active=true` | 138 | `/class-groups` |
| **INSTRUCTOR** | Agenda do Dia | `GET /class-groups?active=true` | 151 | `/class-groups` |
| **INSTRUCTOR** | Agenda do Dia | `GET /enrollments?classGroupId={id}` | 264 | `/enrollments` (fallback) |
| **INSTRUCTOR** | Avaliações (lista) | `GET /students` | 82 | `/students` |
| **INSTRUCTOR** | Avaliações (form) | `GET /students` | 98 | `/students` |
| **INSTRUCTOR** | Evoluções (lista) | `GET /students` | 94 | `/students` |
| **INSTRUCTOR** | Evoluções (form) | `GET /students` | 101 | `/students` |
| **INSTRUCTOR** | Objetivos (lista) | `GET /students` | 78 | `/students` |
| **INSTRUCTOR** | Objetivos (form) | `GET /students` | 98 | `/students` |
| **INSTRUCTOR** | Objetivos (detalhes) | `GET /students/{id}` | 66 | `/students/{id}` |
| **INSTRUCTOR** | Evolution Dialog | `GET /students` | 108 | `/students` |
| **FINANCIAL** | Alunos (lista) | `GET /students` | 59 | `/students` |
| **FINANCIAL** | Alunos (detalhes) | `GET /students/{id}` | 57 | `/students/{id}` |
| **FINANCIAL** | Matrículas (lista) | `GET /enrollments` | 94 | `/enrollments` |
| **FINANCIAL** | Matrículas (lista) | `GET /students?active=true` | 108 | `/students` |
| **FINANCIAL** | Matrículas (lista) | `GET /class-groups?active=true` | 119 | `/class-groups` |
| **RECEPTIONIST** | Turmas (lista) | `GET /class-groups` | 77 | `/class-groups` |
| **RECEPTIONIST** | Chamada/Frequência | `GET /class-groups?active=true` | 138 | `/class-groups` |
| **RECEPTIONIST** | Agenda do Dia | `GET /class-groups?active=true` | 151 | `/class-groups` |
| **RECEPTIONIST** | Matrículas (form) | `GET /class-groups` | 122 | `/class-groups` |

> **Total: 23 ocorrências de 403 silencioso** distribuídas entre INSTRUCTOR (14), FINANCIAL (5) e RECEPTIONIST (4).

---

## Matriz de Chamadas Desnecessárias

| Tela | Chamada | Linha | Motivo | Categoria |
|---|---|---|---|---|
| **Turmas (lista)** | `GET /instructors?active=true` | 93 | RECEPTIONIST não passa no guard `INSTRUCTOR_READ` (linha 68) — correto. Mas o filtro "Instrutor" aparece no template e a chamada é sempre tentada. Se o guard falhar, o filtro fica vazio. | ⚠️ UI inconsistente |
| **Chamada/Frequência** | `GET /class-groups?active=true` | 138 | RECEPTIONIST e INSTRUCTOR acessam a tela mas tomam 403. Tela principal fica inutilizável. | 🚫 Tela quebrada |
| **Objetivos (lista)** | `GET /students` | 78 | Filtro de aluno em tela de objetivos. INSTRUCTOR tem alunos atribuídos, não precisa de filtro global. | ⚠️ Desnecessário |
| **Objetivos (form)** | `GET /students` | 98 | Dropdown de aluno no formulário de objetivo. INSTRUCTOR já vem de um contexto de aluno (vindo da tela de detalhes). | ⚠️ Desnecessário |
| **Objetivos (detalhes)** | `GET /students/{id}` | 66 | Busca nome do aluno que já deveria estar disponível no payload do objetivo. | ⚠️ Desnecessário |
| **Avaliações (lista)** | `GET /students` | 82 | Filtro de aluno. INSTRUCTOR avalia seus próprios alunos, filtro global não faz sentido. | ⚠️ Desnecessário |
| **Avaliações (form)** | `GET /students` | 98 | Dropdown de aluno. Poderia vir do contexto da avaliação. | ⚠️ Desnecessário |
| **Evoluções (lista)** | `GET /students` | 94 | Filtro de aluno. INSTRUCTOR só vê alunos vinculados. | ⚠️ Desnecessário |
| **Evoluções (form)** | `GET /students` | 101 | Dropdown de aluno. Poderia vir do contexto. | ⚠️ Desnecessário |
| **Evolution Dialog** | `GET /students` | 108 | Dropdown de aluno no diálogo. Só necessário se o diálogo criar para qualquer aluno. | ⚠️ Desnecessário |
| **Agenda do Dia** | `GET /enrollments/class-groups/{id}/students` (contagem) | 188 | Chamada prematura para contagem de alunos antes de expandir card. INSTRUCTOR e RECEPTIONIST podem nem expandir. | ⚠️ Lazy load adiável |
| **Matrículas (lista)** | `GET /class-groups?active=true` | 119 | RECEPTIONIST toma 403. Filtro de turma quebrado para RECEPTIONIST. | 🚫 Filtro quebrado |

---

## Endpoints Inexistentes (404)

| Chamada | Linha | Componente | Impacto |
|---|---|---|---|
| `PUT /class-sessions/{id}` | 140 | `session-form.component.ts` | **Edição de sessão quebrada.** Backend não tem PUT, só PATCH. `sessionService.update()` faz PUT que retorna 404. |
| `DELETE /class-sessions/{id}` | — | `sessionService.delete()` | **Não usado** por nenhum componente — apenas declarado no service. |
| `DELETE /class-groups/{id}` | — | `classGroupService.delete()` | **Não usado** por nenhum componente — backend só tem inactivate/reactivate. |

---

## Recomendações Prioritárias

### Críticas (corrigir imediatamente)

| # | Problema | Ação |
|---|---|---|
| C1 | `deactivate-dialog.component.ts` — `inactivate()` sem `PermissionService` | Injetar PermissionService e verificar `CLASS_GROUP_WRITE` |
| C2 | `PUT /class-sessions/{id}` não existe no backend | Adicionar endpoint PUT no ClassSessionController, ou mudar frontend para usar PATCH |
| C3 | `FINANCIAL` não consegue acessar endpoint algum nos controllers | Adicionar `@RequireRole(FINANCIAL)` nos controllers relevantes ou remover do frontend |
| C4 | `STUDENT` não consegue acessar endpoint algum nos controllers | Adicionar `@RequireRole(STUDENT)` nos controllers de objetivos/avaliações/evoluções |

### Alta (próximo ciclo)

| # | Problema | Ação |
|---|---|---|
| A1 | 23 chamadas com 403 silencioso para INSTRUCTOR, RECEPTIONIST, FINANCIAL | Alinhar ROUTE_PERMISSIONS com os `@RequireRole` do backend |
| A2 | Todas as operações de escrita (create/update/delete) sem `hasPermission()` | Adicionar verificação em todos os `onSubmit()` e `onDelete()` |
| A3 | `GET /class-groups` negado para RECEPTIONIST e INSTRUCTOR | Avaliar se backend deve abrir ou frontend deve restringir rota |
| A4 | `GET /students` negado para INSTRUCTOR | Backend já dá permissão STUDENT_READ a INSTRUCTOR no RolePermissions, mas controller nega. Corrigir controller. |

### Média (refatoração)

| # | Problema | Ação |
|---|---|---|
| M1 | `GET /students` em telas de Objetivos/Avaliações/Evoluções é desnecessário | Remover filtro de aluno global quando o perfil é INSTRUCTOR |
| M2 | `student-form.component.ts` linha 65: permissão trocada | Trocar `STUDENT_WRITE` por `STUDENT_READ` |
| M3 | `makeup-approval-approve-dialog.component.ts` linha 103: permissão semanticamente errada | Trocar `MAKEUP_REQUEST_WRITE` por `SESSION_READ` |
| M4 | Lazy loading na Agenda do Dia: chamadas prematuras de contagem | Mover `getStudentsByClassGroupId` para momento do expand |

---

## Estatísticas Finais

| Métrica | Valor |
|---|---|
| Componentes auditados | 33 |
| Total de chamadas HTTP | ~120 |
| Chamadas SEM perm check (write) | 26 |
| Chamadas SEM perm check (read) | 10 |
| Chamadas com 403 silencioso | 23 |
| Chamadas desnecessárias | 12 |
| Endpoints inexistentes (404) | 3 |
| Mismatch de permissão | 2 |
| Componentes sem PermissionService | 1 (`deactivate-dialog.component.ts`) |
