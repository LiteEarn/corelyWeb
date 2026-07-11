import { test, expect } from '@playwright/test';

const MOCK_USER = {
  id: '1',
  name: 'Admin Teste',
  email: 'admin@corely.com',
  role: 'ADMIN',
  studio: { id: 's1', name: 'Studio Teste' },
  permissions: [
    'DASHBOARD_VIEW', 'SESSION_READ', 'SESSION_WRITE',
  ],
};

const MOCK_SESSIONS = [
  {
    id: 's1',
    studioId: 's1',
    instructorId: 'i1',
    title: 'Ballet Infantil',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '09:00',
    maxStudents: 20,
    status: 'SCHEDULED',
  },
  {
    id: 's2',
    studioId: 's1',
    instructorId: 'i2',
    title: 'Pilates Avançado',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '09:00',
    endTime: '10:00',
    maxStudents: 15,
    status: 'IN_PROGRESS',
  },
  {
    id: 's3',
    studioId: 's1',
    instructorId: 'i1',
    title: 'Alongamento',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '10:00',
    endTime: '11:00',
    maxStudents: 10,
    status: 'COMPLETED',
  },
  {
    id: 's4',
    studioId: 's1',
    instructorId: 'i3',
    title: 'Gestantes',
    scheduledDate: new Date().toISOString().split('T')[0],
    startTime: '14:00',
    endTime: '15:00',
    maxStudents: 6,
    status: 'CANCELLED',
  },
];

const MOCK_ENROLLMENTS = [
  { studentId: 'st-1', studentName: 'Maria Souza', studentPhone: '11988888888', status: 'ACTIVE' },
  { studentId: 'st-2', studentName: 'João Pedro', studentPhone: '11977777777', status: 'ACTIVE' },
  { studentId: 'st-3', studentName: 'Ana Beatriz', status: 'ACTIVE' },
];

async function setupAuth(page: any) {
  await page.route('**/api/auth/me', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
  });
  await page.evaluate(() => {
    localStorage.setItem('access_token', 'mock-token');
    localStorage.setItem('refresh_token', 'mock-refresh-token');
  });
}

async function setupSessionsApi(page: any) {
  await page.route('**/api/class-sessions*', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) });
  });
}

async function setupEnrollmentsApi(page: any) {
  await page.route('**/api/enrollments/class-groups/**', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_ENROLLMENTS) });
  });
}

async function setupAttendanceApi(page: any) {
  await page.route('**/api/class-sessions/*/attendance', async (route: any) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
  });
}

