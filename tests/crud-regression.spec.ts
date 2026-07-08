import { test, expect } from '@playwright/test';

const MOCK_USER = {
  id: '1',
  name: 'Admin Teste',
  email: 'admin@corely.com',
  role: 'ADMIN',
  studio: { id: 's1', name: 'Studio Teste' },
  permissions: [
    'DASHBOARD_VIEW',
    'STUDENT_READ', 'STUDENT_WRITE',
    'CLASS_GROUP_READ', 'CLASS_GROUP_WRITE',
    'ENROLLMENT_READ', 'ENROLLMENT_WRITE',
    'ATTENDANCE_READ', 'ATTENDANCE_WRITE',
    'SESSION_READ', 'SESSION_WRITE',
    'OBJECTIVE_READ', 'OBJECTIVE_WRITE',
    'EVALUATION_READ', 'EVALUATION_WRITE',
    'EVOLUTION_READ', 'EVOLUTION_WRITE',
    'MAKEUP_REQUEST_READ', 'MAKEUP_REQUEST_WRITE',
    'FINANCIAL_READ', 'FINANCIAL_WRITE',
    'SETTINGS_READ', 'SETTINGS_WRITE',
  ],
};

const MOCK_STUDENTS = [
  { id: 's1', fullName: 'Maria Silva', phone: '(11) 99999-8888', email: 'maria@email.com', birthDate: '1995-05-10', active: true },
  { id: 's2', fullName: 'João Santos', phone: '(11) 97777-6666', email: 'joao@email.com', birthDate: '1998-08-22', active: true },
  { id: 's3', fullName: 'Ana Oliveira', phone: '(11) 95555-4444', email: 'ana@email.com', birthDate: '2000-01-15', active: false },
];

const MOCK_INSTRUCTORS = [
  { id: 'i1', fullName: 'Ricardo Souza', phone: '(11) 98888-7777', email: 'ricardo@email.com', specialty: 'Pilates', active: true },
  { id: 'i2', fullName: 'Fernanda Lima', phone: '(11) 94444-3333', email: 'fernanda@email.com', specialty: 'Alongamento', active: true },
];

const MOCK_CLASS_GROUPS = [
  { id: 'cg1', studioId: 's1', instructorId: 'i1', instructorName: 'Ricardo Souza', name: 'Pilares Avançado', startTime: '08:00', endTime: '09:00', capacity: 10, monday: true, tuesday: false, wednesday: true, thursday: false, friday: true, saturday: false, sunday: false, active: true },
  { id: 'cg2', studioId: 's1', instructorId: 'i2', instructorName: 'Fernanda Lima', name: 'Alongamento Iniciante', startTime: '10:00', endTime: '11:00', capacity: 15, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false, active: true },
  { id: 'cg3', studioId: 's1', instructorId: 'i1', instructorName: 'Ricardo Souza', name: 'Gestantes', startTime: '14:00', endTime: '15:00', capacity: 6, monday: false, tuesday: true, wednesday: false, thursday: true, friday: false, saturday: false, sunday: false, active: false },
];

const MOCK_ENROLLMENTS = [
  { id: 'e1', studentId: 's1', studentName: 'Maria Silva', classGroupId: 'cg1', classGroupName: 'Pilares Avançado', enrollmentDate: '2026-01-15T00:00:00', status: 'active' },
  { id: 'e2', studentId: 's2', studentName: 'João Santos', classGroupId: 'cg2', classGroupName: 'Alongamento Iniciante', enrollmentDate: '2026-02-20T00:00:00', status: 'active' },
  { id: 'e3', studentId: 's3', studentName: 'Ana Oliveira', classGroupId: 'cg1', classGroupName: 'Pilares Avançado', enrollmentDate: '2026-03-10T00:00:00', status: 'inactive' },
];

