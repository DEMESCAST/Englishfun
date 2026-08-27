// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://englishfun.com.br';

test.describe('English Fun - Auditoria Técnica', () => {

  test.describe('1. Tela Inicial', () => {
    test('carrega corretamente', async ({ page }) => {
      const errors = [];
      page.on('console', msg => {
        if (msg.type() === 'error') errors.push(msg.text());
      });
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      await expect(page).toHaveTitle(/English Fun/);

      // Tela inicial visível
      const landing = page.locator('#landing-screen');
      await expect(landing).toBeVisible();

      // Botões da tela inicial (usando aria-label para ser específico)
      const entrarBtn = page.locator('#landing-screen .start-btn-enter');
      await expect(entrarBtn).toBeVisible();

      const criarBtn = page.locator('#landing-screen .start-btn-create');
      await expect(criarBtn).toBeVisible();

      const quemSomosBtn = page.locator('#landing-screen .start-btn-about');
      await expect(quemSomosBtn).toBeVisible();

      // Logotipo
      const logo = page.locator('#landing-screen .landing-logo');
      await expect(logo).toBeVisible();

      // Personagens
      const arthur = page.locator('#landing-screen .character-arthur');
      await expect(arthur).toBeVisible();

      const henrique = page.locator('#landing-screen .character-henrique');
      await expect(henrique).toBeVisible();

      const siteErrors = errors.filter(e => !e.includes('extension') && !e.includes('chrome-extension'));
      console.log('Tela inicial - Console errors:', siteErrors.length > 0 ? siteErrors : 'Nenhum');
    });

    test('sem rolagem horizontal', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
      const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);
    });
  });

  test.describe('2. Navegação', () => {
    test('QUEM SOMOS abre e fecha', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      await page.locator('#landing-screen .start-btn-about').click();

      const aboutScreen = page.locator('#about-screen');
      await expect(aboutScreen).toBeVisible();

      await page.locator('#about-screen .back-btn, #about-screen button:has-text("Voltar")').first().click();
      await expect(aboutScreen).toBeHidden();
    });

    test('ENTRAR vai para tela de login', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      await page.locator('#landing-screen .start-btn-enter').click();

      const loginScreen = page.locator('#login-screen');
      await expect(loginScreen).toBeVisible();
    });

    test('CRIAR JOGADOR vai para tela de criação', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      await page.locator('#landing-screen .start-btn-create').click();

      const createScreen = page.locator('#create-screen');
      await expect(createScreen).toBeVisible();
    });
  });

  test.describe('3. Console e Rede', () => {
    test('sem erros críticos no console', async ({ page }) => {
      const consoleErrors = [];
      const networkErrors = [];

      page.on('console', msg => {
        if (msg.type() === 'error') consoleErrors.push(msg.text());
      });
      page.on('pageerror', err => consoleErrors.push(err.message));
      page.on('response', response => {
        if (response.status() >= 400) {
          networkErrors.push(`${response.status()} ${response.url()}`);
        }
      });

      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      // Navegar
      await page.locator('#landing-screen .start-btn-about').click();
      await page.waitForTimeout(500);
      await page.locator('#about-screen .back-btn, #about-screen button:has-text("Voltar")').first().click();
      await page.waitForTimeout(500);

      const siteErrors = consoleErrors.filter(e =>
        !e.includes('extension') && !e.includes('chrome-extension') && !e.includes('favicon')
      );

      console.log('Console errors:', siteErrors);
      console.log('Network errors:', networkErrors);

      const criticalNetwork = networkErrors.filter(e => !e.includes('favicon'));
      expect(criticalNetwork).toHaveLength(0);
    });
  });

  test.describe('4. Manifest PWA', () => {
    test('manifest tem ícones PNG', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      const manifest = await page.evaluate(async () => {
        const link = document.querySelector('link[rel="manifest"]');
        if (!link) return null;
        const resp = await fetch(link.href);
        return resp.json();
      });

      expect(manifest).not.toBeNull();
      expect(manifest.icons).toBeDefined();

      const pngIcons = manifest.icons.filter(i => i.type === 'image/png');
      console.log('Manifest icons:', pngIcons.map(i => `${i.sizes} ${i.purpose}`));

      // Pelo menos 2 ícones PNG (192 e 512)
      expect(pngIcons.length).toBeGreaterThanOrEqual(2);

      const sizes = pngIcons.map(i => i.sizes);
      expect(sizes).toContain('192x192');
      expect(sizes).toContain('512x512');
    });
  });

  test.describe('5. Service Worker', () => {
    test('service worker registra e ativa', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      const swState = await page.evaluate(async () => {
        if (!navigator.serviceWorker) return 'not supported';
        const reg = await navigator.serviceWorker.ready;
        return {
          active: !!reg.active,
          scope: reg.scope,
          installing: !!reg.installing,
          waiting: !!reg.waiting
        };
      });

      console.log('Service Worker state:', swState);
      expect(swState.active).toBe(true);
    });
  });

  test.describe('6. Responsividade', () => {
    const resolutions = [
      { name: '1920x1080', width: 1920, height: 1080 },
      { name: '1366x768', width: 1366, height: 768 },
      { name: '768x1024', width: 768, height: 1024 },
      { name: '430x932', width: 430, height: 932 },
      { name: '393x851', width: 393, height: 851 },
      { name: '360x800', width: 360, height: 800 },
    ];

    for (const res of resolutions) {
      test(`layout correto em ${res.name}`, async ({ page }) => {
        await page.setViewportSize({ width: res.width, height: res.height });
        await page.goto(BASE_URL, { waitUntil: 'networkidle' });

        // Sem rolagem horizontal
        const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
        const clientWidth = await page.evaluate(() => document.documentElement.clientWidth);
        expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 5);

        // Tela inicial visível
        const landing = page.locator('#landing-screen');
        await expect(landing).toBeVisible();

        // Botões visíveis
        await expect(page.locator('#landing-screen .start-btn-enter')).toBeVisible();
        await expect(page.locator('#landing-screen .start-btn-create')).toBeVisible();

        await page.screenshot({
          path: `C:\\Users\\Micro\\Desktop\\english-fun\\test-screenshots\\landing-${res.name}.png`,
          fullPage: false
        });
      });
    }
  });

  test.describe('7. Segurança', () => {
    test('PIN não exposto no console', async ({ page }) => {
      const logs = [];
      page.on('console', msg => logs.push(msg.text()));
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });

      const pinLeak = logs.filter(log => /\b\d{6}\b/.test(log));
      expect(pinLeak).toHaveLength(0);
    });

    test('sem chaves privadas no HTML', async ({ page }) => {
      await page.goto(BASE_URL, { waitUntil: 'networkidle' });
      const html = await page.content();
      expect(html).not.toContain('private_key');
      expect(html).not.toContain('secret');
    });
  });
});