test.describe('Daily Agenda', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
    await setupSessionsApi(page);
  });

  test.describe('Desktop', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('renders page header', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('ds-page-header');
      await expect(page.locator('ds-page-header')).toBeVisible();
    });

    test('renders all session cards', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');
      const cards = page.locator('.session-card');
      await expect(cards).toHaveCount(4);
    });

    test('shows session count', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-count');
      await expect(page.locator('.session-count')).toContainText('4 aulas');
    });

    test('shows session titles', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');
      await expect(page.locator('.session-card').first()).toContainText('Ballet Infantil');
    });

    test('shows status chips for each session', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('ds-status-chip');
      const chips = page.locator('ds-status-chip');
      await expect(chips).toHaveCount(4);
      await expect(chips.nth(0)).toContainText('Agendada');
      await expect(chips.nth(1)).toContainText('Em andamento');
      await expect(chips.nth(2)).toContainText('Concluída');
      await expect(chips.nth(3)).toContainText('Cancelada');
    });

    test('shows time range on each card', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.time-value');
      const times = page.locator('.time-value');
      await expect(times.nth(0)).toContainText('08:00 - 09:00');
      await expect(times.nth(1)).toContainText('09:00 - 10:00');
    });

    test('shows today badge', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.today-badge');
      await expect(page.locator('.today-badge')).toBeVisible();
    });

    test('opens accordion and loads students', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.students-table');
      await expect(page.locator('.students-table')).toBeVisible();
    });

    test('shows student names in the table', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.student-name-cell');
      const names = page.locator('.student-name-cell');
      await expect(names).toHaveCount(3);
      await expect(names.nth(0)).toContainText('Maria Souza');
      await expect(names.nth(1)).toContainText('João Pedro');
      await expect(names.nth(2)).toContainText('Ana Beatriz');
    });

    test('shows student phones in the table', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.student-phone-cell');
      const phones = page.locator('.student-phone-cell');
      await expect(phones.nth(0)).toContainText('11988888888');
      await expect(phones.nth(1)).toContainText('11977777777');
      await expect(phones.nth(2)).toContainText('-');
    });

    test('shows attendance controls', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.attendance-controls');
      const controls = page.locator('.attendance-controls');
      await expect(controls).toHaveCount(3);
    });

    test('clicking attendance button changes status', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.att-btn');
      await page.locator('.att-btn').first().click();
      await expect(page.locator('.att-btn').first()).toHaveClass(/att-btn-active/);
    });

    test('shows save button when attendance changes', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.att-btn');
      await page.locator('.att-btn').first().click();
      await expect(page.locator('.save-attendance-btn')).toBeVisible();
    });

    test('saves attendance and shows success', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await page.route('**/api/class-sessions/*/attendance', async (route: any) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        } else if (route.request().method() === 'PUT') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
            { enrollmentId: 'enr-1', status: 'PRESENT', studentName: 'Maria Souza' },
            { enrollmentId: 'enr-2', status: 'PRESENT', studentName: 'João Pedro' },
            { enrollmentId: 'enr-3', status: 'PRESENT', studentName: 'Ana Beatriz' },
          ]) });
        }
      });
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.att-btn');
      await page.locator('.att-btn').first().click();
      await page.locator('.save-attendance-btn').click();
      await expect(page.locator('.mat-mdc-snack-bar-container')).toBeVisible();
    });

    test('recarregar mantém estado da presença', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await page.route('**/api/class-sessions/*/attendance', async (route: any) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([
            { enrollmentId: 'enr-1', status: 'PRESENT', studentName: 'Maria Souza' },
          ]) });
        }
      });
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');
      await page.locator('.session-card').first().click();
      await page.waitForSelector('.att-btn');
      const presentBtns = page.locator('.att-present');
      await expect(presentBtns).toHaveCount(1);
    });
  });

  test.describe('Empty state', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('shows empty state when no sessions', async ({ page }) => {
      await page.route('**/api/class-sessions*', async (route: any) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      });
      await page.goto('/daily-agenda');
      await page.waitForSelector('ds-empty-state');
      await expect(page.locator('ds-empty-state')).toContainText('Nenhuma aula encontrada');
    });

    test('shows empty state when no students in session', async ({ page }) => {
      await page.route('**/api/enrollments/class-groups/**', async (route: any) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      });
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.no-students');
      await expect(page.locator('.no-students')).toContainText('Nenhum aluno matriculado');
    });
  });

  test.describe('Error state', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('shows error state on API failure', async ({ page }) => {
      await page.route('**/api/class-sessions*', async (route: any) => {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Erro interno' }) });
      });
      await page.goto('/daily-agenda');
      await page.waitForSelector('ds-empty-state');
      const emptyState = page.locator('ds-empty-state');
      await expect(emptyState).toContainText('Erro ao carregar');
    });

    test('retries loading on retry button click', async ({ page }) => {
      await page.route('**/api/class-sessions*', async (route: any) => {
        await route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ message: 'Erro interno' }) });
      });
      await page.goto('/daily-agenda');
      await page.waitForSelector('ds-empty-state');

      await page.route('**/api/class-sessions*', async (route: any) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) });
      });
      await page.locator('ds-empty-state ds-button').click();
      await page.waitForSelector('.session-card');
      await expect(page.locator('.session-card')).toHaveCount(4);
    });
  });

  test.describe('Loading state', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('shows loading indicator', async ({ page }) => {
      await page.route('**/api/class-sessions*', async (route: any) => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) });
      });
      await page.goto('/daily-agenda');
      await page.waitForSelector('app-loading');
      await expect(page.locator('app-loading')).toBeVisible();
    });
  });

  test.describe('Tablet', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('renders header and cards on tablet', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');
      const cards = page.locator('.session-card');
      await expect(cards).toHaveCount(4);
    });

    test('shows student table on tablet', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.students-table');
      await expect(page.locator('.students-table')).toBeVisible();
    });
  });

  test.describe('Auto-refresh', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('refresh triggers after session start', async ({ page }) => {
      let sessionGetCount = 0;
      await page.route('**/api/class-sessions*', async (route: any) => {
        if (route.request().method() === 'GET') {
          sessionGetCount++;
        }
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_SESSIONS) });
      });
      await page.route('**/api/class-sessions/*/start', async (route: any) => {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ...MOCK_SESSIONS[0], status: 'IN_PROGRESS' }) });
      });

      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');
      const initialCount = sessionGetCount;

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.session-action-btn');

      // Call forceRefresh via page.evaluate
      await page.evaluate(() => {
        const el = document.querySelector('app-daily-agenda');
        if (el) {
          (el as any).forceRefresh();
        }
      });

      await page.waitForTimeout(500);
      expect(sessionGetCount).toBeGreaterThan(initialCount);
    });

    test('preserves expanded card after refresh', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      // Expand first card
      await page.locator('.session-card').first().click();
      await page.waitForSelector('.students-table');
      await expect(page.locator('.students-table')).toBeVisible();

      // Trigger refresh
      await page.evaluate(() => {
        const el = document.querySelector('app-daily-agenda');
        if (el) {
          (el as any).forceRefresh();
        }
      });

      await page.waitForTimeout(500);
      await expect(page.locator('.students-table')).toBeVisible();
    });

    test('shows pending changes warning when unsaved attendance exists', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      // Expand and change attendance
      await page.locator('.session-card').first().click();
      await page.waitForSelector('.att-btn');
      await page.locator('.att-btn').first().click();

      // Trigger refresh to show warning
      await page.evaluate(() => {
        const el = document.querySelector('app-daily-agenda');
        if (el) {
          (el as any).forceRefresh();
        }
      });

      await page.waitForTimeout(300);
      const warningBar = page.locator('.pending-changes-bar');
      await expect(warningBar).toBeVisible();
      await expect(warningBar).toContainText('Existem alterações pendentes');
    });

    test('desktop retains scroll position after refresh', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      // Scroll down
      await page.evaluate(() => window.scrollTo(0, 200));
      const scrollBefore = await page.evaluate(() => window.scrollY);
      expect(scrollBefore).toBe(200);

      await page.evaluate(() => {
        const el = document.querySelector('app-daily-agenda');
        if (el) {
          (el as any).forceRefresh();
        }
      });

      await page.waitForTimeout(500);
      const scrollAfter = await page.evaluate(() => window.scrollY);
      expect(scrollAfter).toBe(200);
    });
  });

  test.describe('Mobile', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('renders content on mobile', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');
      const cards = page.locator('.session-card');
      await expect(cards).toHaveCount(4);
    });

    test('no horizontal scroll on mobile', async ({ page }) => {
      await page.goto('/daily-agenda');
      await page.waitForSelector('.daily-agenda-page');
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });

    test('shows student cards on mobile instead of table', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.student-mobile-card');
      await expect(page.locator('.student-mobile-card')).toHaveCount(3);
    });

    test('mobile shows attendance controls in cards', async ({ page }) => {
      await setupEnrollmentsApi(page);
      await setupAttendanceApi(page);
      await page.goto('/daily-agenda');
      await page.waitForSelector('.session-card');

      await page.locator('.session-card').first().click();
      await page.waitForSelector('.mobile-att-controls');
      const controls = page.locator('.mobile-att-controls');
      await expect(controls).toHaveCount(3);
    });
  });
});