const MOCK_EVALUATIONS = [
  { id: 'ev1', studioId: 's1', studentId: 's1', studentName: 'Maria Silva', evaluationDate: '2026-06-01T00:00:00', weight: 65.5, height: 1.65 },
  { id: 'ev2', studioId: 's1', studentId: 's2', studentName: 'João Santos', evaluationDate: '2026-06-15T00:00:00', weight: 78.0, height: 1.75 },
];

const MOCK_OBJECTIVES = [
  { id: 'o1', studioId: 's1', studentId: 's1', title: 'Perder peso', description: 'Reduzir 5kg em 3 meses', status: 'ACTIVE', startDate: '2026-05-01T00:00:00', targetDate: '2026-08-01T00:00:00' },
  { id: 'o2', studioId: 's1', studentId: 's2', title: 'Ganhar massa muscular', description: 'Aumentar massa magra', status: 'ACTIVE', startDate: '2026-04-01T00:00:00', targetDate: '2026-07-01T00:00:00' },
];

async function setupAuth(page: any) {
  await page.route('**/api/auth/me', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
  });
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
  });
}

async function setupStudentsApi(page: any) {
  await page.route('**/api/students', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STUDENTS) });
  });
}

async function setupInstructorsApi(page: any) {
  await page.route('**/api/instructors', async (route: any) => {
    const url = route.request().url();
    if (url.includes('class-groups')) {
      await route.fallback();
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_INSTRUCTORS) });
  });
}

async function setupClassGroupsApi(page: any) {
  await page.route('**/api/class-groups', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_CLASS_GROUPS) });
  });
}

async function setupEnrollmentsApi(page: any) {
  await page.route('**/api/enrollments', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ENROLLMENTS) });
  });
}

async function setupEvaluationsApi(page: any) {
  await page.route('**/api/evaluations', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_EVALUATIONS) });
  });
}

async function setupObjectivesApi(page: any) {
  await page.route('**/api/objectives', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_OBJECTIVES) });
  });
}

async function setupDashboardApi(page: any) {
  await page.route('**/api/dashboard/**', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({}) });
  });
}

function collectConsoleErrors(page: any): string[] {
  const errors: string[] = [];
  page.on('console', (msg: any) => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  page.on('pageerror', (err: any) => {
    errors.push(err.message);
  });
  return errors;
}

test.describe('CRUD Pages - Desktop Regression', () => {
  test.use({ viewport: { width: 1280, height: 800 } });

  test.describe('Students Page', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupStudentsApi(page);
      await setupDashboardApi(page);
    });

    test('tabela de alunos carrega no desktop', async ({ page }) => {
      await page.goto('/students');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const rows = page.locator('table.crud-table tbody tr.mat-row');
      await expect(rows).toHaveCount(3);
      await expect(page.locator('table.crud-table')).toBeVisible();
    });

    test('navegação não quebra ao acessar alunos', async ({ page }) => {
      await page.goto('/students');
      await page.waitForSelector('app-students', { timeout: 10000 });
      await expect(page.locator('app-sidebar')).toBeVisible();
      await expect(page.locator('app-topbar')).toBeVisible();
    });
  });

  test.describe('Instructors Page', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupInstructorsApi(page);
      await setupDashboardApi(page);
    });

    test('tabela de instrutores carrega no desktop', async ({ page }) => {
      await page.goto('/instructors');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const rows = page.locator('table.crud-table tbody tr.mat-row');
      await expect(rows).toHaveCount(2);
    });
  });

  test.describe('Class Groups Page', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupClassGroupsApi(page);
      await setupInstructorsApi(page);
      await setupDashboardApi(page);
    });

    test('tabela de turmas carrega no desktop', async ({ page }) => {
      await page.goto('/class-groups');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const rows = page.locator('table.crud-table tbody tr.mat-row');
      await expect(rows).toHaveCount(3);
    });

    test('coluna de instrutor renderiza corretamente', async ({ page }) => {
      await page.goto('/class-groups');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const firstRow = page.locator('table.crud-table tbody tr.mat-row').first();
      await expect(firstRow).toContainText('Ricardo Souza');
    });
  });

  test.describe('Enrollments Page', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupEnrollmentsApi(page);
      await setupStudentsApi(page);
      await setupClassGroupsApi(page);
      await setupDashboardApi(page);
    });

    test('tabela de matrículas carrega no desktop', async ({ page }) => {
      await page.goto('/enrollments');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const rows = page.locator('table.crud-table tbody tr.mat-row');
      await expect(rows).toHaveCount(3);
    });
  });

  test.describe('Evaluations Page', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupEvaluationsApi(page);
      await setupStudentsApi(page);
      await setupDashboardApi(page);
    });

    test('tabela de avaliações carrega no desktop', async ({ page }) => {
      await page.goto('/evaluations');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const rows = page.locator('table.crud-table tbody tr.mat-row');
      await expect(rows).toHaveCount(2);
    });
  });

  test.describe('Objectives Page', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupObjectivesApi(page);
      await setupStudentsApi(page);
      await setupDashboardApi(page);
    });

    test('tabela de objetivos carrega no desktop', async ({ page }) => {
      await page.goto('/objectives');
      await page.waitForSelector('table.crud-table', { timeout: 10000 });
      const rows = page.locator('table.crud-table tbody tr.mat-row');
      await expect(rows).toHaveCount(2);
    });
  });
});

