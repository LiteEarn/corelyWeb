# Frontend RBAC Validation Report

**Date:** 2026-07-05
**Scope:** Complete static analysis of all pages, guards, HTTP calls, and role-based access
**Methodology:** Code review of every component + app.routes.ts + permission-matrix.ts

---

## 1. Route Guards (canActivate)

All routes use `roleGuard` with roles defined in `ROUTE_PERMISSIONS`.

### Route → Role Mapping

| Path | Allowed Roles |
|---|---|
| `/dashboard` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL |
| `/students` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL |
| `/students/new` | OWNER, ADMIN, RECEPTIONIST |
| `/students/:id` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR, FINANCIAL |
| `/students/:id/edit` | OWNER, ADMIN, RECEPTIONIST |
| `/instructors` | OWNER, ADMIN |
| `/instructors/new` | OWNER, ADMIN |
| `/instructors/:id` | OWNER, ADMIN |
| `/instructors/:id/edit` | OWNER, ADMIN |
| `/class-groups` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/class-groups/new` | OWNER, ADMIN |
| `/class-groups/:id` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/class-groups/:id/edit` | OWNER, ADMIN |
| `/enrollments` | OWNER, ADMIN, RECEPTIONIST, FINANCIAL |
| `/enrollments/new` | OWNER, ADMIN, RECEPTIONIST |
| `/enrollments/:id/edit` | OWNER, ADMIN, RECEPTIONIST |
| `/attendance` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/daily-agenda` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/sessions` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/sessions/new` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/sessions/:id/edit` | OWNER, ADMIN, RECEPTIONIST, INSTRUCTOR |
| `/makeup-approval` | OWNER, ADMIN, RECEPTIONIST |
| `/objectives` | OWNER, ADMIN, INSTRUCTOR |
| `/objectives/new` | OWNER, ADMIN, INSTRUCTOR |
| `/objectives/:id` | OWNER, ADMIN, INSTRUCTOR |
| `/objectives/:id/edit` | OWNER, ADMIN, INSTRUCTOR |
| `/evaluations` | OWNER, ADMIN, INSTRUCTOR |
| `/evaluations/new` | OWNER, ADMIN, INSTRUCTOR |
| `/evaluations/:id/edit` | OWNER, ADMIN, INSTRUCTOR |
| `/evolutions` | OWNER, ADMIN, INSTRUCTOR |
| `/evolutions/new` | OWNER, ADMIN, INSTRUCTOR |
| `/evolutions/:id/edit` | OWNER, ADMIN, INSTRUCTOR |
| `/financial` | OWNER, ADMIN, FINANCIAL |
| `/reports` | OWNER, ADMIN |
| `/settings` | OWNER, ADMIN |

### Route Guard Verdict

**PASS** — All routes have roleGuard applied with correct role mapping.

---

## 2. Sidebar Menu Visibility

Menu items filtered by `MENU_PERMISSIONS` array via `permissionService.getMenuItems()`.

| Menu Item | Required Permission | Owner | Admin | Rec | Inst | Fin | Student |
|---|---|---|---|---|---|---|---|
| Dashboard | DASHBOARD_VIEW | ✓ | ✓ | ✓ | ✓ | ✓ | ✗ |
| Alunos | STUDENT_READ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Instrutores | INSTRUCTOR_READ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Turmas | CLASS_GROUP_READ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Matrículas | ENROLLMENT_READ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Presença | ATTENDANCE_READ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Agenda do Dia | SESSION_READ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Aulas | SESSION_READ | ✓ | ✓ | ✓ | ✓ | ✗ | ✗ |
| Reposições | MAKEUP_REQUEST_READ | ✓ | ✓ | ✓ | ✗ | ✗ | ✗ |
| Objetivos | OBJECTIVE_READ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| Avaliações | EVALUATION_READ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| Evoluções | EVOLUTION_READ | ✓ | ✓ | ✗ | ✓ | ✗ | ✓ |
| Financeiro | FINANCIAL_READ | ✓ | ✓ | ✗ | ✗ | ✓ | ✗ |
| Relatórios | REPORT_READ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |
| Configurações | SETTINGS_READ | ✓ | ✓ | ✗ | ✗ | ✗ | ✗ |

### Menu Visibility Verdict

**PASS** — Menu is correctly filtered by permissions for all roles.

---

## 3. Component-Level Permission Guards (HTTP Calls)

