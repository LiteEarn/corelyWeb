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

const MOCK_DASHBOARD = {
  summary: {
    kpis: { classesToday: 9, classesInProgress: 5, activeStudents: 76, studentsPresentToday: 23, pendingMakeups: 30, averageOccupancy: 95, todayAttendanceRate: 52 },
    averageOccupancy: 95,
    todayAttendanceRate: 52,
  },
  upcomingSessions: [],
  pendingMakeupRequests: [],
  classOccupancy: [],
  alerts: [],
};

function setupAuth(page: any) {
  return Promise.all([
    page.route('**/api/auth/me', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_USER) });
    }),
    page.route('**/api/dashboard/operational', async (route: any) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DASHBOARD) });
    }),
    page.evaluate(() => {
      localStorage.setItem('access_token', 'mock-token');
      localStorage.setItem('refresh_token', 'mock-refresh-token');
    }),
  ]);
}

test.describe('Navegação Mobile', () => {
  test.beforeEach(async ({ page }) => {
    await setupAuth(page);
  });

  test.describe('Desktop (1024px+)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('sidebar visível no desktop', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-sidebar');
      await expect(page.locator('app-sidebar')).toBeVisible();
    });

    test('sidebar não está colapsada por padrão', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.sidebar');
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-closed/);
    });

    test('botão de menu existe no desktop', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-topbar');
      const menuBtn = page.locator('app-topbar .menu-button');
      await expect(menuBtn).toBeVisible();
    });

    test('bottom nav não aparece no desktop', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('app-bottom-nav')).not.toBeVisible();
    });

    test('sidebar pode ser colapsada', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.menu-button');
      await page.locator('.menu-button').click();
      await expect(page.locator('.sidebar')).toHaveClass(/sidebar-closed/);
    });
  });

  test.describe('Tablet (768px - 1023px)', () => {
    test.use({ viewport: { width: 810, height: 1080 } });

    test('sidebar visível no tablet', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-sidebar');
      await expect(page.locator('app-sidebar')).toBeVisible();
    });

    test('sidebar recolhível no tablet', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.menu-button');
      await expect(page.locator('.sidebar')).not.toHaveClass(/sidebar-closed/);
      await page.locator('.menu-button').click();
      await expect(page.locator('.sidebar')).toHaveClass(/sidebar-closed/);
    });

    test('bottom nav não aparece no tablet', async ({ page }) => {
      await page.goto('/');
      await expect(page.locator('app-bottom-nav')).not.toBeVisible();
    });
  });

  test.describe('Mobile (< 768px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('bottom nav está visível no mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-bottom-nav');
      await expect(page.locator('app-bottom-nav')).toBeVisible();
    });

    test('bottom nav tem 5 itens', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.bottom-nav');
      const items = page.locator('.bottom-nav-item');
      await expect(items).toHaveCount(5);
    });

    test('drawer começa fechado', async ({ page }) => {
      await page.goto('/');
      const drawer = page.locator('mat-sidenav');
      const isVisible = await drawer.isVisible();
      const isAttached = await drawer.count();
      if (isAttached > 0) {
        expect(isVisible).toBe(false);
      }
    });

    test('hamburger abre drawer', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.menu-button');
      await page.locator('.menu-button').click();
      await page.waitForTimeout(350);
      const drawer = page.locator('mat-sidenav');
      await expect(drawer).toBeVisible();
    });

    test('overlay fecha drawer ao clicar', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.menu-button');
      await page.locator('.menu-button').click();
      await page.waitForTimeout(350);
      const backdrop = page.locator('.mat-drawer-backdrop');
      await expect(backdrop).toBeVisible();
      await backdrop.click();
      await page.waitForTimeout(350);
      const drawer = page.locator('mat-sidenav');
      await expect(drawer).not.toBeVisible();
    });

    test('esc fecha drawer', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.menu-button');
      await page.locator('.menu-button').click();
      await page.waitForTimeout(350);
      await page.keyboard.press('Escape');
      await page.waitForTimeout(350);
      const drawer = page.locator('mat-sidenav');
      await expect(drawer).not.toBeVisible();
    });

    test('navegar por item do drawer fecha drawer', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.menu-button');
      await page.locator('.menu-button').click();
      await page.waitForTimeout(350);
      const navLink = page.locator('app-sidebar .nav-item').first();
      await navLink.click();
      await page.waitForTimeout(350);
      const drawer = page.locator('mat-sidenav');
      await expect(drawer).not.toBeVisible();
    });

    test('mais abre bottom sheet', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-bottom-nav');
      const maisBtn = page.locator('.bottom-nav-item').last();
      await maisBtn.click();
      await page.waitForTimeout(350);
      await expect(page.locator('.more-sheet-overlay')).toBeVisible();
      await expect(page.locator('.more-sheet-panel')).toBeVisible();
    });

    test('mais sheet fecha ao clicar item', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-bottom-nav');
      const maisBtn = page.locator('.bottom-nav-item').last();
      await maisBtn.click();
      await page.waitForTimeout(350);
      const firstItem = page.locator('.more-sheet-item').first();
      if (await firstItem.isVisible()) {
        await firstItem.click();
        await page.waitForTimeout(350);
        await expect(page.locator('.more-sheet-overlay')).not.toBeVisible();
      }
    });

    test('mais sheet fecha ao clicar fora', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('app-bottom-nav');
      const maisBtn = page.locator('.bottom-nav-item').last();
      await maisBtn.click();
      await page.waitForTimeout(350);
      await page.locator('.more-sheet-overlay').click({ position: { x: 10, y: 10 } });
      await page.waitForTimeout(350);
      await expect(page.locator('.more-sheet-overlay')).not.toBeVisible();
    });

    test('topbar altura reduzida no mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.topbar');
      const height = await page.locator('.topbar').evaluate(el => getComputedStyle(el).height);
      expect(height).toBe('56px');
    });

    test('user details oculto no mobile', async ({ page }) => {
      await page.goto('/');
      await page.waitForSelector('.topbar');
      const userDetails = page.locator('.user-details');
      await expect(userDetails).not.toBeVisible();
    });
  });

  test.describe('Responsividade em Dispositivos', () => {
    test('iPhone 14 - bottom nav presente', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/');
      await page.waitForSelector('app-bottom-nav');
      await expect(page.locator('app-bottom-nav')).toBeVisible();
      await expect(page.locator('.bottom-nav-item')).toHaveCount(5);
    });

    test('Pixel 7 - bottom nav presente', async ({ page }) => {
      await page.setViewportSize({ width: 412, height: 915 });
      await page.goto('/');
      await page.waitForSelector('app-bottom-nav');
      await expect(page.locator('app-bottom-nav')).toBeVisible();
    });

    test('iPad - sidebar presente, sem bottom nav', async ({ page }) => {
      await page.setViewportSize({ width: 810, height: 1080 });
      await page.goto('/');
      await page.waitForSelector('app-sidebar');
      await expect(page.locator('app-sidebar')).toBeVisible();
      await expect(page.locator('app-bottom-nav')).not.toBeVisible();
    });

    test('Desktop não quebra com navegação mobile', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto('/');
      await page.waitForSelector('app-sidebar');
      await expect(page.locator('app-sidebar')).toBeVisible();
      await expect(page.locator('app-topbar')).toBeVisible();
      await expect(page.locator('mat-sidenav')).toBeVisible();
    });
  });
});
