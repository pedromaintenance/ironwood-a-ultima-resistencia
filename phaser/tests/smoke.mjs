import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

await mkdir('artifacts/preview', { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
const errors = [];
page.on('pageerror', error => errors.push(error.message));

async function cell(canvas, x, y) {
  const bounds = await canvas.boundingBox();
  assert.ok(bounds);
  return { x: (x + .5) * bounds.width / 12, y: (y + .5) * bounds.height / 12 };
}

try {
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  assert.equal(await page.locator('#lobby').isVisible(), true, 'lobby should open first');
  assert.equal(await page.locator('#teamCount').innerText(), '3/3');
  await page.locator('#startCampaign').click();
  assert.equal(await page.locator('#lobby').isHidden(), true);
  assert.equal(await page.locator('#game').getAttribute('data-art'), 'original-16px-pixel-atlas');
  assert.equal(await page.locator('#game').getAttribute('data-textures'), '36');
  const canvas = page.locator('#game canvas');
  await canvas.waitFor({ state: 'visible', timeout: 15000 });
  assert.match(await page.locator('#missionTitle').innerText(), /A Trilha Fechada/);
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 1/);
  await page.screenshot({ path: 'artifacts/preview/01-battle.png', fullPage: true });

  await canvas.click({ position: await cell(canvas, 3, 10) });
  assert.match(await page.locator('#unitStats').innerText(), /PA 1\/2/);
  assert.match(await page.locator('#battleLog').innerText(), /avança pela floresta/);

  await page.locator('#endTurn').click();
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 2/);
  await page.screenshot({ path: 'artifacts/preview/02-round-2.png', fullPage: true });

  await page.locator('#restart').click();
  assert.equal(await page.locator('#lobby').isVisible(), true);
  assert.equal(await page.locator('#continueCampaign').isEnabled(), true);
  await page.locator('#startCampaign').click();
  await canvas.click({ position: await cell(canvas, 5, 10) });
  assert.match(await page.locator('#unitName').innerText(), /Arven/);
  await page.getByRole('button', { name: /Armadilha de Caça/ }).click();
  await canvas.click({ position: await cell(canvas, 5, 9) });
  assert.match(await page.locator('#battleLog').innerText(), /Armadilha de Caça/);
  await page.screenshot({ path: 'artifacts/preview/03-magic.png', fullPage: true });

  // Persistent save and resume must preserve battle state, not reset it.
  const stateBefore = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(stateBefore.ver, 1);
  assert.equal(stateBefore.board.length, 144);
  assert.ok(stateBefore.casts >= 1);
  await page.reload({ waitUntil: 'networkidle' });
  assert.equal(await page.locator('#lobby').isVisible(), true);
  await page.locator('#continueCampaign').click();
  const stateAfter = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.deepEqual(stateAfter, stateBefore);
  assert.equal(await page.locator('#lobby').isHidden(), true);
  await page.screenshot({ path: 'artifacts/preview/04-resumed.png', fullPage: true });

  // Explicit export produces valid, legacy-compatible v1 JSON.
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#exportCampaign').click();
  const download = await downloadPromise;
  assert.equal(download.suggestedFilename(), 'ironwood-phaser-campanha-v1.json');

  // Invalid save import is rejected without overwriting a working campaign.
  await page.locator('#restart').click();
  const fileInput = page.locator('#importFile');
  await fileInput.setInputFiles({ name: 'invalid.json', mimeType: 'application/json', buffer: Buffer.from('{"ver":2}') });
  await page.waitForFunction(() => document.getElementById('lobbyError')?.textContent?.includes('Invalid Ironwood v1 save'), { timeout: 12000 });
  const afterFailedImport = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.deepEqual(afterFailedImport, stateBefore);
  await page.locator('#continueCampaign').click();

  // Importing a valid exported save must actually restore the same battle.
  const exportedPath = await download.path();
  await page.locator('#restart').click();
  await page.locator('#importFile').setInputFiles(exportedPath);
  // File.text() is asynchronous; wait for the import handler to complete.
  await page.locator('#lobby').waitFor({ state: 'hidden', timeout: 15000 });
  const importedState = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.deepEqual(importedState, stateBefore);

  // Touchscreen regression: team selection, difficulty, movement and refresh.
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    screen: { width: 390, height: 844 },
    isMobile: true, hasTouch: true,
  });
  const mobile = await mobileContext.newPage();
  mobile.on('pageerror', error => errors.push('mobile: ' + error.message));
  await mobile.goto('http://127.0.0.1:4173/', { waitUntil: 'networkidle' });
  assert.equal(await mobile.locator('#lobby').isVisible(), true);
  await mobile.locator('[data-hero="guardian"]').click();
  assert.equal(await mobile.locator('#teamCount').innerText(), '2/3');
  assert.equal(await mobile.locator('#startCampaign').isDisabled(), true);
  await mobile.locator('[data-hero="cleric"]').click();
  assert.equal(await mobile.locator('#teamCount').innerText(), '3/3');
  await mobile.locator('#difficulty').selectOption('hard');
  await mobile.locator('#startCampaign').click();
  const mobileState = await mobile.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(mobileState.difficulty, 'hard');
  assert.deepEqual(mobileState.team, ['ranger','druid','cleric']);
  assert.equal(await mobile.locator('#lobby').isHidden(), true);
  const mobileCanvas = mobile.locator('#game canvas');
  await mobileCanvas.tap({ position: await cell(mobileCanvas, 3, 10) });
  assert.match(await mobile.locator('#unitStats').innerText(), /PA 1\/2/);
  await mobile.screenshot({ path: 'artifacts/preview/05-touch-mobile.png', fullPage: true });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, 'mobile should not require horizontal scrolling');
  await mobile.reload({ waitUntil: 'networkidle' });
  await mobile.locator('#continueCampaign').click();
  assert.match(await mobile.locator('#unitStats').innerText(), /PA 1\/2/);
  await mobileContext.close();

  assert.deepEqual(errors, [], 'Phaser should not throw browser errors');
  console.log('PASS: lobby, Phaser battle, movement, turn, spell, persist/reload, export and invalid import');
} finally {
  await browser.close();
}
