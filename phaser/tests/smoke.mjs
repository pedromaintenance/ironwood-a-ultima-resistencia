import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import { playFreshMission } from '../../tests/playthrough-driver.mjs';
import { playSecondMission } from '../../tests/rescue-driver.mjs';
import { playThirdMission } from '../../tests/totem-driver.mjs';

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
  assert.match(await page.locator('.mast').innerText(), /BETA M4e/);
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
  await page.waitForFunction(() => {
    const sample = Number(document.querySelector('#game')?.getAttribute('data-render-fps'));
    return Number.isFinite(sample) && sample > 0 && sample < 500;
  }, null, { timeout: 15000 });
  assert.match(await page.locator('#fpsReadout').textContent(), /FPS aproximado/);
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

  // M3g full transition: an imported, valid near-victory fixture still has to
  // complete a REAL core action before the engine enters the upgrade phase.
  await page.locator('#restart').click();
  await page.locator('#startCampaign').click();
  assert.match(await page.locator('#goalName').innerText(), /Expulsar a patrulha/);
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-kind'), 'kill');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-total'), '4');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-completed'), '0');
  const fixture = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  fixture.actors.filter(a => a.side === 'enemy').forEach(a => { a.hp = 0; });
  await page.locator('#restart').click();
  await page.locator('#importFile').setInputFiles({
    name: 'near-victory-v1.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(fixture)),
  });
  await page.locator('#lobby').waitFor({ state: 'hidden', timeout: 15000 });
  const beforeFinish = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(beforeFinish.phase, 'player', 'import alone does not award victory');
  await canvas.click({ position: await cell(canvas, 3, 10) });
  await page.waitForFunction(() => document.getElementById('goalPanel')?.dataset.goalStatus === 'victory');
  const afterFinish = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(afterFinish.phase, 'between', 'legitimate movement awards victory through the engine');
  assert.equal(afterFinish.wins, 1);
  assert.match(await page.locator('#goalDetail').innerText(), /OBJETIVO CONCLUÍDO/);
  assert.equal(await page.locator('#upgradeOptions').isVisible(), true);
  assert.equal(await page.locator('#upgradeOptions button').count(), 3);
  await page.screenshot({ path: 'artifacts/preview/07-victory-upgrades.png', fullPage: true });
  await page.locator('#upgradeOptions button').first().click();
  const missionTwo = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(missionTwo.mission, 1);
  assert.equal(missionTwo.phase, 'player');
  assert.equal(missionTwo.wins, 1);
  assert.equal(Object.values(missionTwo.upgrades).reduce((a,b) => a+b,0), 1);
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-kind'), 'rescue');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-total'), '2');
  assert.match(await page.locator('#missionTitle').innerText(), /Os Nomes dos Desaparecidos/);
  await page.screenshot({ path: 'artifacts/preview/08-mission-two.png', fullPage: true });

  // M4a: tap an actual totem using the normal Phaser input path.
  // Save has valid v1 schema and is deployed using the original engine.
  const chapter3 = structuredClone(missionTwo);
  chapter3.mission = 2;
  chapter3.phase = 'brief';
  chapter3.board = null;
  chapter3.actors = null;
  await page.locator('#restart').click();
  await page.locator('#importFile').setInputFiles({
    name: 'chapter3-brief.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(chapter3)),
  });
  await page.locator('#lobby').waitFor({ state: 'hidden', timeout: 15000 });
  assert.match(await page.locator('#missionTitle').innerText(), /Totens da Servidão/);
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-kind'), 'totem');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-total'), '3');
  const importedTotems = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  const prior = importedTotems.board.find(t => t.objective === 'totem');
  prior.objective = '';
  const near = importedTotems.board[9 * 12 + 2];
  Object.assign(near, {
    base: 'grass', wall: 0, fire: 0, corrupt: 0, objective: 'totem',
    objhp: 18, cleared: false,
  });
  await page.locator('#restart').click();
  await page.locator('#importFile').setInputFiles({
    name: 'chapter3-totem-adjacent.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(importedTotems)),
  });
  await page.locator('#lobby').waitFor({ state: 'hidden', timeout: 15000 });
  const beforeStrike = await page.evaluate(() => localStorage.getItem('ironwood_phaser_preview_v1'));
  await canvas.click({ position: await cell(canvas, 2, 9) });
  assert.match(await page.locator('#actionFeedback').innerText(), /Totem atingido/);
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-completed'), '0');
  const damaged = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(damaged.board[9 * 12 + 2].objhp, 9);
  assert.notEqual(JSON.stringify(damaged), beforeStrike, 'successful attack is persisted');
  await canvas.click({ position: await cell(canvas, 2, 9) });
  const destroyedTotem = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(destroyedTotem.board[9 * 12 + 2].cleared, true);
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-completed'), '1');
  await page.screenshot({ path: 'artifacts/preview/09-totem-strike.png', fullPage: true });

  // M4b: save/load retains defeat rather than silently redeploying the map.
  // State is a valid v1 save. Retry is an explicit user gesture with all upgrades.
  const defeated = structuredClone(destroyedTotem);
  defeated.phase = 'defeat';
  defeated.losses = 2;
  defeated.actors.filter(a => a.side === 'ally').forEach(a => { a.hp = 0; });
  await page.locator('#restart').click();
  await page.locator('#importFile').setInputFiles({
    name: 'defeat-v1.json', mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify(defeated)),
  });
  await page.locator('#lobby').waitFor({ state: 'hidden', timeout: 15000 });
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-status'), 'defeat');
  assert.match(await page.locator('#resultTitle').innerText(), /A RESISTÊNCIA RECUA/);
  assert.equal(await page.locator('#retryMission').isVisible(), true);
  assert.equal(await page.locator('#endTurn').isDisabled(), true);
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')).phase), 'defeat');

  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#continueCampaign').click();
  assert.equal(await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')).phase), 'defeat',
    'continue must never auto-retry a lost campaign');
  await page.screenshot({ path: 'artifacts/preview/10-defeat.png', fullPage: true });
  await page.locator('#retryMission').click();
  const retryState = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(retryState.phase, 'player');
  assert.equal(retryState.mission, defeated.mission);
  assert.equal(retryState.losses, defeated.losses);
  assert.deepEqual(retryState.upgrades, defeated.upgrades);
  assert.deepEqual(retryState.team, defeated.team);
  assert.equal(retryState.round, 1);
  assert.equal(retryState.actors.filter(a => a.side === 'ally' && a.hp > 0).length, 3);
  assert.equal(await page.locator('#retryMission').isHidden(), true);
  assert.equal(await page.locator('#resultPanel').isHidden(), true);
  await page.screenshot({ path: 'artifacts/preview/11-retry.png', fullPage: true });

  // Three canonical endings using valid v1 completion saves. Narration and
  // thresholds come directly from Canvas renderEnding(), not an invented ruleset.
  const epilogueCases = [
    { trees: 26, rescued: 10, losses: 0, title: 'A Vitória das Cinzas', kind: 'cicatrizes' },
    { trees: 25, rescued: 5, losses: 1, title: 'A Floresta de Todos', kind: 'solidariedade' },
    { trees: 0, rescued: 0, losses: 2, title: 'A Última Chama Livre', kind: 'resistencia' },
  ];
  for (const ending of epilogueCases) {
    const finale = structuredClone(retryState);
    finale.phase = 'ending';
    finale.mission = 7;
    finale.wins = 8;
    finale.losses = ending.losses;
    finale.stats = { ...finale.stats, trees: ending.trees, rescued: ending.rescued };
    await page.locator('#restart').click();
    await page.locator('#importFile').setInputFiles({
      name: 'finale-valid-v1.json', mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(finale)),
    });
    await page.locator('#lobby').waitFor({ state: 'hidden', timeout: 15000 });
    assert.equal(await page.locator('#resultPanel').getAttribute('data-ending-kind'), ending.kind);
    assert.equal(await page.locator('#resultTitle').innerText(), ending.title);
    assert.equal(await page.locator('#resultPanel').isVisible(), true);
    assert.equal(await page.locator('#endTurn').isDisabled(), true);
    assert.equal(await page.locator('#retryMission').isHidden(), true);
    assert.match(await page.locator('#resultStats').innerText(), /Missões vencidas: 8\/8/);
  }
  await page.screenshot({ path: 'artifacts/preview/12-campaign-ending.png', fullPage: true });

  // M4c: seed is optional, validated, shown to players and reproducible.
  // No fixture or save import is used for either campaign.
  await page.locator('#restart').click();
  await page.locator('#campaignSeed').fill('4294967296');
  await page.locator('#startCampaign').click();
  assert.equal(await page.locator('#lobby').isVisible(), true);
  assert.match(await page.locator('#lobbyError').innerText(), /semente deve ser um inteiro/);
  await page.locator('#campaignSeed').fill('1');
  await page.locator('#difficulty').selectOption('story');
  const expectedTeam = ['guardian','ranger','mage'];
  for (const key of ['guardian','ranger','druid','mage','cleric','runesmith']) {
    const choice = page.locator(`[data-hero="${key}"]`);
    if (!expectedTeam.includes(key) && await choice.getAttribute('aria-pressed') === 'true') {
      await choice.click();
    }
  }
  for (const key of expectedTeam) {
    const choice = page.locator(`[data-hero="${key}"]`);
    if (await choice.getAttribute('aria-pressed') !== 'true') await choice.click();
  }
  await page.locator('#startCampaign').click();
  const seeded = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(seeded.seed, 1);
  assert.deepEqual(seeded.team, expectedTeam);
  assert.equal(seeded.difficulty, 'story');
  assert.match(await page.locator('#seedDisplay').innerText(), /Semente do mapa: 1/);
  await page.locator('#restart').click();
  await page.locator('#startCampaign').click();
  const repeated = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.deepEqual(repeated, seeded, 'identical seed/team/difficulty must generate identical fresh campaign');
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('#continueCampaign').click();
  assert.match(await page.locator('#seedDisplay').innerText(), /Semente do mapa: 1/);
  await page.screenshot({ path: 'artifacts/preview/13-m4c-seeded.png', fullPage: true });

  // M4c hard gate: ACTUAL Phaser pointer/skill/end-turn controls replay a
  // fixture-free engine victory with the same deterministic seed. Not a
  // modified snapshot, not a generated near-victory import.
  const played = playFreshMission({seed:1,team:expectedTeam,difficulty:'story'});
  assert.equal(played.state.phase,'between','reference playthrough must genuinely win');
  for (const step of played.commands) {
    await page.waitForFunction(() => document.getElementById('game')?.dataset.inputLocked === 'false');
    if (step.command === 'endTurn') {
      await page.locator('#endTurn').click();
    } else {
      const now = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
      const actor = now.actors.find(a => a.id === step.args[0]);
      assert.ok(actor && actor.hp > 0,'replay actor must remain alive');
      await canvas.click({position:await cell(canvas,actor.x,actor.y)});
      if (step.command === 'move') {
        await canvas.click({position:await cell(canvas,step.args[1],step.args[2])});
      } else if (step.command === 'attack') {
        const enemy = now.actors.find(a => a.id === step.args[1]);
        assert.ok(enemy && enemy.hp > 0,'replay target must remain alive');
        await canvas.click({position:await cell(canvas,enemy.x,enemy.y)});
      } else if (step.command === 'useSkill') {
        const skill=step.args[1], x=step.args[2], y=step.args[3];
        await page.locator(`#skills button[data-skill="${skill}"]`).click();
        await canvas.click({position:await cell(canvas,x,y)});
        if (/TOQUE NOVAMENTE/.test(await page.locator('#impactInfo').innerText())) {
          await canvas.click({position:await cell(canvas,x,y)});
        }
      } else throw new Error('Unknown replay command '+step.command);
    }
    const actual = await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
    assert.deepEqual(actual,step.checkpoint,
      'Phaser public UI diverged from the real core at '+step.command+' '+JSON.stringify(step.args));
  }
  await page.waitForFunction(() => document.getElementById('game')?.dataset.inputLocked === 'false');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-status'),'victory');
  assert.equal((await page.evaluate(() => JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')))).wins,1);
  await page.screenshot({ path: 'artifacts/preview/14-m4c-natural-victory.png', fullPage: true });
  await page.locator('#upgradeOptions button').first().click();
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-kind'),'rescue');
  assert.match(await page.locator('#missionTitle').innerText(),/Os Nomes dos Desaparecidos/);
  await page.screenshot({ path: 'artifacts/preview/15-m4c-natural-mission2.png', fullPage: true });


  // M4d contextual rescue: these are genuine core checkpoints generated
  // from victories/actions, never mutated near-goal saves. We import them
  // solely to focus the UI test on each normal interaction, not to claim a
  // continuous UI playthrough from mission 1 to mission 3.
  const rescuedRun = (() => {
    for(let seed=1;seed<=32;seed++) {
      const trial=playSecondMission({seed:seed,team:expectedTeam,difficulty:'story',maxRounds:24});
      if(trial.phase==='between')return trial;
    }
    throw new Error('M4d lacks a natural second mission victory');
  })();
  const rescueSteps = rescuedRun.commands
    .map((step,i)=>({step,i}))
    .filter(({step})=>step.command==='useSkill' && step.args[1]==='interact');
  assert.equal(rescueSteps.length,2,'test policy must rescue exactly two captives');
  for(const {step,i} of rescueSteps) {
    const before=i===0 ? rescuedRun.initial : rescuedRun.commands[i-1].checkpoint;
    const actor=before.actors.find(a=>a.id===step.args[0]);
    assert.ok(actor && actor.hp>0 && actor.ap>0);
    const [x,y]=step.args.slice(2);
    assert.ok(Math.abs(actor.x-x)+Math.abs(actor.y-y)<=1,'test target must be adjacent');
    await page.locator('#restart').click();
    await page.locator('#importFile').setInputFiles({
      name:'natural-rescue-checkpoint-v1.json',
      mimeType:'application/json',
      buffer:Buffer.from(JSON.stringify(before)),
    });
    await page.locator('#lobby').waitFor({state:'hidden',timeout:15000});
    // If the imported save already selects the rescuer, clicking the hero
    // standing on the captive would itself perform the contextual rescue.
    // An ally who is not selected still receives one selection tap first.
    if (before.selected !== actor.id) {
      await canvas.click({position:await cell(canvas,actor.x,actor.y)});
    }
    const beforeTap=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
    assert.deepEqual(beforeTap,before,'selecting a rescuer should not mutate saved battle state');
    await canvas.click({position:await cell(canvas,x,y)});
    const afterTap=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
    assert.deepEqual(afterTap,step.checkpoint,'one tap must reproduce authoritative interact including RNG and AP');
    assert.match(await page.locator('#actionFeedback').innerText(),/Prisioneiro libertado/);
    assert.equal(afterTap.board.filter(t=>t.objective==='captive'&&!t.cleared).length,
      before.board.filter(t=>t.objective==='captive'&&!t.cleared).length-1);
    if(afterTap.phase==='between') {
      assert.equal(afterTap.wins,2);
      assert.equal(await page.locator('#upgradeOptions').isVisible(),true);
      await page.screenshot({path:'artifacts/preview/16-m4d-rescue-complete.png',fullPage:true});
      await page.locator('#upgradeOptions button').first().click();
      assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-kind'),'totem');
      assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-total'),'3');
      await page.screenshot({path:'artifacts/preview/17-m4d-third-mission.png',fullPage:true});
    }
  }


  // M4e: all three totems are destroyed by actual player clicks and spells.
  // Starting state was earned from real missions 1 and 2, not manipulated.
  // This browser scenario focuses on mission 3: the preceding two victories
  // are verified by the separate natural-progression headless CI.
  const thirdRun=playThirdMission({seed:1,team:expectedTeam,difficulty:'story'});
  assert.equal(thirdRun.phase,'between','third mission must be genuinely winnable');
  assert.equal(thirdRun.initial.wins,2,'first two missions must be won before test begins');
  assert.equal(thirdRun.initial.board.filter(t=>t.objective==='totem'&&!t.cleared).length,3);
  await page.locator('#restart').click();
  await page.locator('#importFile').setInputFiles({
    name:'natural-third-mission-start-v1.json',
    mimeType:'application/json',
    buffer:Buffer.from(JSON.stringify(thirdRun.initial)),
  });
  await page.locator('#lobby').waitFor({state:'hidden',timeout:15000});
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-kind'),'totem');
  assert.equal(await page.locator('#totemStatus').getAttribute('data-remaining'),'3');
  assert.equal((await page.locator('#totemStatus').innerText()).match(/18\/18 integridade/g)?.length,3);
  await page.screenshot({path:'artifacts/preview/18-m4e-three-totems.png',fullPage:true});
  const importM4eState=async value=>{
    await page.locator('#restart').click();
    await page.locator('#importFile').setInputFiles({
      name:'naturally-earned-round-checkpoint-v1.json',
      mimeType:'application/json',
      buffer:Buffer.from(JSON.stringify(value)),
    });
    await page.locator('#lobby').waitFor({state:'hidden',timeout:15000});
  };
  // M4e cross-runtime note: original enemy AI shuffles with a random
  // Array.sort comparator, whose order/call count is not specified by JS.
  // Node and Chromium can diverge AFTER a turn even from the same RNG state.
  // Verify the combat actions *exactly* within each player round, then use
  // the authentic Node checkpoint for the next round. Test browser-to-browser
  // save/reload determinism separately without concealing this limitation.
  let browserTurnChecks=0;
  for(const step of thirdRun.commands) {
    await page.waitForFunction(()=>document.getElementById('game')?.dataset.inputLocked==='false');
    if(step.command==='endTurn') {
      const beforeTurn=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
      await page.locator('#endTurn').click();
      const browserResult=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
      assert.equal(browserResult.round,step.checkpoint.round);
      assert.equal(browserResult.phase,step.checkpoint.phase);
      // Same browser, same RNG checkpoint: an exported turn must replay
      // identically after import (within one JS engine/runtime).
      await importM4eState(beforeTurn);
      await page.locator('#endTurn').click();
      const repeated=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
      assert.deepEqual(repeated,browserResult,'Chromium turn should survive save/import deterministically');
      // Continue with *genuine* headless state, not fabricated positions,
      // and verify each later player command against its real checkpoint.
      await importM4eState(step.checkpoint);
      browserTurnChecks++;
      continue;
    }
    const current=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
    const actor=current.actors.find(a=>a.id===step.args[0]);
    assert.ok(actor&&actor.hp>0,'M4e replay needs a living hero '+step.args[0]);
    if(!(await page.locator('#unitName').innerText()).includes(actor.name)){
      await canvas.click({position:await cell(canvas,actor.x,actor.y)});
    }
    if(step.command==='move'){
      await canvas.click({position:await cell(canvas,step.args[1],step.args[2])});
    }else if(step.command==='attackObjective'){
      await canvas.click({position:await cell(canvas,step.args[1],step.args[2])});
    }else if(step.command==='attack'){
      const enemy=current.actors.find(a=>a.id===step.args[1]);
      assert.ok(enemy&&enemy.hp>0);
      await canvas.click({position:await cell(canvas,enemy.x,enemy.y)});
    }else if(step.command==='useSkill'){
      const [_,skill,x,y]=step.args;
      await page.locator(`#skills button[data-skill="${skill}"]`).click();
      await canvas.click({position:await cell(canvas,x,y)});
      if(/TOQUE NOVAMENTE/.test(await page.locator('#impactInfo').innerText())){
        await canvas.click({position:await cell(canvas,x,y)});
      }
    }else throw new Error('Unexpected M4e command '+step.command);
    const actual=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
    assert.deepEqual(actual,step.checkpoint,
      'M4e player command diverged at '+step.command+' '+JSON.stringify(step.args));
    const remaining=actual.board.filter(t=>t.objective==='totem'&&!t.cleared).length;
    assert.equal(await page.locator('#totemStatus').getAttribute('data-remaining'),String(remaining));
    if(step.command==='attackObjective'||step.command==='useSkill'){
      const list=actual.board.filter(t=>t.objective==='totem').sort((a,b)=>a.y-b.y||a.x-b.x);
      const text=await page.locator('#totemStatus').innerText();
      for(const [index,t] of list.entries()){
        assert.ok(text.includes(`Totem ${index+1} (${t.x+1},${t.y+1}): ${t.cleared?'DESTRUÍDO':t.objhp+'/18 integridade'}`));
      }
    }
  }
  assert.ok(browserTurnChecks>=1,'at least one complete enemy turn should be checked twice');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-status'),'victory');
  assert.equal(await page.locator('#totemStatus').getAttribute('data-remaining'),'0');
  assert.equal(await page.locator('#goalPanel').getAttribute('data-goal-completed'),'3');
  await page.screenshot({path:'artifacts/preview/19-m4e-three-totems-destroyed.png',fullPage:true});
  await page.locator('#upgradeOptions button').first().click();
  assert.match(await page.locator('#missionTitle').innerText(),/A Noite Mais Longa/);
  const mission4=await page.evaluate(()=>JSON.parse(localStorage.getItem('ironwood_phaser_preview_v1')));
  assert.equal(mission4.mission,3);
  assert.equal(mission4.wins,3);
  await page.screenshot({path:'artifacts/preview/20-m4e-mission-four.png',fullPage:true});

  assert.deepEqual(errors, [], 'Phaser should not throw browser errors');
  console.log('PASS: M4e player-round totem replay and browser reload determinism, fourth mission, M4d contextual natural rescue checkpoints and mission three, M4c fixture-free Phaser victory to mission 2 and seed replay, core parity, M4b defeat/retry/three endings, M4a totem attacks, M3g goals/victory/upgrades/mission2, M3f cache, HUD, tween lock, pooled units, AOE, mobile');
} finally {
  await browser.close();
}