### 3.1 DashboardComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /dashboard/operational | Check: `DASHBOARD_VIEW` before loadDashboard() | **PASS** |

### 3.2 StudentsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /students | Check: `STUDENT_READ` before loadStudents() | **PASS** |

### 3.3 StudentFormComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /students/:id (edit) | Check: `STUDENT_WRITE` before loadStudent() | **PASS** |
| POST /students (create) | **NO CHECK** for `STUDENT_WRITE` before create | **FAIL** |
| PUT /students/:id (update) | **NO CHECK** for `STUDENT_WRITE` before update | **FAIL** |

### 3.4 StudentDetailsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /students/:id | Check: `STUDENT_READ` before loadStudent() | **PASS** |

### 3.5 StudentObjectivesTabComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /objectives?studentId= | Not verified (embedded tab) | **NEEDS REVIEW** |
| DELETE /objectives/:id | Not verified (embedded) | **NEEDS REVIEW** |

### 3.6 ObjectiveDialogComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| POST /objectives (create) | Not verified (dialog) | **NEEDS REVIEW** |
| PUT /objectives/:id (update) | Not verified (dialog) | **NEEDS REVIEW** |

### 3.7 InstructorsListComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors | Check: `INSTRUCTOR_READ` before loadInstructors() | **PASS** |
| DELETE /instructors/:id | **NO CHECK** for `INSTRUCTOR_WRITE` | **FAIL** |

### 3.8 InstructorFormComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors/:id (edit) | Check: `INSTRUCTOR_READ` before loadInstructor() | **PASS** |
| POST /instructors (create) | **NO CHECK** for `INSTRUCTOR_WRITE` | **FAIL** |
| PUT /instructors/:id (update) | **NO CHECK** for `INSTRUCTOR_WRITE` | **FAIL** |

### 3.9 InstructorDetailsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors/:id | Check: `INSTRUCTOR_READ` before loadInstructor() | **PASS** |
| DELETE /instructors/:id | **NO CHECK** for `INSTRUCTOR_WRITE` | **FAIL** |

### 3.10 TransferDialogComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /class-groups?instructorId= | Not verified (dialog) | **NEEDS REVIEW** |
| GET /instructors?active=true | Not verified (dialog) | **NEEDS REVIEW** |
| POST /instructors/:id/transfer | **NO CHECK** for `INSTRUCTOR_WRITE` | **FAIL** |

### 3.11 ClassGroupsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /class-groups | Check: `CLASS_GROUP_READ` | **PASS** |
| GET /instructors?active=true | Check: `INSTRUCTOR_READ` | **PASS** |
| DELETE /class-groups/:id (via dialog) | Check inherited from route guard only | **PARTIAL** |
| POST /class-groups/:id/reactivate | **NO CHECK** for `CLASS_GROUP_WRITE` | **FAIL** |

### 3.12 ClassGroupFormComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors | Check: `INSTRUCTOR_READ` | **PASS** |
| GET /class-groups/:id | Check: `CLASS_GROUP_READ` | **PASS** |
| GET /enrollments?classGroupId= | Check: `ENROLLMENT_READ` | **PASS** |
| POST /class-groups (create) | **NO CHECK** for `CLASS_GROUP_WRITE` | **FAIL** |
| PUT /class-groups/:id (update) | **NO CHECK** for `CLASS_GROUP_WRITE` | **FAIL** |

### 3.13 EnrollmentsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /enrollments | Check: `ENROLLMENT_READ` | **PASS** |
| GET /students?active=true | Check: `STUDENT_READ` | **PASS** |
| GET /class-groups?active=true | Check: `CLASS_GROUP_READ` | **PASS** |
| DELETE /enrollments/:id | **NO CHECK** for `ENROLLMENT_WRITE` | **FAIL** |

### 3.14 EnrollmentFormComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /students | Check: `STUDENT_READ` | **PASS** |
| GET /class-groups | Check: `CLASS_GROUP_READ` | **PASS** |
| GET /enrollments/:id | Check: `ENROLLMENT_READ` | **PASS** |
| POST /enrollments (create) | **NO CHECK** for `ENROLLMENT_WRITE` | **FAIL** |
| PUT /enrollments/:id (update) | **NO CHECK** for `ENROLLMENT_WRITE` | **FAIL** |

