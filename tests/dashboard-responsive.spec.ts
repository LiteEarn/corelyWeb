import { test, expect } from '@playwright/test';

const MOCK_DASHBOARD = {
  summary: {
    kpis: { classesToday: 9, classesInProgress: 5, activeStudents: 76, studentsPresentToday: 23, pendingMakeups: 30 },
    averageOccupancy: 95,
    todayAttendanceRate: 52,
  },
  upcomingSessions: [
    { id: 's1', classGroupId: 'cg-1', className: 'Alongamento', instructorId: 'i1', instructorName: 'Ricardo Souza', startTime: '08:00:00', endTime: '09:00:00', enrolledStudents: 10, status: 'IN_PROGRESS' },
    { id: 's2', classGroupId: 'cg-2', className: 'Pilates Avancado', instructorId: 'i2', instructorName: 'Fernanda Lima', startTime: '08:00:00', endTime: '09:00:00', enrolledStudents: 3, status: 'IN_PROGRESS' },
  ],
  pendingMakeupRequests: [
    { id: 'm1', classGroupId: 'cg-3', studentName: 'Monica Santos Almeida', className: 'Gestantes', absenceDate: '2026-06-26', reason: 'Imprevisto pessoal' },
  ],
  classOccupancy: [
    { classGroupId: 'cg-1', className: 'Alongamento', capacity: 10, enrolled: 10, occupancyPercent: 100 },
    { classGroupId: 'cg-2', className: 'Gestantes', capacity: 6, enrolled: 6, occupancyPercent: 100 },
  ],
  alerts: [
    { title: 'Turma Lotada', message: "Turma 'Alongamento' está com 100% de ocupação", severity: 'ERROR', type: 'FULL_CLASS', actionLabel: 'Ver turma', actionRoute: '/class-groups', actionId: 'cg-1' },
    { title: 'Muitas Reposições', message: '30 reposições pendentes aguardando aprovação', severity: 'WARNING', type: 'PENDING_MAKEUP', actionLabel: 'Ver reposições', actionRoute: '/makeup-requests', actionId: null },
  ],
};

test.describe('Dashboard Responsivo', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/dashboard/operational', async route => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(MOCK_DASHBOARD) });
    });
    await page.goto('/dashboard');
  });

  test.describe('Desktop (> 960px)', () => {
    test.use({ viewport: { width: 1280, height: 800 } });

    test('Dashboard abre corretamente', async ({ page }) => {
      await expect(page.locator('app-dashboard')).toBeVisible();
      await expect(page.locator('ds-page-header')).toBeVisible();
    });

    test('KPIs carregam em linha com 7 cards', async ({ page }) => {
      await page.waitForSelector('app-stat-card', { timeout: 10000 });
      const kpis = page.locator('.desktop-kpi-row app-stat-card');
      await expect(kpis).toHaveCount(7);
    });

    test('Alertas aparecem no painel lateral', async ({ page }) => {
      await page.waitForSelector('.desktop-alerts-sidebar', { timeout: 10000 });
      await expect(page.locator('.desktop-alerts-sidebar')).toBeVisible();
    });

    test('Próximas aulas carregam em tabela', async ({ page }) => {
      await page.waitForSelector('.desktop-sessions-table', { timeout: 10000 });
      await expect(page.locator('.desktop-sessions-table')).toBeVisible();
    });

    test('Ações rápidas estão visíveis', async ({ page }) => {
      await page.waitForSelector('app-quick-actions', { timeout: 10000 });
      await expect(page.locator('app-quick-actions')).toBeVisible();
    });

    test('Nenhum scroll horizontal', async ({ page }) => {
      await page.waitForSelector('.dashboard-content', { timeout: 10000 });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });

  test.describe('Tablet (600px - 959px)', () => {
    test.use({ viewport: { width: 768, height: 1024 } });

    test('Layout reorganizado para tablet', async ({ page }) => {
      await page.waitForSelector('.layout-tablet', { timeout: 10000 });
      await expect(page.locator('.layout-tablet')).toBeVisible();
      await expect(page.locator('.layout-desktop')).not.toBeVisible();
    });

    test('KPIs em grid 4 colunas', async ({ page }) => {
      await page.waitForSelector('.tablet-kpi-grid', { timeout: 10000 });
      const kpis = page.locator('.tablet-kpi-grid app-stat-card');
      const count = await kpis.count();
      expect(count).toBeGreaterThanOrEqual(4);
    });

    test('Nenhum overflow no tablet', async ({ page }) => {
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      const overflowX = await page.evaluate(() => {
        const el = document.querySelector('.dashboard-container');
        if (!el) return 'visible';
        return window.getComputedStyle(el).overflowX;
      });
      expect(overflowX).not.toBe('scroll');
    });

    test('Nenhum scroll horizontal', async ({ page }) => {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });

  test.describe('Mobile (< 600px)', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test('Layout mobile ativo', async ({ page }) => {
      await page.waitForSelector('.layout-mobile', { timeout: 10000 });
      await expect(page.locator('.layout-mobile')).toBeVisible();
    });

    test('KPIs em carrossel', async ({ page }) => {
      await page.waitForSelector('app-dashboard-kpi-carousel', { timeout: 10000 });
      await expect(page.locator('app-dashboard-kpi-carousel')).toBeVisible();
    });

    test('Timeline funcionando', async ({ page }) => {
      await page.waitForSelector('app-dashboard-timeline', { timeout: 10000 });
      const timeline = page.locator('app-dashboard-timeline');
      if (await timeline.isVisible()) {
        await expect(timeline.locator('.timeline-item').first()).toBeVisible();
      }
    });

    test('Cards de ocupação renderizados', async ({ page }) => {
      await page.waitForSelector('app-dashboard-occupancy-card', { timeout: 10000 });
      const occupancy = page.locator('app-dashboard-occupancy-card');
      if (await occupancy.isVisible()) {
        await expect(occupancy.locator('.occupancy-item').first()).toBeVisible();
      }
    });

    test('Ações rápidas em grid 2x2', async ({ page }) => {
      await page.waitForSelector('app-quick-actions', { timeout: 10000 });
      const grid = page.locator('.quick-actions-grid');
      const isVisible = await grid.isVisible();
      if (isVisible) {
        const buttons = grid.locator('.quick-action-btn');
        await expect(buttons).toHaveCount(4);
      }
    });

    test('Drawer não sobrepõe conteúdo', async ({ page }) => {
      const drawer = page.locator('mat-sidenav');
      if (await drawer.isVisible()) {
        const drawerRect = await drawer.boundingBox();
        const contentRect = await page.locator('.dashboard-container').boundingBox();
        if (drawerRect && contentRect) {
          expect(drawerRect.x + drawerRect.width).toBeLessThanOrEqual(contentRect.x);
        }
      }
    });

    test('Sem scroll horizontal', async ({ page }) => {
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const viewportWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(viewportWidth + 1);
    });
  });

  test.describe('Screenshots', () => {
    test('Screenshot Desktop', async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForSelector('.dashboard-content', { timeout: 10000 });
      await page.screenshot({ path: 'tests/screenshots/dashboard-desktop.png', fullPage: true });
    });

    test('Screenshot Tablet', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      await page.screenshot({ path: 'tests/screenshots/dashboard-tablet.png', fullPage: true });
    });

    test('Screenshot Mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.waitForSelector('.dashboard-container', { timeout: 10000 });
      await page.screenshot({ path: 'tests/screenshots/dashboard-mobile.png', fullPage: true });
    });
  });
});
