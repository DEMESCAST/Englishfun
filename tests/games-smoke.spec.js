// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:8787';

test.describe('Novos Jogos - Smoke Test', () => {
  for (const g of [
    { key: 'spell', start: 'startSpellWithCategory', assert: '#spell-chars .mg-key', act: 'clickFirstKey' },
    { key: 'oddoneout', start: 'startOddOneOutWithCategory', assert: '#oo-options .mg-opt', act: 'clickFirstOption' },
    { key: 'bingo', start: 'startBingoWithCategory', assert: '#bingo-grid .bingo-cell', act: 'clickSkip' },
    { key: 'tictactoe', start: 'startTicTacToeWithCategory', assert: '#ttt-options .mg-opt', act: 'clickFirstOption' },
    { key: 'listening', start: 'startListeningWithCategory', assert: '#ls-options .mg-opt', act: 'clickFirstOption' },
    { key: 'sentence', start: 'startSentenceWithCategory', assert: '#sb-chips .mg-chip', act: 'buildSentence' },
    { key: 'grammar', start: 'startGrammarWithCategory', assert: '#gr-options .mg-opt', act: 'clickFirstOption' },
    { key: 'synonyms', start: 'startSynonymsWithCategory', assert: '#sy-options .mg-opt', act: 'clickFirstOption' },
    { key: 'wordladder', start: 'startWordLadderWithCategory', assert: '#wl-current', act: 'ladder' },
    { key: 'mistake', start: 'startMistakeWithCategory', assert: '#mk-sentence .mk-token', act: 'clickFirstOption' },
    { key: 'phrasal', start: 'startPhrasalWithCategory', assert: '#ph-options .mg-opt', act: 'clickFirstOption' },
  ]) {
    test(`${g.key} renderiza e responde a interações`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', e => errors.push('pageerror: ' + e.message));
      page.on('console', m => {
        if (m.type() === 'error') errors.push('console: ' + m.text());
      });

      await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(500);

      const started = await page.evaluate(({ start }) => {
        if (typeof window[start] !== 'function') return false;
        window[start]('animals');
        return true;
      }, { start: g.start });
      expect(started).toBe(true);

      const sel = g.assert;
      await expect(page.locator(sel).first()).toBeVisible();
      const count = await page.locator(sel).count();
      expect(count).toBeGreaterThan(0);

      switch (g.act) {
        case 'clickFirstKey':
          for (let i = 0; i < 3; i++) {
            await page.locator('#spell-chars .mg-key').first().click();
          }
          break;
        case 'clickFirstOption':
          await page.locator(g.assert).first().click();
          break;
        case 'clickSkip':
          await page.locator('#bingo-skip').click();
          break;
        case 'buildSentence': {
          const chips = page.locator('#sb-chips .mg-chip');
          const n = await chips.count();
          if (n > 0) {
            await chips.nth(0).click();
            const chips2 = page.locator('#sb-chips .mg-chip');
            if (await chips2.count() > 0) await chips2.nth(0).click();
          }
          break;
        }
        case 'ladder': {
          const current = await page.locator('#wl-current').textContent();
          const letters = current.toLowerCase().split('');
          if (letters.length) {
            letters[letters.length - 1] = letters[letters.length - 1] === 'a' ? 'b' : 'a';
            await page.fill('#wl-input', letters.join(''));
          }
          await page.locator('#wl-go').click();
          await expect(page.locator('#wl-steps')).toContainText('Passos: 1');
          break;
        }
      }

      await page.waitForTimeout(1600);

      const siteErrors = errors.filter(e =>
        !e.includes('extension') && !e.includes('gestures') && !e.includes('SpeechSynthesis') && !e.includes('Autoplay') && !e.includes('audio')
      );
      expect(siteErrors).toEqual([]);
    });
  }

  test('todos os botões existem na grade de jogos', async ({ page }) => {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);
    const buttons = await page.evaluate(() => {
      if (typeof openGames !== 'function') return -1;
      openGames();
      return document.querySelectorAll('#games-screen .game-btn').length;
    });
    expect(buttons).toBe(16);
  });
});