test.describe('CRUD Pages - Mobile Regression', () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test.describe('Students Page Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupStudentsApi(page);
      await setupDashboardApi(page);
    });

    test('cards de alunos carregam no mobile', async ({ page }) => {
      await page.goto('/students');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      const cards = page.locator('mat-card.crud-item-card');
      await expect(cards).toHaveCount(3);
    });

    test('tabela não aparece no mobile', async ({ page }) => {
      await page.goto('/students');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      await expect(page.locator('table.crud-table')).not.toBeVisible();
    });

    test('bottom nav visível na página de alunos', async ({ page }) => {
      await page.goto('/students');
      await page.waitForSelector('app-bottom-nav', { timeout: 10000 });
      await expect(page.locator('app-bottom-nav')).toBeVisible();
    });
  });

  test.describe('Instructors Page Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupInstructorsApi(page);
      await setupDashboardApi(page);
    });

    test('cards de instrutores carregam no mobile', async ({ page }) => {
      await page.goto('/instructors');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      const cards = page.locator('mat-card.crud-item-card');
      await expect(cards).toHaveCount(2);
    });
  });

  test.describe('Class Groups Page Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupClassGroupsApi(page);
      await setupInstructorsApi(page);
      await setupDashboardApi(page);
    });

    test('cards de turmas carregam no mobile', async ({ page }) => {
      await page.goto('/class-groups');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      const cards = page.locator('mat-card.crud-item-card');
      await expect(cards).toHaveCount(3);
    });
  });

  test.describe('Enrollments Page Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupEnrollmentsApi(page);
      await setupStudentsApi(page);
      await setupClassGroupsApi(page);
      await setupDashboardApi(page);
    });

    test('cards de matrículas carregam no mobile', async ({ page }) => {
      await page.goto('/enrollments');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      const cards = page.locator('mat-card.crud-item-card');
      await expect(cards).toHaveCount(3);
    });
  });

  test.describe('Evaluations Page Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupEvaluationsApi(page);
      await setupStudentsApi(page);
      await setupDashboardApi(page);
    });

    test('cards de avaliações carregam no mobile', async ({ page }) => {
      await page.goto('/evaluations');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      const cards = page.locator('mat-card.crud-item-card');
      await expect(cards).toHaveCount(2);
    });
  });

  test.describe('Objectives Page Mobile', () => {
    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupObjectivesApi(page);
      await setupStudentsApi(page);
      await setupDashboardApi(page);
    });

    test('cards de objetivos carregam no mobile', async ({ page }) => {
      await page.goto('/objectives');
      await page.waitForSelector('app-crud-card', { timeout: 10000 });
      const cards = page.locator('mat-card.crud-item-card');
      await expect(cards).toHaveCount(2);
    });
  });
});