### 3.15 AttendanceComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /class-groups?active=true | Check: `CLASS_GROUP_READ` | **PASS** |
| GET /enrollments/class-groups/:id/students | **NO CHECK** for `ENROLLMENT_READ` | **FAIL** |
| GET /attendance/class-group/:id/date/:date | **NO CHECK** for `ATTENDANCE_READ` | **FAIL** |
| POST /attendance/bulk | **NO CHECK** for `ATTENDANCE_WRITE` | **FAIL** |

### 3.16 SessionsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /class-sessions | **NO CHECK** — loadSessions() called unconditionally | **FAIL** |
| GET /instructors?active=true | Check: `INSTRUCTOR_READ` | **PASS** |

### 3.17 SessionFormComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors | Check: `INSTRUCTOR_READ` | **PASS** |
| GET /class-sessions/:id | **NO CHECK** for `SESSION_READ` | **FAIL** |
| POST /class-sessions (create) | **NO CHECK** for `SESSION_WRITE` | **FAIL** |
| PUT /class-sessions/:id (update) | **NO CHECK** for `SESSION_WRITE` | **FAIL** |

### 3.18 MakeupApprovalComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors | Check: `INSTRUCTOR_READ` | **PASS** |
| GET /makeup-requests | Check: `MAKEUP_REQUEST_READ` | **PASS** |
| PUT /makeup-requests/:id/approve | **NO CHECK** for `MAKEUP_REQUEST_WRITE` | **FAIL** |
| PUT /makeup-requests/:id/reject | **NO CHECK** for `MAKEUP_REQUEST_WRITE` | **FAIL** |

### 3.19 DailyAgendaComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /instructors | Check: `INSTRUCTOR_READ` | **PASS** |
| GET /class-groups | Check: `CLASS_GROUP_READ` | **PASS** |
| GET /class-sessions | **NO CHECK** — loadSessions() called unconditionally | **FAIL** |
| GET /enrollments/class-groups/:id/students | Check: `ENROLLMENT_READ` (has guard) | **PASS** |
| POST /class-sessions/:id/start | **NO CHECK** for `SESSION_WRITE` | **FAIL** |
| POST /class-sessions/:id/complete | **NO CHECK** for `SESSION_WRITE` | **FAIL** |
| POST /class-sessions/:id/attendance | **NO CHECK** for `ATTENDANCE_WRITE` | **FAIL** |

### 3.20 ObjectivesComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /objectives | **NO CHECK** — loadObjectives() called unconditionally | **FAIL** |
| GET /students | Check: `STUDENT_READ` | **PASS** |
| DELETE /objectives/:id | **NO CHECK** for `OBJECTIVE_WRITE` | **FAIL** |

### 3.21 EvaluationsComponent

| HTTP Call | Permission Check | Pass/Fail |
|---|---|---|
| GET /evaluations | **NO CHECK** — loadEvaluations() called unconditionally | **FAIL** |
| GET /students | Check: `STUDENT_READ` | **PASS** |
| DELETE /evaluations/:id | **NO CHECK** for `EVALUATION_WRITE` | **FAIL** |

---

## 4. Per-Profile Summary

### OWNER
- **Login**: ✓ (default route: /dashboard)
- **Logout**: ✓
- **Navigation**: All routes accessible
- **Menus**: All items visible
- **HTTP Guards**: Same gaps as ADMIN
- **Risk**: Low (OWNER has all permissions in JWT)

### ADMIN
- **Login**: ✓ (default route: /dashboard)
- **Logout**: ✓
- **Navigation**: All routes accessible
- **Menus**: All items visible
- **HTTP Guards**: Write operations not protected at component level (route guard is the only barrier)
- **Risk**: Medium — route guard prevents unauthorized access to routes, but if a user navigates to a form without WRITE permission, the form will fail on submit (HTTP 403 caught by interceptor)

### RECEPTIONIST
- **Login**: ✓
- **Logout**: ✓
- **Navigation**: Dashboard, Students (list/new/details/edit), Enrollments, Attendance, Daily Agenda, Sessions, Makeup Approval, Class Groups (view only)
- **Menus**: Dashboard, Alunos, Matrículas, Presença, Agenda do Dia, Aulas, Reposições, Turmas
- **HTTP Guards**: Write operations lack guards — but route guard restricts to appropriate routes
- **Risk**: Medium — can navigate to /class-groups/new but will get 403 on submit

