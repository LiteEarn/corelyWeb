import { test, expect, Page } from '@playwright/test';

const MOCK_USER = {
  id: '1',
  name: 'Admin Teste',
  email: 'admin@corely.com',
  role: 'ADMIN',
  studio: { id: '11111111-1111-1111-1111-111111111111', name: 'Studio Teste' },
  permissions: [
    'DASHBOARD_VIEW', 'SESSION_READ', 'SESSION_WRITE',
    'STUDENT_READ', 'ENROLLMENT_READ',
  ],
};

const MOCK_DAILY_SCHEDULE = {
  kpis: { totalToday: 3, inProgress: 1, completed: 1, cancelled: 0 },
  sessions: [
    {
      id: 's1', classGroupId: 'cg1', classGroupName: 'Ballet Infantil',
      instructorId: 'i1', instructorName: 'Ana Silva',
      sessionDate: '2026-07-09', startTime: '08:00', endTime: '09:00',
      status: 'IN_PROGRESS', capacity: 20, enrolledCount: 15, presentCount: 12, notes: null,
    },
    {
      id: 's2', classGroupId: 'cg2', classGroupName: 'Jazz Adulto',
      instructorId: 'i2', instructorName: 'Carlos Santos',
      sessionDate: '2026-07-09', startTime: '09:00', endTime: '10:00',
      status: 'SCHEDULED', capacity: 15, enrolledCount: 10, presentCount: 0, notes: null,
    },
    {
      id: 's3', classGroupId: 'cg3', classGroupName: 'Pilates',
      instructorId: 'i3', instructorName: 'Mariana Costa',
      sessionDate: '2026-07-09', startTime: '10:00', endTime: '11:00',
      status: 'COMPLETED', capacity: 10, enrolledCount: 8, presentCount: 7, notes: null,
    },
  ],
};

const MOCK_STUDENTS_CG1 = [
  { id: 'e1', studentId: 's1', studentName: 'Maria Souza', classGroupId: 'cg1', classGroupName: 'Ballet Infantil', enrollmentDate: '2026-01-01', status: 'ACTIVE', active: true },
  { id: 'e2', studentId: 's2', studentName: 'João Pedro', classGroupId: 'cg1', classGroupName: 'Ballet Infantil', enrollmentDate: '2026-01-01', status: 'ACTIVE', active: true },
];

const MOCK_STUDENTS_CG2 = [
  { id: 'e3', studentId: 's3', studentName: 'Ana Beatriz', classGroupId: 'cg2', classGroupName: 'Jazz Adulto', enrollmentDate: '2026-01-01', status: 'ACTIVE', active: true },
];

const MOCK_STUDENTS_ALL = [...MOCK_STUDENTS_CG1, ...MOCK_STUDENTS_CG2];

async function setupAuth(page: Page) {
  await page.route('**/api/auth/me', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
  });
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
  });
}

async function setupDailyScheduleApi(page: Page) {
  await page.route('**/class-sessions/daily**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DAILY_SCHEDULE) });
  });
}

async function setupStudentsByClassGroupApi(page: Page) {
  await page.route('**/enrollments/class-groups/cg1/students', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STUDENTS_CG1) });
  });
  await page.route('**/enrollments/class-groups/cg2/students', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_STUDENTS_CG2) });
  });
  await page.route('**/enrollments/class-groups/*/students', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
}

async function setupInstructorsApi(page: Page) {
  await page.route('**/api/instructors**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { id: 'i1', fullName: 'Ana Silva', email: 'ana@test.com', phone: '11999999999', specialty: 'Ballet', active: true },
      { id: 'i2', fullName: 'Carlos Santos', email: 'carlos@test.com', phone: '11988888888', specialty: 'Jazz', active: true },
    ])});
  });
}

async function setupClassGroupsApi(page: Page) {
  await page.route('**/api/class-groups**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { id: 'cg1', name: 'Ballet Infantil', studioId: '11111111-1111-1111-1111-111111111111', instructorId: 'i1', startTime: '08:00', endTime: '09:00', capacity: 20, active: true, monday: true, tuesday: false, wednesday: true, thursday: false, friday: true, saturday: false, sunday: false },
      { id: 'cg2', name: 'Jazz Adulto', studioId: '11111111-1111-1111-1111-111111111111', instructorId: 'i2', startTime: '09:00', endTime: '10:00', capacity: 15, active: true, monday: true, tuesday: true, wednesday: true, thursday: true, friday: true, saturday: false, sunday: false },
    ])});
  });
}

async function setupSessionsApi(page: Page) {
  await page.route('**/class-sessions?**', async route => {
    const url = route.request().url();
    if (url.includes('date=')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
        { id: 's1', studioId: '11111111-1111-1111-1111-111111111111', instructorId: 'i1', title: 'Ballet Infantil', scheduledDate: '2026-07-09', startTime: '08:00', endTime: '09:00', maxStudents: 20, status: 'IN_PROGRESS' },
        { id: 's2', studioId: '11111111-1111-1111-1111-111111111111', instructorId: 'i2', title: 'Jazz Adulto', scheduledDate: '2026-07-09', startTime: '09:00', endTime: '10:00', maxStudents: 15, status: 'SCHEDULED' },
      ])});
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
    }
  });
}

async function setupAttendanceApi(page: Page) {
  await page.route('**/api/attendance/session/**', async route => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
      { studentId: 's1', status: 'PRESENT' },
    ])});
  });
}

