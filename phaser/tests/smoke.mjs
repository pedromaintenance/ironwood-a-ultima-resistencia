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
  assert.match(await page.locator('.mast').innerText(), /BETA M3f/);
  assert.equal(await page.locator('.playtestGuide summary').isVisible(), true);
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
  const initialOverlayDraws = Number(await page.locator('#game').getAttribute('data-overlay-draws'));
  const initialLogBuilds = Number(await page.locator('#battleLog').getAttribute('data-builds'));
  assert.ok(initialOverlayDraws >= 1);
  assert.ok(initialLogBuilds >= 1);
  const hudBuildsAtStart = Number(await page.locator('#skills').getAttribute('data-builds'));
  assert.equal(hudBuildsAtStart, 1, 'initial ability panel is allocated just once');
  const originalSave = await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1'));
  await canvas.click({ position: await cell(canvas, 11, 11) });
  assert.match(await page.locator('#actionFeedback').innerText(), /Movimento indisponível/);
  assert.equal(await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1')), originalSave,
    'illegal movement does not overwrite the save');
  assert.equal(Number(await page.locator('#skills').getAttribute('data-builds')), hudBuildsAtStart,
    'invalid commands do not rebuild the skill list');
  assert.equal(Number(await page.locator('#game').getAttribute('data-overlay-draws')), initialOverlayDraws,
    'failed movement does not redraw a single overlay');
  assert.equal(Number(await page.locator('#battleLog').getAttribute('data-builds')), initialLogBuilds,
    'failed movement does not recreate the log');

  // Inspection must not move actors, spend AP, advance RNG or overwrite saves.
  assert.equal(await page.locator('#game').getAttribute('data-unit-objects'), '7');
  const initialAllocations = Number(await page.locator('#game').getAttribute('data-unit-allocations'));
  assert.equal(initialAllocations, 7, 'first mission creates exactly 3 allies and 4 enemies');
  assert.match(await page.locator('#renderStats').textContent(), /7 personagens visíveis · 7 contêineres/);
    assert.equal(await page.locator('#game').getAttribute('data-terrain-objects'), '144');
  const tilesBefore = Number(await page.locator('#game').getAttribute('data-terrain-updates'));
  const saveBeforeInspect = await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1'));
  await page.locator('#inspectMode').click();
  assert.equal(await page.locator('#inspectMode').getAttribute('aria-pressed'), 'true');
  await canvas.click({ position: await cell(canvas, 2, 10) });
  assert.match(await page.locator('#tileInfo').innerText(), /Morna/);
  assert.equal(await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1')), saveBeforeInspect);
  await page.locator('#inspectMode').click();
  assert.equal(await page.locator('#inspectMode').getAttribute('aria-pressed'), 'false');
  assert.equal(Number(await page.locator('#game').getAttribute('data-terrain-updates')), tilesBefore);
  assert.equal(Number(await page.locator('#game').getAttribute('data-unit-allocations')), initialAllocations,
    'inspect mode must not allocate replacement sprites');
  assert.equal(Number(await page.locator('#skills').getAttribute('data-builds')), hudBuildsAtStart,
    'inspection does not rebuild HUD ability controls');
  assert.equal(Number(await page.locator('#game').getAttribute('data-overlay-draws')), initialOverlayDraws,
    'inspection does not recompute the graphics overlay');
  assert.equal(Number(await page.locator('#battleLog').getAttribute('data-builds')), initialLogBuilds,
    'inspection does not reconstruct log DOM');

  // Rapid input during a 300ms movement tween must never spend extra AP.
  const boardBounds = await canvas.boundingBox();
  const firstCell = await cell(canvas, 3, 10), blockedCell = await cell(canvas, 4, 10);
  await page.mouse.click(boardBounds.x + firstCell.x, boardBounds.y + firstCell.y);
  assert.equal(await page.locator('#game').getAttribute('data-input-locked'), 'true',
    'critical movement tween fences commands immediately');
  assert.equal(await page.locator('#endTurn').isDisabled(), true);
  assert.match(await page.locator('#commandStatus').innerText(), /ANIMANDO/);
  const saveDuringMove = await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1'));
  await page.mouse.click(boardBounds.x + blockedCell.x, boardBounds.y + blockedCell.y);
  assert.equal(await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1')), saveDuringMove,
    'rapid second movement must not alter save or core state');
  assert.ok(Number(await page.locator('#game').getAttribute('data-ignored-commands')) >= 1,
    'ignored gameplay inputs are tracked visibly');
  assert.equal(await page.locator('#game').getAttribute('data-terrain-objects'), '144');
  assert.equal(Number(await page.locator('#game').getAttribute('data-terrain-updates')), tilesBefore);
  assert.match(await page.locator('#unitStats').innerText(), /PA 1\/2/);
  assert.match(await page.locator('#battleLog').innerText(), /avança pela floresta/);
  assert.ok(Number(await page.locator('#game').getAttribute('data-overlay-draws')) > initialOverlayDraws,
    'a real movement invalidates overlays');
  assert.ok(Number(await page.locator('#battleLog').getAttribute('data-builds')) > initialLogBuilds,
    'a new combat event updates the log');
  assert.equal(Number(await page.locator('#game').getAttribute('data-unit-allocations')), initialAllocations,
    'moving existing actors must reuse the same sprite containers');
  // Rerender for another selected ally also must keep exactly the same objects.
  await canvas.click({ position: await cell(canvas, 5, 10) });
  assert.equal(Number(await page.locator('#game').getAttribute('data-unit-allocations')), initialAllocations);
  assert.equal(await page.locator('#game').getAttribute('data-unit-objects'), '7');

  // Playwright waits for the disabled end-turn button to become enabled again.
  await page.locator('#endTurn').click();
  assert.match(await page.locator('#phaseStatus').innerText(), /Rodada 2/);
  assert.ok(Number(await page.locator('#game').getAttribute('data-unit-allocations')) >= initialAllocations,
    'new spawned enemies may allocate sprites, existing sprites stay pooled');
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
  await mobile.locator('#inspectMode').click();
  await mobileCanvas.tap({ position: await cell(mobileCanvas, 2, 10) });
  assert.match(await mobile.locator('#tileInfo').innerText(), /Arven/);
  await mobile.locator('#inspectMode').click();
  await mobileCanvas.tap({ position: await cell(mobileCanvas, 3, 10) });
  assert.match(await mobile.locator('#unitStats').innerText(), /PA 1\/2/);
  await mobile.screenshot({ path: 'artifacts/preview/05-touch-mobile.png', fullPage: true });
  const overflow = await mobile.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, 'mobile should not require horizontal scrolling');
  await mobile.reload({ waitUntil: 'networkidle' });
  await mobile.locator('#continueCampaign').click();
  assert.match(await mobile.locator('#unitStats').innerText(), /PA 1\/2/);
  await mobileContext.close();

  // New M3b spell-aiming: a dangerous AOE requires a deliberate second tap.
  await page.locator('#restart').click();
  await page.locator('[data-hero="druid"]').click();
  await page.locator('[data-hero="mage"]').click();
  await page.locator('#startCampaign').click();
  // The headless roster places allies at x=2,5,9 (not x=8).
  await canvas.click({ position: await cell(canvas, 9, 10) });
  assert.match(await page.locator('#unitName').innerText(), /Vaelis/);
  const fireballButton = page.getByRole('button', { name: /Bola de Fogo/ });
  await fireballButton.click();
  assert.equal(await fireballButton.evaluate(el => el === document.activeElement), true,
    'clicking an ability preserves its keyboard focus when HUD updates');
  const mageHudBuilds = Number(await page.locator('#skills').getAttribute('data-builds'));
  const invalidSpellSave = await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1'));
  await canvas.click({ position: await cell(canvas, 0, 0) });
  assert.match(await page.locator('#actionFeedback').innerText(), /Alvo inválido/);
  assert.equal(await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1')), invalidSpellSave,
    'out-of-range spell does not modify the saved state');
  assert.equal(Number(await page.locator('#skills').getAttribute('data-builds')), mageHudBuilds,
    'invalid spell does not rebuild ability buttons');
  await canvas.hover({ position: await cell(canvas, 9, 9) });
  assert.match(await page.locator('#impactInfo').innerText(), /Área inicial: 25 casa/);
  assert.equal(await page.locator('#game').getAttribute('data-impact-tiles'), '25');
  assert.match(await page.locator('#impactInfo').innerText(), /ALERTA.*aliado/);
  const aimSave = await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1'));
  await canvas.click({ position: await cell(canvas, 9, 9) });
  assert.match(await page.locator('#impactInfo').innerText(), /TOQUE NOVAMENTE/);
  assert.equal(await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1')), aimSave);
  await page.screenshot({ path: 'artifacts/preview/06-fireball-aim.png', fullPage: true });
  await canvas.click({ position: await cell(canvas, 9, 9) });
  const fired = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(fired.casts, 1);
  assert.match(await page.locator('#battleLog').innerText(), /Bola de Fogo/);

  assert.deepEqual(errors, [], 'Phaser should not throw browser errors');
  console.log('PASS: core parity, M3f overlay/log cache, HUD, tween lock, pooled units, AOE, mobile');
} finally {
  await browser.close();
}