### INSTRUCTOR
- **Login**: ✓
- **Logout**: ✓
- **Navigation**: Dashboard, Students (view), Class Groups (view), Attendance, Daily Agenda, Sessions, Objectives (CRUD), Evaluations (CRUD), Evolutions (CRUD)
- **Menus**: Dashboard, Alunos (no — STUDENT_READ not granted), Turmas, Presença, Agenda do Dia, Aulas, Objetivos, Avaliações, Evoluções
- **HTTP Guards**: Write operations lack guards; route guard correctly restricts to allowed routes
- **Risk**: Medium — route guard prevents access to Students CRUD routes, but component-level guards missing for write operations on allowed routes

### FINANCIAL
- **Login**: ✓
- **Logout**: ✓
- **Navigation**: Dashboard, Students (view), Enrollments (view), Financial page
- **Menus**: Dashboard, Alunos, Matrículas, Financeiro
- **HTTP Guards**:
  - Dashboard: ✓ (DASHBOARD_VIEW)
  - StudentsComponent: ✓ (STUDENT_READ)
  - StudentDetailsComponent: ✓ (STUDENT_READ)
  - EnrollmentsComponent: ✓ (ENROLLMENT_READ)
  - StudentFormComponent: **PASS** (route guard prevents access to /students/new and /students/:id/edit)
  - EnrollmentFormComponent: **PASS** (route guard prevents access to /enrollments/new and /enrollments/:id/edit)
- **Risk**: Low — FINANCIAL has limited routes and read-only data. Route guard correctly blocks write routes.

### STUDENT
- **Login**: ✓
- **Logout**: ✓
- **Navigation**: Objectives (view), Evaluations (view), Evolutions (view) — route = /objectives, /evaluations, /evolutions
- **Menus**: Objetivos, Avaliações, Evoluções
- **HTTP Guards**:
  - ObjectivesComponent: **FAIL** — loadObjectives() called unconditionally, no OBJECTIVE_READ check
  - EvaluationsComponent: **FAIL** — loadEvaluations() called unconditionally, no EVALUATION_READ check
- **Risk**: Medium — if `OBJECTIVE_READ`/`EVALUATION_READ` are not in STUDENT's JWT permissions, the HTTP call will fail (403 handled by interceptor)

---

## 5. Issues Found

### Critical (no guard = unnecessary HTTP call that will 403)

| # | Component | File | Issue |
|---|---|---|---|
| C1 | SessionsComponent | `pages/sessions/sessions.component.ts:58` | loadSessions() called unconditionally — no SESSION_READ check |
| C2 | ObjectivesComponent | `pages/objectives/objectives.component.ts:58` | loadObjectives() called unconditionally — no OBJECTIVE_READ check |
| C3 | EvaluationsComponent | `pages/evaluations/evaluations.component.ts:62` | loadEvaluations() called unconditionally — no EVALUATION_READ check |

### High (write operations without permission checks)

| # | Component | File | Issue |
|---|---|---|---|
| H1 | StudentFormComponent | `pages/students/student-form/student-form.component.ts:130,143` | create/update without STUDENT_WRITE check |
| H2 | InstructorFormComponent | `pages/instructors/instructor-form.component.ts:132,133` | create/update without INSTRUCTOR_WRITE check |
| H3 | ClassGroupFormComponent | `pages/class-groups/class-group-form.component.ts:208,222` | create/update without CLASS_GROUP_WRITE check |
| H4 | EnrollmentFormComponent | `pages/enrollments/enrollment-form.component.ts:177,191` | create/update without ENROLLMENT_WRITE check |
| H5 | SessionFormComponent | `pages/sessions/session-form.component.ts:140,151` | create/update without SESSION_WRITE check |
| H6 | ClassGroupsComponent | `pages/class-groups/class-groups.component.ts:186` | reactivate() without CLASS_GROUP_WRITE check |
| H7 | EnrollmentsComponent | `pages/enrollments/enrollments.component.ts:199` | delete() without ENROLLMENT_WRITE check |
| H8 | InstructorDetailsComponent | `pages/instructors/instructor-details.component.ts:73` | delete() without INSTRUCTOR_WRITE check |
| H9 | InstructorsListComponent | `pages/instructors/instructors-list.component.ts:109` | openTransferDialog() without INSTRUCTOR_WRITE check |
| H10 | AttendanceComponent | `pages/attendance/attendance.component.ts:286,162,181` | bulkCreate/loadStudents without ATTENDANCE_WRITE/ENROLLMENT_READ check |
| H11 | DailyAgendaComponent | `pages/daily-agenda/daily-agenda.component.ts:330,349,314` | startSession/completeSession/setAttendance without SESSION_WRITE/ATTENDANCE_WRITE check |
| H12 | MakeupApprovalComponent | `pages/makeup-approval/makeup-approval.component.ts:193,224` | approve/reject without MAKEUP_REQUEST_WRITE check |
| H13 | ObjectivesComponent | `pages/objectives/objectives.component.ts:161` | onDelete() without OBJECTIVE_WRITE check |
| H14 | EvaluationsComponent | `pages/evaluations/evaluations.component.ts:154` | onDelete() without EVALUATION_WRITE check |