test.describe('BUG-AGENDA-001 - Agenda Operacional', () => {

  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupDailyScheduleApi(page);
      await setupInstructorsApi(page);
      await setupClassGroupsApi(page);
    });

    test('renderiza colunas corretas na timeline (BUG 1)', async ({ page }) => {
      await page.goto('/daily-schedule');
      await page.waitForSelector('.timeline-desktop', { timeout: 10000 });

      const rows = page.locator('.timeline-row');
      await expect(rows).toHaveCount(3);

      const firstRow = rows.nth(0);
      await expect(firstRow.locator('.col-group')).toHaveText('Ballet Infantil');
      await expect(firstRow.locator('.col-instructor')).toHaveText('Ana Silva');
      await expect(firstRow.locator('.col-capacity')).toHaveText('20');
      await expect(firstRow.locator('.col-enrolled')).toHaveText('15');
      await expect(firstRow.locator('.col-present')).toHaveText('12');
    });

    test('ordenação cronológica correta (BUG 1)', async ({ page }) => {
      await page.goto('/daily-schedule');
      await page.waitForSelector('.timeline-desktop', { timeout: 10000 });

      const times = page.locator('.col-time');
      await expect(times.nth(0)).toContainText('08:00');
      await expect(times.nth(1)).toContainText('09:00');
      await expect(times.nth(2)).toContainText('10:00');
    });

    test('badges de status corretos (BUG 1)', async ({ page }) => {
      await page.goto('/daily-schedule');
      await page.waitForSelector('.timeline-desktop', { timeout: 10000 });

      const statusChips = page.locator('ds-status-chip');
      await expect(statusChips.nth(0)).toContainText('Em andamento');
      await expect(statusChips.nth(1)).toContainText('Agendada');
      await expect(statusChips.nth(2)).toContainText('Concluída');
    });

    test('KPIs refletem contagens corretas (BUG 1)', async ({ page }) => {
      await page.goto('/daily-schedule');
      await page.waitForSelector('.kpi-grid', { timeout: 10000 });

      const kpiValues = page.locator('.kpi-value');
      await expect(kpiValues.nth(0)).toHaveText('3'); // totalToday
      await expect(kpiValues.nth(1)).toHaveText('1'); // inProgress
      await expect(kpiValues.nth(2)).toHaveText('1'); // completed
      await expect(kpiValues.nth(3)).toHaveText('0'); // cancelled
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupDailyScheduleApi(page);
      await setupInstructorsApi(page);
      await setupClassGroupsApi(page);
    });

    test('renderiza cards mobile com dados corretos (BUG 1)', async ({ page }) => {
      await page.goto('/daily-schedule');
      await page.waitForSelector('.cards-mobile', { timeout: 10000 });

      const cards = page.locator('.session-card');
      await expect(cards).toHaveCount(3);

      const firstCard = cards.nth(0);
      await expect(firstCard.locator('.card-value').nth(0)).toContainText('Ballet Infantil');
      await expect(firstCard.locator('.card-value').nth(1)).toContainText('Ana Silva');
      await expect(firstCard.locator('.card-value').nth(2)).toContainText('20');
      await expect(firstCard.locator('.card-value').nth(3)).toContainText('15');
      await expect(firstCard.locator('.card-value').nth(4)).toContainText('12');
    });
  });
});

test.describe('BUG-AGENDA-001 - Daily Agenda Students', () => {

  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test.beforeEach(async ({ page }) => {
      await setupAuth(page);
      await setupSessionsApi(page);
      await setupStudentsByClassGroupApi(page);
      await setupInstructorsApi(page);
      await setupClassGroupsApi(page);
      await setupAttendanceApi(page);
    });

    test('expande sessão e carrega apenas alunos da turma correta (BUG 2)', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('app-daily-agenda', { timeout: 10000 });

      const cards = page.locator('mat-card.session-card');
      await expect(cards).toHaveCount(2);

      await cards.nth(0).click(); // Ballet Infantil (cg1) - should show 2 students
      await page.waitForTimeout(500);

      const studentList = page.locator('.student-list');
      await expect(studentList).toBeVisible();

      const studentItems = studentList.locator('.student-item');
      const studentNames = await studentItems.locator('.student-name').allTextContents();
      expect(studentNames).toContain('Maria Souza');
      expect(studentNames).toContain('João Pedro');
      expect(studentNames).not.toContain('Ana Beatriz');
    });

    test('alunos de outra turma não aparecem (BUG 2)', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('app-daily-agenda', { timeout: 10000 });

      const cards = page.locator('mat-card.session-card');
      await cards.nth(1).click(); // Jazz Adulto (cg2) - should show only 1 student
      await page.waitForTimeout(500);

      const studentItems = page.locator('.student-list .student-item');
      const names = await studentItems.locator('.student-name').allTextContents();

      expect(names).toContain('Ana Beatriz');
      expect(names).not.toContain('Maria Souza');
      expect(names).not.toContain('João Pedro');
      expect(names.length).toBe(1);
    });

    test('quantidade de alunos corresponde às matrículas da turma', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('app-daily-agenda', { timeout: 10000 });

      const cards = page.locator('mat-card.session-card');
      await cards.nth(0).click();
      await page.waitForTimeout(500);

      const studentItems = page.locator('.student-list .student-item');
      await expect(studentItems).toHaveCount(2);
    });
  });
});