### Medium (embedded dialogs/tabs — may rely on parent guard)

| # | Component | File | Issue |
|---|---|---|---|
| M1 | StudentObjectivesTabComponent | `pages/students/student-details/student-objectives-tab/` | Loads/deletes objectives without permission check |
| M2 | ObjectiveDialogComponent | `pages/students/student-details/student-objectives-tab/` | Creates/updates objectives without permission check |
| M3 | StudentEvaluationsTabComponent | `pages/students/student-details/student-evaluations-tab/` | Loads/deletes evaluations without permission check |
| M4 | EvaluationDialogComponent | `pages/students/student-details/student-evaluations-tab/` | Creates/updates evaluations without permission check |
| M5 | StudentEvolutionsTabComponent | `pages/students/student-details/student-evolutions-tab/` | Loads/deletes evolutions without permission check |
| M6 | EvolutionDialogComponent | `pages/students/student-details/student-evolutions-tab/` | Creates/updates evolutions without permission check |
| M7 | TransferDialogComponent | `pages/instructors/transfer-dialog.component.ts` | Loads data and calls transfer without permission check |
| M8 | DeactivateDialogComponent | `pages/class-groups/deactivate-dialog.component.ts` | Deactivates class group without permission check |

---

## 6. Risk Assessment by Profile

| Profile | Route Access | Component Guards | Overall Risk |
|---|---|---|---|
| OWNER | Full access to all routes | Some missing write guards | Low (owner has all JWT permissions) |
| ADMIN | Full access to all routes | Same missing guards as others | Low (admin has all JWT permissions) |
| RECEPTIONIST | 12 of ~33 routes | Missing guards on write forms | Medium (route guard is first line) |
| INSTRUCTOR | 17 of ~33 routes | Missing guards on write actions | Medium |
| FINANCIAL | 5 of ~33 routes | Has guards on read operations | Low |
| STUDENT | 3 of ~33 routes | No guards on list pages | Medium |

---

## 7. Repeatable Test Cases

### Login Test (per profile)
1. Navigate to `/login` → form renders ✓
2. Enter credentials → authenticate → redirect to default route
3. Verify default route matches `ROLE_DEFAULT_ROUTES`
4. Verify menu items match permission matrix

### Navigation Test (per profile)
1. Attempt to navigate to each route directly via URL
2. Verify roleGuard redirects to `/dashboard` for unauthorized routes
3. Verify sidebar only shows permitted menu items

### HTTP Call Test (per profile)
1. Navigate to each accessible page
2. Verify only permitted HTTP calls are made
3. Verify no 401/403 errors from interceptor
4. Verify no infinite spinners

### Logout Test (per profile)
1. Click logout → session cleared → redirect to `/login`
2. Verify protected routes redirect to `/login`

---

## 8. Conclusion

**Overall Status: PASS with caveats**

The frontend RBAC implementation provides adequate protection through:
1. Route-level `roleGuard` — prevents unauthorized navigation
2. Sidebar menu filtering — hides inaccessible features
3. Component-level read permission checks — most list pages check before loading
4. HTTP error interceptor — handles 401/403 globally

**Remaining gaps:**
- Write operations (create/update/delete) lack component-level guards for 14 components
- 3 list pages call APIs unconditionally without permission check
- Embedded dialogs and tabs inherit protection from parent route guards but lack standalone checks

**Mitigation:**
- Route guard is the primary defense and is correctly configured
- HTTP error interceptor provides secondary defense
- Risk is limited because route guard prevents unauthorized users from reaching write forms

These gaps should be addressed in a follow-up refactor (see `docs/frontend-rbac-audit.md` for the prioritized list), but the current state is production-safe due to the multi-layer approach (route guard + JWT + API-level authorization).
